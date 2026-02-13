import React, { createContext, useContext, useState } from 'react';

const PlateContext = createContext(undefined);

// Mock initial data
const initialPlates = [
  // 2 DIGIT plates (2 digit numbers only)
  { id: '2', plateNumber: 'A 88', price: 280000, isSold: false, category: '2 DIGIT', addedDate: '2024-01-20' },
  { id: '14', plateNumber: 'WE 88', price: 195000, isSold: false, category: '2 DIGIT', addedDate: '2024-02-18' },
  { id: '18', plateNumber: 'C 66', price: 175000, isSold: false, category: '2 DIGIT', addedDate: '2024-02-22' },
  
  // 3 DIGIT plates (3 digit numbers)
  { id: '4', plateNumber: 'AAA 888', price: 98000, isSold: false, category: '3 DIGIT', addedDate: '2024-02-05' },
  { id: '5', plateNumber: 'WA 168', price: 45000, isSold: false, category: '3 DIGIT', addedDate: '2024-02-08' },
  { id: '15', plateNumber: 'KL 999', price: 95000, isSold: false, category: '3 DIGIT', addedDate: '2024-02-19' },
  
  // 4 DIGIT plates (4 digit numbers)
  { id: '3', plateNumber: 'WWW 1688', price: 128000, isSold: false, category: '4 DIGIT', addedDate: '2024-02-01' },
  { id: '9', plateNumber: 'WA 1688', price: 28000, isSold: false, category: '4 DIGIT', addedDate: '2024-02-13' },
  { id: '12', plateNumber: 'MY 2024', price: 35000, isSold: false, category: '4 DIGIT', addedDate: '2024-02-16' },
  
  // CLASSIC plates
  { id: '10', plateNumber: 'ABC 123', price: 15000, isSold: false, category: 'CLASSIC', addedDate: '2024-02-14' },
  { id: '16', plateNumber: 'BOS 1', price: 65000, isSold: false, category: 'CLASSIC', addedDate: '2024-02-20' },
  { id: '17', plateNumber: 'CEO 8', price: 120000, isSold: false, category: 'CLASSIC', addedDate: '2024-02-21' },
  
  // GOLDEN NUMBER plates (single digit & repeating digits)
  { id: '1', plateNumber: 'W 1', price: 350000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-01-15' },
  { id: '8', plateNumber: 'P 9', price: 220000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-02-12' },
  { id: '11', plateNumber: 'VIP 1', price: 250000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-02-15' },
  { id: '6', plateNumber: 'KL 8888', price: 188000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-02-10' },
  { id: '7', plateNumber: 'JHR 888', price: 58000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-02-11' },
  { id: '13', plateNumber: 'WA 6666', price: 75000, isSold: false, category: 'GOLDEN NUMBER', addedDate: '2024-02-17' },
];

export function PlateProvider({ children }) {
  const [plates, setPlates] = useState(initialPlates);

  const addPlate = (plate) => {
    const newPlate = {
      ...plate,
      id: Date.now().toString(),
      addedDate: new Date().toISOString().split('T')[0],
    };
    setPlates([newPlate, ...plates]);
  };

  const updatePrice = (id, newPrice) => {
    setPlates(plates.map(plate => 
      plate.id === id ? { ...plate, price: newPrice } : plate
    ));
  };

  const markSold = (id) => {
    setPlates(plates.map(plate => 
      plate.id === id ? { ...plate, isSold: true } : plate
    ));
  };

  const searchPlates = (query, category) => {
    let filtered = plates.filter(p => !p.isSold);
    
    // Filter by category
    if (category && category !== 'All Carplates') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(plate => 
        plate.plateNumber.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filtered;
  };

  return (
    <PlateContext.Provider value={{ plates, addPlate, updatePrice, markSold, searchPlates }}>
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
