// API service for communicating with .NET backend
const API_BASE_URL = 'http://localhost:5000/api'; // Change to https://localhost:7000 if using HTTPS

export const plateService = {
  // Get all plates with optional filters
  async getPlates(search = '', category = 'All Carplates') {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All Carplates') params.append('category', category);
      
      const url = params.toString() 
        ? `${API_BASE_URL}/Plates?${params}`
        : `${API_BASE_URL}/Plates`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plates: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Convert API response to frontend format
      return data.map(plate => ({
        id: plate.id.toString(),
        plateNumber: plate.plateNumber,
        price: plate.price,
        isSold: plate.isSold,
        category: plate.category,
        addedDate: plate.addedDate ? plate.addedDate.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw error;
    }
  },

  // Get single plate by ID
  async getPlate(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plate: ${response.statusText}`);
      }
      
      const plate = await response.json();
      return {
        id: plate.id.toString(),
        plateNumber: plate.plateNumber,
        price: plate.price,
        isSold: plate.isSold,
        category: plate.category,
        addedDate: plate.addedDate ? plate.addedDate.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error fetching plate:', error);
      throw error;
    }
  },

  // Add new plate
  async addPlate(plate) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plateNumber: plate.plateNumber,
          price: plate.price,
          isSold: plate.isSold || false,
          category: plate.category,
        }),
      });
      
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body.message || `Failed to add plate: ${response.statusText}`;
        throw new Error(message);
      }
      
      const newPlate = await response.json();
      return {
        id: newPlate.id.toString(),
        plateNumber: newPlate.plateNumber,
        price: newPlate.price,
        isSold: newPlate.isSold,
        category: newPlate.category,
        addedDate: newPlate.addedDate ? newPlate.addedDate.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error adding plate:', error);
      throw error;
    }
  },

  // Update plate price
  async updatePrice(id, price) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(price),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update price: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  },

  // Mark plate as sold
  async markSold(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/sold`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark as sold: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking as sold:', error);
      throw error;
    }
  },
};
