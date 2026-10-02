import { useEffect, useState } from 'react';
import { fetchHealth, type HealthStatus } from './api';
import './App.css';

export function App() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'unreachable'>('loading');
  const [healthInfo, setHealthInfo] = useState<HealthStatus | null>(null);

  const checkConnection = async () => {
    setStatus('loading');
    const result = await fetchHealth();
    if (result.ok && result.data) {
      setStatus('ok');
      setHealthInfo(result.data);
    } else {
      setStatus('unreachable');
      setHealthInfo(null);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <main className="container">
      <div className="card">
        <h1>Project Skeleton</h1>
        <p className="subtitle">ISEP Integrative Project &mdash; Base Technical Health Check</p>

        <div className={`status-indicator status-${status}`}>
          {status === 'loading' && <span className="status-badge loading">Checking backend...</span>}
          {status === 'ok' && <span className="status-badge ok" data-testid="status-ok">Backend: OK</span>}
          {status === 'unreachable' && (
            <span className="status-badge unreachable" data-testid="status-unreachable">
              Backend: unreachable
            </span>
          )}
        </div>

        {status === 'ok' && healthInfo && (
          <div className="metadata">
            <p><strong>App Version:</strong> {healthInfo.version || 'unknown'}</p>
            <p><strong>Server Time:</strong> {healthInfo.timestamp || 'N/A'}</p>
          </div>
        )}

        {status === 'unreachable' && (
          <p className="troubleshooting">
            Tip: If <em>Backend: unreachable</em> persists, check that the backend server is running and its CORS allowed origin matches this dev server (<code>http://localhost:5173</code>).
          </p>
        )}

        <button type="button" onClick={checkConnection} className="retry-btn">
          Recheck Connection
        </button>
      </div>
    </main>
  );
}

export default App;
