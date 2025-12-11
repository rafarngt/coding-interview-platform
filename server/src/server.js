const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS configuration - allow all origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true  // Allow all origins in production
    : ["http://localhost:5174", "http://localhost:3001"],
  methods: ["GET", "POST"],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Store active sessions and users
const sessions = new Map();
const users = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create new session
  socket.on('session:create', () => {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      users: [],
      code: '// Welcome to the coding interview\\n// Start coding here...',
      language: 'javascript',
      createdAt: new Date()
    };

    sessions.set(sessionId, session);
    socket.join(sessionId);

    console.log('Session created:', sessionId);
    socket.emit('session:created', { sessionId });
  });

  // Join existing session
  socket.on('session:join', ({ sessionId }) => {
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    socket.join(sessionId);
    socket.sessionId = sessionId;

    // Add user to session
    const user = {
      id: socket.id,
      joinedAt: new Date()
    };

    session.users.push(user);
    users.set(socket.id, { user, sessionId });

    console.log(`User ${socket.id} joined session ${sessionId}`);

    // Notify all users in the session
    io.to(sessionId).emit('user:joined', { user });

    // Send current session state to the new user
    socket.emit('session:state', {
      code: session.code,
      language: session.language,
      users: session.users
    });
  });

  // Handle code changes
  socket.on('code:change', ({ code, language }) => {
    if (!socket.sessionId) return;

    const session = sessions.get(socket.sessionId);
    if (session) {
      session.code = code;
      session.language = language;

      // Broadcast to all users in the session except sender
      socket.to(socket.sessionId).emit('code:changed', { code, language });
    }
  });

  // Handle cursor position
  socket.on('cursor:position', ({ position }) => {
    if (!socket.sessionId) return;

    socket.to(socket.sessionId).emit('cursor:moved', {
      userId: socket.id,
      position
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const userInfo = users.get(socket.id);
    if (userInfo) {
      const { sessionId } = userInfo;
      const session = sessions.get(sessionId);

      if (session) {
        // Remove user from session
        session.users = session.users.filter(u => u.id !== socket.id);

        // Notify other users
        io.to(sessionId).emit('user:left', { userId: socket.id });

        // Clean up empty sessions (optional)
        if (session.users.length === 0) {
          sessions.delete(sessionId);
          console.log('Empty session removed:', sessionId);
        }
      }

      users.delete(socket.id);
    }
  });
});

// REST API Routes
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    userCount: session.users.length,
    language: session.language,
    createdAt: session.createdAt
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activeSessions: sessions.size,
    connectedUsers: users.size
  });
});

// Debug endpoint to check file structure
app.get('/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const clientDistPath = path.join(__dirname, '../client/dist');
    const indexPath = path.join(clientDistPath, 'index.html');

    const debug = {
      workingDir: __dirname,
      clientDistPath,
      indexPath,
      clientDistExists: fs.existsSync(clientDistPath),
      indexExists: fs.existsSync(indexPath),
      files: []
    };

    if (fs.existsSync(clientDistPath)) {
      debug.files = fs.readdirSync(clientDistPath);
    }

    res.json(debug);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Catch-all handler for React Router - serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});