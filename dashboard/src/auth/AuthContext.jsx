import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../api/api';
import { disconnectSocket } from '../socket/socket';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('safeworker_user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    localStorage.removeItem('safeworker_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('safeworker_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('safeworker_token')));

  useEffect(() => {
    const validateSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data.data;
        setUser(currentUser);
        localStorage.setItem('safeworker_user', JSON.stringify(currentUser));
      } catch (error) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('safeworker_token');
        localStorage.removeItem('safeworker_user');
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: jwtToken } = response.data.data;

    localStorage.setItem('safeworker_token', jwtToken);
    localStorage.setItem('safeworker_user', JSON.stringify(loggedInUser));
    setToken(jwtToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('safeworker_token');
    localStorage.removeItem('safeworker_user');
    disconnectSocket();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
