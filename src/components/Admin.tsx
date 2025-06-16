import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUserId } from '../services/loginService';
import { fetchUsers, fetchActiveTimers, formatDuration, ActiveTimer } from '../services/adminService';
import { User } from '../services/loginService';
import './Admin.css';

const Admin: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredTimers, setFilteredTimers] = useState<ActiveTimer[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadActiveTimers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTimers();
  }, [activeTimers, selectedUser, issueFilter]);

  const loadData = async () => {
    await Promise.all([loadUsers(), loadActiveTimers()]);
  };

  const loadUsers = async () => {
    try {
      const userList = await fetchUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadActiveTimers = async () => {
    setLoading(true);
    try {
      const timers = await fetchActiveTimers();
      setActiveTimers(timers);
    } catch (error) {
      console.error('Failed to load active timers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTimers = () => {
    let filtered = activeTimers;

    if (selectedUser) {
      filtered = filtered.filter(timer => timer.user_id === selectedUser);
    }

    if (issueFilter) {
      filtered = filtered.filter(timer => 
        timer.issue_key.toLowerCase().includes(issueFilter.toLowerCase())
      );
    }

    setFilteredTimers(filtered);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    loadActiveTimers();
  };

  return (
    <div className="admin-container">
      <h1>Aktif Zamanlayıcılar</h1>
      
      <div className="top-bar">
        <span>Kullanıcı: {currentUserId}</span>
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>

      <div className="filter-controls">
        <div className="filter-row">
          <label htmlFor="user-filter">Kullanıcı:</label>
          <select
            id="user-filter"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Tümü</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <label htmlFor="issue-filter">TI No:</label>
          <input
            type="text"
            id="issue-filter"
            placeholder="Örn: 1234"
            value={issueFilter}
            onChange={(e) => setIssueFilter(e.target.value)}
          />
        </div>

        <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
          {loading ? '⟳' : '↻'} Yenile
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Issue</th>
              <th>Süre</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimers.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-data">
                  {loading ? 'Yükleniyor...' : 'Aktif zamanlayıcı bulunamadı'}
                </td>
              </tr>
            ) : (
              filteredTimers.map((timer, index) => (
                <tr key={`${timer.user_id}-${timer.issue_key}-${index}`}>
                  <td>{timer.user_name}</td>
                  <td>{timer.issue_key}</td>
                  <td className="duration-cell">
                    {formatDuration(timer.start_time)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredTimers.length > 0 && (
        <div className="summary">
          <p>Toplam aktif zamanlayıcı: {filteredTimers.length}</p>
        </div>
      )}
    </div>
  );
};

export default Admin;