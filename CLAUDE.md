# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a homework assignment for building a real-time collaborative coding interview platform as part of the DataTalksClub AI Dev Tools Zoomcamp (Week 2 - End-to-End Application Development).

**Assignment Source**: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/

## Core Requirements

The application must support:

1. **Shareable Session Links**: Generate unique URLs that candidates can use to join coding sessions
2. **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with instant synchronization
3. **Syntax Highlighting**: Support for at least JavaScript and Python
4. **Safe Code Execution**: Execute code in the browser using WASM (NOT on the server for security)
5. **Multi-user Updates**: Real-time updates visible to all connected users

## Technology Stack Recommendations

- **Frontend**: React + Vite (JavaScript recommended for easier implementation)
- **Backend**: Express.js with WebSocket support (Socket.io recommended)
- **Code Editor**: Monaco Editor, CodeMirror, or similar with syntax highlighting
- **Code Execution**: Pyodide (Python to WASM) or similar WASM compiler
- **Process Management**: Concurrently for running client and server together
- **Testing**: Integration tests for client-server interaction
- **Containerization**: Docker (single container for both frontend and backend)

Alternative: Streamlit (if preferred, but may complicate some requirements)

## Project Structure
```
hw2-coding-interview/
├── client/              # React frontend (Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/              # Express.js backend
│   ├── src/
│   │   └── server.js
│   └── package.json
├── tests/               # Integration tests
├── package.json         # Root package with scripts
├── Dockerfile           # Container configuration
├── README.md            # Setup and usage instructions
└── CLAUDE.md           # This file
```

## Required NPM Scripts

The root `package.json` must include:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run client\" \"npm run server\"",
    "client": "cd client && npm run dev",
    "server": "cd server && npm start",
    "test": "npm run test --prefix tests",
    "build": "cd client && npm run build",
    "start": "cd server && npm start"
  }
}
```

## Development Workflow

1. **Initialize Project**: Set up monorepo structure with client and server
2. **Implement Backend**: Express server with WebSocket support for real-time communication
3. **Implement Frontend**: React app with code editor and WebSocket client
4. **Add Syntax Highlighting**: Integrate editor library with multi-language support
5. **Add Code Execution**: Integrate Pyodide for Python execution in browser
6. **Write Tests**: Integration tests for client-server communication
7. **Containerize**: Create Dockerfile for deployment
8. **Deploy**: Deploy to a hosting service

## Key Implementation Details

### WebSocket Events

The application should handle these events:

- `session:create` - Create new coding session
- `session:join` - Join existing session by ID
- `code:change` - Broadcast code changes to all users
- `user:connect` - Track connected users
- `user:disconnect` - Handle user disconnections

### Security Requirements

- **CRITICAL**: Code execution must happen ONLY in the browser via WASM
- Never execute user code on the server
- Validate session IDs
- Handle malicious input gracefully

### Testing Requirements

Write integration tests that verify:
- Session creation and joining flow
- Real-time code synchronization between multiple clients
- Code execution functionality
- WebSocket connection handling and reconnection
- Error handling for disconnections

### Containerization

- Use a single Dockerfile for both frontend and backend
- Serve frontend static files from Express in production
- Expose appropriate ports
- Include proper process management for running both services

## Homework Deliverables

For homework submission, ensure:

1. ✅ Code committed to GitHub in `02-coding-interview/` folder
2. ✅ README.md with setup, run, and test commands
3. ✅ Integration tests passing
4. ✅ Dockerfile working and tested
5. ✅ Application deployed (note service used)
6. ✅ Document all commands and libraries used

## Homework Questions to Answer

While developing, document:

1. **Q1**: Initial prompt used to start implementation
2. **Q2**: Command to run integration tests
3. **Q3**: Command in package.json for `npm dev`
4. **Q4**: Library used for syntax highlighting
5. **Q5**: Library used for compiling Python to WASM
6. **Q6**: Base image used in Dockerfile
7. **Q7**: Service used for deployment

## Git Workflow

Commit regularly with meaningful messages:
- After setting up project structure
- After implementing each major feature
- After adding tests
- After containerization
- Before and after deployment

## Optional Enhancements

Consider adding:
- User cursors/presence indicators
- Code execution history
- Session persistence (database)
- Authentication
- Multiple file support
- Language selection UI
- Execution output formatting

## Resources

- DataTalks Club Zoomcamp: https://github.com/DataTalksClub/ai-dev-tools-zoomcamp/
- Homework Submission: https://courses.datatalks.club/ai-dev-tools-2025/homework/hw2