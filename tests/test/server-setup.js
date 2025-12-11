const { spawn } = require('child_process');
const http = require('http');

let serverProcess = null;

const startServer = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting test server...');

    serverProcess = spawn('node', ['../server/src/server.js'], {
      stdio: 'pipe',
      env: { ...process.env, PORT: '3002' }
    });

    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Server output:', data.toString());
      if (output.includes('Server running on port')) {
        setTimeout(resolve, 1000); // Give server extra time to fully start
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Server exited with code ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!output.includes('Server running on port')) {
        serverProcess.kill();
        reject(new Error('Server failed to start within timeout'));
      }
    }, 10000);
  });
};

const stopServer = () => {
  if (serverProcess) {
    console.log('Stopping test server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
};

const waitForServer = (port = 3002) => {
  return new Promise((resolve, reject) => {
    const maxAttempts = 20;
    let attempts = 0;

    const checkServer = () => {
      attempts++;

      const req = http.get(`http://localhost:${port}/health`, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retryOrFail();
        }
      });

      req.on('error', () => {
        retryOrFail();
      });

      req.setTimeout(1000, () => {
        req.destroy();
        retryOrFail();
      });
    };

    const retryOrFail = () => {
      if (attempts >= maxAttempts) {
        reject(new Error('Server not responding after maximum attempts'));
      } else {
        setTimeout(checkServer, 500);
      }
    };

    checkServer();
  });
};

if (require.main === module) {
  startServer()
    .then(() => waitForServer())
    .then(() => {
      console.log('✅ Test server is ready on port 3002');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to start test server:', error);
      process.exit(1);
    });
}

module.exports = { startServer, stopServer, waitForServer };