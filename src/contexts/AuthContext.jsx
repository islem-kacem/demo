import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authService.me();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login');
      await authService.login({ email, password });
      console.log('AuthContext: Login API call successful, fetching user data');
      const data = await authService.me();
      console.log('AuthContext: User data fetched', data);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('AuthContext: Login failed', error);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('AuthContext: Attempting signup');
      await authService.signup({ name, email, password });
      console.log('AuthContext: Signup API call successful, fetching user data');
      const data = await authService.me();
      console.log('AuthContext: User data fetched', data);
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('AuthContext: Signup failed', error);
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refresh = async () => {
    try {
      const data = await authService.refresh();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
