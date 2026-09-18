/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state lazily from localStorage to avoid synchronous renders in useEffect
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nexus_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync profile data from server on load if token exists
  useEffect(() => {
    if (!token) return;
    getMe()
      .then((res) => {
        if (res.success && res.user) {
          const userObj = {
            id: res.user.id || res.user._id,
            name: res.user.user_name,
            email: res.user.email,
            lastLogin: res.user.lastLogin || null,
            lastSeen: res.user.lastSeen || null,
          };
          localStorage.setItem('nexus_user', JSON.stringify(userObj));
          setUser(userObj);
        }
      })
      .catch((err) => {
        console.warn('Failed to refresh profile via getMe:', err.message);
      });
  }, [token]);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.success && res.token && res.user) {
        const userObj = {
          id: res.user.id || res.user._id,
          name: res.user.user_name,
          email: res.user.email,
          lastLogin: res.user.lastLogin || null,
          lastSeen: res.user.lastSeen || null,
        };

        localStorage.setItem('nexus_token', res.token);
        localStorage.setItem('nexus_user', JSON.stringify(userObj));

        setToken(res.token);
        setUser(userObj);
        return { success: true };
      }
      return { success: false, error: res.message || 'Authentication failed' };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Authentication failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required' };
    }

    setLoading(true);
    try {
      const res = await registerUser(name, email, password);
      if (res.success) {
        return { success: true };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
