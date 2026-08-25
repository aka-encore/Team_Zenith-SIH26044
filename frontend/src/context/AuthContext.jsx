import React, { createContext, useState, useEffect, useContext } from 'react';


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);


  // Initialize auth state from local storage on load
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clean up corrupted storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);


  // Login handler - Sends credentials to backend /api/auth/login
  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setToken(data.token);
      setUser(data.user);

      return { success: true, message: data.message };

    } catch (error) {
      console.error('Login action error:', error.message);
      return { success: false, message: error.message };

    } finally {
      setLoading(false);
    }
  };


  // Register handler - Sends new user data to backend /api/auth/register
  const register = async (name, email, password, role) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If the registered role is 'company', the status is 'pending' and they cannot log in immediately.
      // For active roles, login the user immediately by saving tokens.
      if (data.user && data.user.status === 'active') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }

      return { 
        success: true, 
        message: data.message, 
        isPending: data.user.status === 'pending'
      };

    } catch (error) {
      console.error('Registration action error:', error.message);
      return { success: false, message: error.message };

    } finally {
      setLoading(false);
    }
  };


  // Logout handler - Clears all stored auth data
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
