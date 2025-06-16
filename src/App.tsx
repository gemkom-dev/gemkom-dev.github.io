import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from './services/loginService';
import { syncServerTime } from './services/timeService';
import Login from './components/Login';
import Manufacturing from './components/Manufacturing';
import Admin from './components/Admin';
import Maintenance from './components/Maintenance';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize server time sync when app starts
    syncServerTime();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isLoggedIn() ? 
                <Navigate to={isAdmin() ? "/admin" : "/manufacturing"} replace /> : 
                <Login />
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/manufacturing" 
            element={
              <ProtectedRoute>
                <Manufacturing />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/maintenance" 
            element={<Maintenance />} 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={
                  isLoggedIn() 
                    ? (isAdmin() ? "/admin" : "/manufacturing")
                    : "/login"
                } 
                replace 
              />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;