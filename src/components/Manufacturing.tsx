import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUserId } from '../services/loginService';
import { 
  fetchIssuesByFilter, 
  formatTime, 
  saveTimerState, 
  restoreTimerState,
  state,
  Issue 
} from '../services/machiningService';
import { syncServerTime } from '../services/timeService';
import './Manufacturing.css';

const Manufacturing: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'timer'>('main');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isTimerActive && state.startTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - (state.startTime || 0)) / 1000);
        setTimerDisplay(formatTime(elapsed));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive]);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm]);

  const initializeApp = async () => {
    try {
      await syncServerTime();
      await loadIssues();
      await checkRestoredTimer();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const loadIssues = async () => {
    setLoading(true);
    try {
      // Use a default filter ID - you may need to adjust this based on your JIRA setup
      const fetchedIssues = await fetchIssuesByFilter('10000');
      setIssues(fetchedIssues);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRestoredTimer = async () => {
    const restored = await restoreTimerState();
    if (restored) {
      setSelectedIssue(restored.issue);
      setIsTimerActive(true);
      setCurrentView('timer');
      state.timerActive = true;
    }
  };

  const filterIssues = () => {
    if (!searchTerm) {
      setFilteredIssues(issues);
    } else {
      const filtered = issues.filter(issue => 
        issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.fields.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredIssues(filtered);
    }
  };

  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentView('timer');
  };

  const handleStartStop = () => {
    if (!isTimerActive) {
      // Start timer
      state.startTime = Date.now();
      state.currentIssueKey = selectedIssue?.key || null;
      state.timerActive = true;
      setIsTimerActive(true);
      saveTimerState();
    } else {
      // Stop timer
      state.timerActive = false;
      state.startTime = null;
      state.currentIssueKey = null;
      setIsTimerActive(false);
      saveTimerState();
      setTimerDisplay('00:00:00');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    setCurrentView('main');
    setSelectedIssue(null);
  };

  if (currentView === 'timer' && selectedIssue) {
    return (
      <div className="manufacturing-container">
        <h1>Talaşlı İmalat İş Takip Ekranı</h1>
        <div className="top-bar">
          <span>Kullanıcı: {currentUserId}</span>
          <button onClick={handleLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>

        <div className="timer-view">
          <h2 className="task-header">{selectedIssue.key}</h2>
          <p className="task-summary">{selectedIssue.fields.summary}</p>
          
          <div className="timer-display">{timerDisplay}</div>
          
          <div className="button-group">
            <button 
              onClick={handleStartStop}
              className={`action-button ${isTimerActive ? 'red' : 'green'}`}
            >
              {isTimerActive ? 'Durdur' : 'Başlat'}
            </button>
            <button className="secondary-button">
              Süre Gir
            </button>
            <button className="secondary-button">
              Bitti Olarak İşaretle
            </button>
            <button className="danger-button">
              Sadece Durdur
            </button>
            <button onClick={handleBack} className="back-button">
              ← Geri
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manufacturing-container">
      <h1>Talaşlı İmalat İş Takip Ekranı</h1>
      <div className="top-bar">
        <span>Kullanıcı: {currentUserId}</span>
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>

      <div className="main-view">
        <input
          type="text"
          placeholder="TI No ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <ul className="task-list">
            {filteredIssues.map((issue) => (
              <li
                key={issue.key}
                onClick={() => handleIssueSelect(issue)}
                className="task-item"
              >
                <div className="task-key">{issue.key}</div>
                <div className="task-summary">{issue.fields.summary}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Manufacturing;