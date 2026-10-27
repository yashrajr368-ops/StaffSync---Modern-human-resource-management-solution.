import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staffsync_token'));
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('staffsync_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Failed to verify stored session, logging out:', err.message);
          localStorage.removeItem('staffsync_token');
          localStorage.removeItem('staffsync_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('staffsync_token', token);
        localStorage.setItem('staffsync_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('staffsync_token', token);
        localStorage.setItem('staffsync_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('staffsync_token');
    localStorage.removeItem('staffsync_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('staffsync_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
