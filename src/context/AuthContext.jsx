/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state lazily from localStorage to avoid synchronous renders in useEffect
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nexus_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    setLoading(true);
    try {
      // Mock login request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockToken = 'mock_jwt_token_header.payload.signature';
      const mockUser = { id: 1, name: 'John Doe', email };

      localStorage.setItem('nexus_token', mockToken);
      localStorage.setItem('nexus_user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Authentication failed' };
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
      // Mock register request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockToken = 'mock_jwt_token_header.payload.signature';
      const mockUser = { id: 1, name, email };

      localStorage.setItem('nexus_token', mockToken);
      localStorage.setItem('nexus_user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed' };
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
