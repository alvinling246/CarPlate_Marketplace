import React, { createContext, useContext, useState, useEffect } from 'react';
import { plateService } from '../services/api.js';

const PlateContext = createContext(undefined);

export function PlateProvider({ children }) {
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load plates from API on mount
  useEffect(() => {
    loadPlates();
  }, []);

  const loadPlates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plateService.getPlates();
      setPlates(data);
    } catch (err) {
      console.error('Error loading plates:', err);
      setError(err.message);
      // Fallback to empty array if API fails
      setPlates([]);
    } finally {
      setLoading(false);
    }
  };

  const addPlate = async (plate) => {
    try {
      const newPlate = await plateService.addPlate(plate);
      // Reload plates to get updated list from server
      await loadPlates();
      return newPlate;
    } catch (err) {
      console.error('Error adding plate:', err);
      throw err;
    }
  };

  const updatePrice = async (id, newPrice) => {
    try {
      await plateService.updatePrice(id, newPrice);
      // Reload plates to get updated data
      await loadPlates();
    } catch (err) {
      console.error('Error updating price:', err);
      throw err;
    }
  };

  const markSold = async (id) => {
    try {
      await plateService.markSold(id);
      // Reload plates to get updated data
      await loadPlates();
    } catch (err) {
      console.error('Error marking as sold:', err);
      throw err;
    }
  };

  const searchPlates = async (query, category) => {
    try {
      const results = await plateService.getPlates(query, category);
      return results;
    } catch (err) {
      console.error('Error searching plates:', err);
      return [];
    }
  };

  return (
    <PlateContext.Provider value={{ 
      plates, 
      loading, 
      error,
      addPlate, 
      updatePrice, 
      markSold, 
      searchPlates,
      loadPlates 
    }}>
      {children}
    </PlateContext.Provider>
  );
}

export function usePlates() {
  const context = useContext(PlateContext);
  if (!context) {
    throw new Error('usePlates must be used within PlateProvider');
  }
  return context;
}
