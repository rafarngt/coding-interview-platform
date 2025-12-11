# 📝 Homework 2 - Coding Interview Platform - Answers

## Preguntas Requeridas

### Q1: Initial prompt used to start implementation
```
Basándote en las especificaciones del archivo CLAUDE.md de este repositorio, necesito que desarrolles una plataforma completa de entrevistas de código colaborativa en tiempo real.

Instrucciones:
1. Lee cuidadosamente CLAUDE.md - Contiene todas las especificaciones técnicas y requisitos
2. Implementa la aplicación completa siguiendo la estructura y stack tecnológico recomendado
3. Documenta cada paso y responde las preguntas del homework sobre prompt inicial, comandos, librerías, Docker y deployment
```

### Q2: Command to run integration tests
```bash
npm run test
```

Alternative commands:
```bash
# Run from tests directory
cd tests && npm test

# Run in watch mode
cd tests && npm run test:watch
```

### Q3: Command in package.json for `npm dev`
```json
{
  "scripts": {
    "dev": "concurrently \"npm run client\" \"npm run server\""
  }
}
```

This command runs both client and server development servers concurrently:
- Frontend: `npm run client` (cd client && npm run dev) - Port 5173
- Backend: `npm run server` (cd server && npm start) - Port 3001

### Q4: Library used for syntax highlighting
**Monaco Editor** (`@monaco-editor/react` and `monaco-editor`)

- **Package**: `@monaco-editor/react` version 4.7.0
- **Package**: `monaco-editor` version 0.55.1
- **Features**: Syntax highlighting for JavaScript, Python, TypeScript, and more
- **Installation**: `npm install @monaco-editor/react monaco-editor`

### Q5: Library used for compiling Python to WASM
**Pyodide** (`pyodide` version 0.29.0)

- **Package**: `pyodide` version 0.29.0
- **CDN**: `https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js`
- **Purpose**: Python to WebAssembly compiler for safe browser-based execution
- **Installation**: `npm install pyodide`
- **Usage**: Loaded via CDN script tag in `index.html`

### Q6: Base image used in Dockerfile
**node:18-alpine**

```dockerfile
FROM node:18-alpine
```

**Reasoning for choosing node:18-alpine**:
- **Small size**: Alpine Linux is lightweight (~5MB base)
- **Security**: Minimal attack surface with fewer packages
- **Node.js 18**: LTS version with stable support
- **Production ready**: Suitable for containerized deployments

### Q7: Service used for deployment
**Docker containers** (recommended for cloud platforms)

**Deployment Options**:
1. **AWS ECS/Fargate** - Scalable container hosting
2. **Google Cloud Run** - Serverless container platform
3. **Azure Container Instances** - Simple container hosting
4. **DigitalOcean App Platform** - Easy container deployment
5. **Heroku** - Container-based deployment
6. **Railway** - Modern container hosting

**For this project**: Docker containerization provides:
- ✅ Consistent environments
- ✅ Easy scaling
- ✅ Simple deployment
- ✅ Portability across cloud providers

---

## 📋 Implementation Summary

### Technologies Used

**Frontend**:
- React 19.2.0 + Vite 7.2.4
- Monaco Editor 0.55.1 + @monaco-editor/react 4.7.0
- Socket.io Client 4.8.1
- Pyodide 0.29.0 (Python WASM)

**Backend**:
- Node.js 18
- Express.js 4.18.2
- Socket.io 4.7.4
- UUID 9.0.1

**Testing**:
- Mocha 10.8.2
- Chai 4.3.10
- Supertest 6.3.3
- Socket.io Client 4.8.1

**Development Tools**:
- Concurrently 8.2.2
- Nodemon 3.1.11

**Containerization**:
- Docker with node:18-alpine base image

### Key Features Implemented

1. ✅ **Shareable Session Links**: UUID-based session management
2. ✅ **Real-time Collaborative Editing**: WebSocket-based code synchronization
3. ✅ **Syntax Highlighting**: Monaco Editor with multi-language support
4. ✅ **Safe Code Execution**: Pyodide for Python, JavaScript sandbox for JS/TS
5. ✅ **Multi-user Updates**: Real-time presence and cursor tracking
6. ✅ **Integration Tests**: Comprehensive test suite
7. ✅ **Docker Support**: Production-ready containerization
8. ✅ **Documentation**: Complete README with setup instructions

### Security Features

- 🔒 Client-side code execution only (no server-side processing)
- 🔒 Session isolation with unique identifiers
- 🔒 Input validation and sanitization
- 🔒 CORS configuration
- 🔒 Non-root Docker user

---

*Homework completed successfully! 🎉*