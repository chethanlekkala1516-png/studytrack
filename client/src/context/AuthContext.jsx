import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setSettings(data.settings);
      return data;
    } catch (err) {
      setUser(null);
      setSettings(null);
      setStoredToken(null);
      throw err;
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const data = await authApi.getMe();
        setUser(data.user);
        setSettings(data.settings);
      } catch (err) {
        setUser(null);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.token) {
      setStoredToken(data.token);
    }
    setUser(data.user);
    if (data.settings) {
      setSettings(data.settings);
    }
    return data;
  };

  const signup = async (userData) => {
    const data = await authApi.signup(userData);
    if (data.token) {
      setStoredToken(data.token);
    }
    setUser(data.user);
    if (data.settings) {
      setSettings(data.settings);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      setSettings(null);
      setStoredToken(null);
    }
  };

  const updateUserSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        updateUserSettings,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
