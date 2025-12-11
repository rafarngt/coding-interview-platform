const { expect } = require('chai');
const request = require('supertest');
const { startServer, stopServer, waitForServer } = require('./server-setup');

const API_URL = 'http://localhost:3002';

describe('API Tests', () => {
  let server;

  before(async () => {
    try {
      await startServer();
      await waitForServer();
      console.log('✅ Server ready for API tests');
    } catch (error) {
      console.error('❌ Failed to start server for API tests:', error);
      throw error;
    }
  });

  after(async () => {
    await stopServer();
    console.log('✅ Server stopped after API tests');
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(API_URL)
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('activeSessions');
      expect(response.body).to.have.property('connectedUsers');
      expect(response.body.activeSessions).to.be.a('number');
      expect(response.body.connectedUsers).to.be.a('number');
    });
  });

  describe('Session Management', () => {
    let sessionId;

    it('should create a new session via WebSocket', (done) => {
      const io = require('socket.io-client');
      const client = io(API_URL);

      client.on('connect', () => {
        console.log('✅ Client connected for session creation');
        client.emit('session:create');
      });

      client.on('session:created', (data) => {
        expect(data).to.have.property('sessionId');
        expect(data.sessionId).to.be.a('string');
        expect(data.sessionId).to.have.lengthOf(36); // UUID length
        sessionId = data.sessionId;
        console.log('✅ Session created:', sessionId);
        client.disconnect();
        done();
      });

      client.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        client.disconnect();
        done(error);
      });
    });

    it('should retrieve session information via REST API', async () => {
      if (!sessionId) {
        throw new Error('No session ID available. Session creation test may have failed.');
      }

      const response = await request(API_URL)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(response.body).to.have.property('id', sessionId);
      expect(response.body).to.have.property('userCount');
      expect(response.body).to.have.property('language');
      expect(response.body).to.have.property('createdAt');
      expect(response.body.userCount).to.be.a('number');
      expect(response.body.language).to.be.a('string');
      expect(response.body.createdAt).to.be.a('string');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeSessionId = '00000000-0000-0000-0000-000000000000';

      const response = await request(API_URL)
        .get(`/api/sessions/${fakeSessionId}`)
        .expect(404);

      expect(response.body).to.have.property('error', 'Session not found');
    });
  });

  describe('WebSocket Communication', () => {
    let client1, client2;
    let sessionId;

    beforeEach(async () => {
      const io = require('socket.io-client');

      // Create first client and session
      client1 = io(API_URL);
      sessionId = await new Promise((resolve, reject) => {
        client1.on('connect', () => {
          client1.emit('session:create');
        });

        client1.on('session:created', (data) => {
          resolve(data.sessionId);
        });

        client1.on('error', reject);
      });

      // Connect second client
      client2 = io(API_URL);
      await new Promise((resolve) => {
        client2.on('connect', () => {
          client2.emit('session:join', { sessionId });
          resolve();
        });
      });

      // Wait for both to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterEach(() => {
      if (client1) client1.disconnect();
      if (client2) client2.disconnect();
    });

    it('should synchronize code changes between clients', (done) => {
      const testCode = 'console.log("Hello, World!");';
      let changesReceived = 0;

      client2.on('code:changed', (data) => {
        expect(data).to.have.property('code', testCode);
        expect(data).to.have.property('language', 'javascript');

        changesReceived++;
        if (changesReceived === 1) {
          done();
        }
      });

      client1.emit('code:change', { code: testCode, language: 'javascript' });
    });

    it('should handle user joining notification', (done) => {
      client1.on('user:joined', (data) => {
        expect(data).to.have.property('user');
        expect(data.user).to.have.property('id');
        expect(data.user).to.have.property('joinedAt');
        done();
      });

      // Connect a third client to trigger the join event
      const client3 = require('socket.io-client')(API_URL);
      client3.on('connect', () => {
        client3.emit('session:join', { sessionId });
      });

      // Clean up
      setTimeout(() => client3.disconnect(), 1000);
    });

    it('should handle cursor position updates', (done) => {
      const cursorPosition = { lineNumber: 5, column: 10 };

      client2.on('cursor:moved', (data) => {
        expect(data).to.have.property('userId', client1.id);
        expect(data).to.have.property('position', cursorPosition);
        done();
      });

      client1.emit('cursor:position', { position: cursorPosition });
    });
  });

  describe('Session State Management', () => {
    let client1, client2;
    let sessionId;

    beforeEach(async () => {
      const io = require('socket.io-client');

      client1 = io(API_URL);
      sessionId = await new Promise((resolve, reject) => {
        client1.on('connect', () => {
          client1.emit('session:create');
        });

        client1.on('session:created', (data) => {
          resolve(data.sessionId);
        });

        client1.on('error', reject);
      });

      // Set initial state
      client1.emit('code:change', {
        code: '// Initial code\\nfunction hello() {\\n  return "world";\\n}',
        language: 'javascript'
      });

      client2 = io(API_URL);
      await new Promise((resolve) => {
        client2.on('connect', () => {
          client2.emit('session:join', { sessionId });
        });

        client2.on('session:state', () => {
          resolve();
        });
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterEach(() => {
      if (client1) client1.disconnect();
      if (client2) client2.disconnect();
    });

    it('should provide session state to new users', (done) => {
      const client3 = require('socket.io-client')(API_URL);

      client3.on('connect', () => {
        client3.emit('session:join', { sessionId });
      });

      client3.on('session:state', (data) => {
        expect(data).to.have.property('code');
        expect(data).to.have.property('language', 'javascript');
        expect(data).to.have.property('users');
        expect(data.users).to.be.an('array');
        expect(data.code).to.include('// Initial code');
        expect(data.code).to.include('function hello()');
        client3.disconnect();
        done();
      });

      client3.on('error', (error) => {
        client3.disconnect();
        done(error);
      });
    });
  });
});