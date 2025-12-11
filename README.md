# 🚀 Coding Interview Platform

Real-time collaborative coding interview platform built with React, Node.js, and WebSockets.

## ✨ Features

- **🔗 Shareable Session Links**: Generate unique URLs that candidates can use to join coding sessions
- **⚡ Real-time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- **🎨 Syntax Highlighting**: Support for JavaScript, Python, and TypeScript with Monaco Editor
- **🔒 Safe Code Execution**: Execute code securely in the browser using WebAssembly (Pyodide for Python)
- **👥 Multi-user Support**: Real-time user presence and cursor tracking
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🧪 Integration Tests**: Comprehensive test suite for reliability

## 🏗️ Architecture

```
hw2-coding-interview/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # React components
│   │   └── App.jsx      # Main application
│   ├── dist/            # Build output
│   └── package.json
├── server/              # Express.js backend
│   ├── src/
│   │   └── server.js    # Server with WebSockets
│   └── package.json
├── tests/               # Integration tests
│   └── test/            # Test files
├── Dockerfile           # Container configuration
├── package.json         # Root package with scripts
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd hw2-coding-interview
npm run install:all
```

2. **Start development servers**:
```bash
npm run dev
```

This will start:
- Frontend server at `http://localhost:5174`
- Backend server at `http://localhost:3001`

3. **Open your browser** and navigate to `http://localhost:5174`

### Individual Commands

- **Start frontend only**: `npm run client`
- **Start backend only**: `npm run server`
- **Build for production**: `npm run build`
- **Run tests**: `npm run test`

## 🧪 Testing

### Running Integration Tests

```bash
# Run all integration tests
npm run test

# Run tests in watch mode
cd tests && npm run test:watch

# Test server setup
cd tests && npm run test:server
```

### Test Coverage

The test suite covers:
- ✅ API endpoint testing
- ✅ WebSocket communication
- ✅ Session management
- ✅ Real-time code synchronization
- ✅ Multi-user collaboration

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t coding-interview-platform .
```

### Run Container

```bash
docker run -p 3001:3001 coding-interview-platform
```

The application will be available at `http://localhost:3001`

### ☁️ Google Cloud Run Deployment (Recommended)

For production deployment with auto-scaling and CI/CD:

```bash
# Follow the complete guide in CLOUD_RUN_DEPLOYMENT.md
# Auto-deploys on git push to main branch
```

Features:
- ✅ Free tier (2M requests/month)
- ✅ Auto-scaling (0 → N instances)
- ✅ WebSockets support
- ✅ Custom domains
- ✅ Global CDN

### Docker Compose (Local Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

## 🔧 Development

### Technology Stack

**Frontend**:
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor with syntax highlighting
- **Socket.io Client** - Real-time communication
- **Pyodide** - Python to WebAssembly compiler

**Backend**:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **UUID** - Session ID generation

**Testing**:
- **Mocha** - Test framework
- **Chai** - Assertion library
- **Supertest** - HTTP testing
- **Socket.io Client** - WebSocket testing

### Environment Variables

Create `.env` file in root:

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5174
```

### Code Style

The project uses ESLint for code linting. Run with:
```bash
cd client && npm run lint
```

## 📚 API Documentation

### REST Endpoints

#### Health Check
```
GET /health
```
Returns server health status and active session count.

#### Session Info
```
GET /api/sessions/:sessionId
```
Returns session metadata (user count, language, creation time).

### WebSocket Events

#### Client to Server

- `session:create` - Create new coding session
- `session:join` - Join existing session by ID
- `code:change` - Broadcast code changes
- `cursor:position` - Update cursor position

#### Server to Client

- `session:created` - New session created with ID
- `session:state` - Current session state
- `code:changed` - Code change broadcast
- `user:joined` - User joined session
- `user:left` - User left session
- `cursor:moved` - Cursor position update
- `error` - Error message

## 🔒 Security Features

- **Client-side Code Execution**: All code execution happens in the browser using WebAssembly
- **No Server-side Processing**: User code never runs on the server
- **Session Isolation**: Each session has unique identifiers
- **Input Validation**: Session IDs and user inputs are validated

## 🚀 Deployment

### Production Build

1. **Build the application**:
```bash
npm run build
```

2. **Deploy to Google Cloud Run** (recommended with CI/CD):
```bash
# Follow the guide in CLOUD_RUN_DEPLOYMENT.md
# Auto-deploys on git push to main branch
```

3. **Deploy using Docker**:
```bash
docker build -t your-username/coding-interview-platform .
docker push your-username/coding-interview-platform
```

4. **Run on other cloud providers**:
- AWS ECS/Fargate
- Azure Container Instances
- DigitalOcean App Platform

### Manual Deployment

```bash
# Install production dependencies
npm ci --only=production

# Build client
cd client && npm run build

# Start production server
cd .. && npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3001 and 5173 are available
2. **CORS errors**: Check that client URL is properly configured
3. **WebSocket connection fails**: Verify firewall settings
4. **Build errors**: Clear node_modules and reinstall dependencies

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Professional code editor
- [Socket.io](https://socket.io/) - Real-time communication
- [Pyodide](https://pyodide.org/) - Python in WebAssembly
- [Vite](https://vitejs.dev/) - Fast build tool

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation

Happy coding! 🎉