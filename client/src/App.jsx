import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import CodeEditor from './components/CodeEditor';
import CodeExecutor from './components/CodeExecutor';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [code, setCode] = useState('// Welcome to the coding interview\\n// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [sessionJoined, setSessionJoined] = useState(false);

  // Check for session in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');

    if (urlSessionId) {
      setSessionId(urlSessionId);
      // Don't set sessionJoined=true here - wait for server response
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    // Use the current origin for Socket.io connection in production
    const socketUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:3001';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Handle socket events
    newSocket.on('session:created', ({ sessionId }) => {
      setSessionId(sessionId);
      setSessionJoined(true);
      setIsLoading(false);
    });

    // If we have a session ID from URL, join it after connection
    newSocket.on('connect', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session');

      if (urlSessionId) {
        setIsLoading(true);
        newSocket.emit('session:join', { sessionId: urlSessionId });
      }
    });

    newSocket.on('session:state', ({ code: sessionCode, language: sessionLanguage, users }) => {
      setCode(sessionCode);
      setLanguage(sessionLanguage);
      setConnectedUsers(users);
      setSessionJoined(true);
      setIsLoading(false);
    });

    newSocket.on('code:changed', ({ code: newCode, language: newLanguage }) => {
      setCode(newCode);
      setLanguage(newLanguage);
    });

    newSocket.on('user:joined', ({ user }) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    newSocket.on('user:left', ({ userId }) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    });

    newSocket.on('error', ({ message }) => {
      alert(`Error: ${message}`);
      setIsLoading(false);
    });

    return () => newSocket.close();
  }, []);

  const createNewSession = () => {
    setIsLoading(true);
    socket?.emit('session:create');
  };

  const joinSession = () => {
    const inputSessionId = prompt('Enter session ID:');
    if (inputSessionId) {
      setIsLoading(true);
      setSessionId(inputSessionId);
      socket?.emit('session:join', { sessionId: inputSessionId });
      // Don't set sessionJoined=true here - wait for server response
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket?.emit('code:change', { code: newCode, language });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socket?.emit('code:change', { code, language: newLanguage });
  };

  const handleCursorChange = (position) => {
    socket?.emit('cursor:position', { position });
  };

  const shareSession = () => {
    if (sessionId) {
      const url = `${window.location.origin}?session=${sessionId}`;
      navigator.clipboard.writeText(url);
      alert(`Session link copied to clipboard!\n\nURL: ${url}\n\nYou can also share just the Session ID: ${sessionId}`);
    }
  };

  if (!sessionJoined) {
    return (
      <div className="landing-page">
        <div className="landing-content">
          <h1>🚀 Coding Interview Platform</h1>
          <p>Real-time collaborative coding interviews</p>
          <div className="landing-actions">
            <button
              onClick={createNewSession}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create New Session'}
            </button>
            <button
              onClick={joinSession}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Join Existing Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🚀 Coding Interview</h1>
          <div className="session-id-container">
            <span className="session-id-label">Session ID:</span>
            <span className="session-id-full">{sessionId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sessionId);
                alert('Session ID copied to clipboard!');
              }}
              className="btn btn-copy-session"
              title="Copy session ID"
            >
              📋
            </button>
          </div>
        </div>

        <div className="header-center">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-selector"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
          </select>
        </div>

        <div className="header-right">
          <span className="user-count">👥 {connectedUsers.length} users</span>
          <button onClick={shareSession} className="btn btn-share">
            🔗 Share
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="editor-section">
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={handleCodeChange}
            onCursorChange={handleCursorChange}
            height="500px"
          />
        </div>

        <div className="sidebar">
          <div className="users-panel">
            <h3>Connected Users ({connectedUsers.length})</h3>
            <div className="users-list">
              {connectedUsers.map((user, index) => (
                <div key={user.id} className="user-item">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">User {index + 1}</span>
                  <span className="user-status">●</span>
                </div>
              ))}
            </div>
          </div>

          <CodeExecutor
            code={code}
            language={language}
            onOutput={setExecutionOutput}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>🔒 Code execution happens safely in your browser using WebAssembly</p>
      </footer>
    </div>
  );
};

export default App;
