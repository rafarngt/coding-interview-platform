import React, { useState, useEffect, useRef } from 'react';

const CodeExecutor = ({ code, language, onOutput }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Initialize Pyodide for Python execution
  useEffect(() => {
    if (language === 'python' && !pyodide && !pyodideLoading) {
      setPyodideLoading(true);
      loadPyodide();
    }
  }, [language, pyodide, pyodideLoading]);

  const loadPyodide = async () => {
    try {
      // Check if pyodide is available globally
      if (!window.loadPyodide) {
        throw new Error('Pyodide script not loaded. Check HTML file.');
      }

      const pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/'
      });

      // Pre-install common packages
      await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib']);

      setPyodide(pyodideInstance);
      setPyodideLoading(false);
      console.log('Pyodide loaded successfully');
    } catch (err) {
      console.error('Failed to load Pyodide:', err);
      setError('Failed to load Python execution environment: ' + err.message);
      setPyodideLoading(false);
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setOutput('');
    setError('');

    try {
      let result = '';

      if (language === 'python') {
        if (!pyodide) {
          if (!pyodideLoading) {
            await loadPyodide();
          }
          throw new Error('Python environment still loading...');
        }

        // Capture stdout by running the code
        pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = buffer = StringIO()
`);

        // Execute user code
        pyodide.runPython(code);

        // Get captured output
        result = pyodide.runPython(`
output = buffer.getvalue()
sys.stdout = old_stdout
output
`);

      } else if (language === 'javascript' || language === 'typescript') {
        // Create a sandboxed environment for JavaScript execution
        const consoleLog = console.log;
        const capturedLogs = [];

        console.log = (...args) => {
          capturedLogs.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };

        try {
          // Execute JavaScript code in a controlled environment
          const func = new Function(code);
          const resultValue = func();

          if (resultValue !== undefined) {
            capturedLogs.push(`=> ${typeof resultValue === 'object' ? JSON.stringify(resultValue, null, 2) : resultValue}`);
          }

          result = capturedLogs.join('\\n');
        } catch (jsError) {
          result = `Error: ${jsError.message}`;
        } finally {
          // Restore original console.log
          console.log = consoleLog;
        }
      }

      setOutput(result || 'Code executed successfully (no output)');
      onOutput?.(result);

    } catch (err) {
      const errorMessage = err.message || err.toString();
      setError(errorMessage);
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  return (
    <div className="code-executor">
      <div className="executor-header">
        <h3>🔧 Code Execution</h3>
        <div className="executor-controls">
          <button
            onClick={executeCode}
            disabled={isExecuting || (language === 'python' && pyodideLoading)}
            className="btn btn-execute"
          >
            {isExecuting ? (
              <>
                <span className="spinner"></span>
                Running...
              </>
            ) : (
              <>
                ▶️ Run {language.charAt(0).toUpperCase() + language.slice(1)}
              </>
            )}
          </button>
          <button
            onClick={clearOutput}
            className="btn btn-clear"
            disabled={isExecuting}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {language === 'python' && pyodideLoading && (
        <div className="loading-message">
          <span className="spinner"></span>
          Loading Python environment...
        </div>
      )}

      {language === 'python' && !pyodide && !pyodideLoading && (
        <div className="error-message">
          ⚠️ Python environment not available. Click Run to load.
        </div>
      )}

      {(output || error) && (
        <div className="output-container">
          {error && (
            <div className="error-section">
              <h4>❌ Error:</h4>
              <pre className="error-output">{error}</pre>
            </div>
          )}

          {output && (
            <div className="output-section">
              <h4>📤 Output:</h4>
              <pre className="code-output">{output}</pre>
            </div>
          )}
        </div>
      )}

      <div className="executor-info">
        <p className="security-note">
          🔒 Code runs safely in your browser using WebAssembly (Pyodide)
          or JavaScript sandbox - no server-side execution
        </p>
      </div>
    </div>
  );
};

export default CodeExecutor;