import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(undefined);

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if admin was previously authenticated
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setToken(adminToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Temporary hardcoded credentials for testing
      const ADMIN_USERNAME = 'admin';
      const ADMIN_PASSWORD = 'admin123';
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create a fake JWT token for testing
        const fakeToken = btoa(JSON.stringify({ username, exp: Date.now() + 3600000 }));
        
        setToken(fakeToken);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', fakeToken);
        return true;
      } else {
        throw new Error('Invalid username or password');
      }
      
      // Original API call (commented out for now)
      /*
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { token: jwtToken } = data;
      
      setToken(jwtToken);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', jwtToken);
      
      return true;
      */
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  // Helper function to get auth headers for API calls
  const getAuthHeaders = () => {
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAuthenticated, 
      loading, 
      login, 
      logout, 
      token,
      getAuthHeaders 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
