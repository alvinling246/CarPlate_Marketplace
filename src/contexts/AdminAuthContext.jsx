import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/api.js';

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
      const data = await adminService.login(username, password);
      const jwtToken = data?.token;
      if (!jwtToken) throw new Error('Login failed');

      setToken(jwtToken);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', jwtToken);
      
      return true;
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
