import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, checkLogin, saveLogin, User } from '../services/loginService';
import './Login.css';

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await fetchUsers();
      setUsers(userList);
    } catch (error) {
      setError('Kullanıcılar yüklenemedi');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !password) {
      setError('Lütfen kullanıcı ve şifre seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await checkLogin(selectedUserId, password);
      if (result && result.success) {
        saveLogin(selectedUserId, result.user?.is_admin || false);
        
        // Redirect based on user role
        if (result.user?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/manufacturing');
        }
      } else {
        setError('Geçersiz kullanıcı adı veya şifre');
      }
    } catch (error) {
      setError('Giriş yapılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-view">
        <h2>Kullanıcı Girişi</h2>

        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label htmlFor="user-select">Kullanıcı:</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading}
            >
              <option value="">Seçiniz...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="password-input">Şifre:</label>
            <input
              id="password-input"
              type="password"
              placeholder="Şifre girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading || !selectedUserId || !password}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;