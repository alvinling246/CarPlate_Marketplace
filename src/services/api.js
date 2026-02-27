// API service for communicating with .NET backend
const API_BASE_URL = 'http://localhost:5000/api'; // Change to https://localhost:7000 if using HTTPS

// Admin authentication service
export const adminService = {
  // Admin login
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
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
      
      return await response.json();
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },
};

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
      const mapStatus = (p) => {
        const raw = (p.status ?? p.Status ?? (p.isSold ? 'Sold' : p.isReserved ? 'Reserved' : 'Available')).toString().trim();
        const s = raw.toLowerCase();
        const status = s === 'sold' ? 'Sold' : s === 'reserved' ? 'Reserved' : 'Available';
        return { status, isSold: s === 'sold', isReserved: s === 'reserved' };
      };
      const toDateOnlyString = (val) => {
        if (val == null || val === '') return '';
        const s = (val).toString().trim();
        if (/^\d{4}-\d{2}-\d{2}(T|Z|$)/.test(s)) return s.slice(0, 10);
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return s.slice(0, 10);
        const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };
      return data.map(plate => {
        const { status, isSold, isReserved } = mapStatus(plate);
        const rawAdded = plate.addedDate ?? plate.AddedDate;
        const rawReserved = plate.reservedDate ?? plate.ReservedDate;
        const rawSold = plate.soldDate ?? plate.SoldDate;
        return {
          id: (plate.id ?? plate.Id).toString(),
          plateNumber: plate.plateNumber ?? plate.PlateNumber ?? '',
          price: plate.price ?? plate.Price ?? 0,
          status,
          isSold,
          isReserved,
          category: plate.category ?? plate.Category ?? '',
          addedDate: rawAdded ? toDateOnlyString(rawAdded) : toDateOnlyString(new Date()),
          soldReservedBy: plate.soldReservedBy ?? plate.SoldReservedBy ?? '',
          reservedDate: rawReserved ? toDateOnlyString(rawReserved) : '',
          soldDate: rawSold ? toDateOnlyString(rawSold) : '',
          contactNumber: plate.contactNumber ?? plate.ContactNumber ?? '',
          email: plate.email ?? plate.Email ?? '',
        };
      });
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
      const toDateOnlyString = (val) => {
        if (val == null || val === '') return '';
        const s = (val).toString().trim();
        if (/^\d{4}-\d{2}-\d{2}(T|Z|$)/.test(s)) return s.slice(0, 10);
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return s.slice(0, 10);
        const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      };
      const raw = (plate.status ?? plate.Status ?? (plate.isSold ? 'Sold' : plate.isReserved ? 'Reserved' : 'Available')).toString().trim();
      const s = raw.toLowerCase();
      const status = s === 'sold' ? 'Sold' : s === 'reserved' ? 'Reserved' : 'Available';
      const rawAdded = plate.addedDate ?? plate.AddedDate;
      const rawReserved = plate.reservedDate ?? plate.ReservedDate;
      const rawSold = plate.soldDate ?? plate.SoldDate;
      return {
        id: (plate.id ?? plate.Id).toString(),
        plateNumber: plate.plateNumber ?? plate.PlateNumber ?? '',
        price: plate.price ?? plate.Price ?? 0,
        status,
        isSold: s === 'sold',
        isReserved: s === 'reserved',
        category: plate.category ?? plate.Category ?? '',
        addedDate: rawAdded ? toDateOnlyString(rawAdded) : toDateOnlyString(new Date()),
        soldReservedBy: plate.soldReservedBy ?? plate.SoldReservedBy ?? '',
        reservedDate: rawReserved ? toDateOnlyString(rawReserved) : '',
        soldDate: rawSold ? toDateOnlyString(rawSold) : '',
        contactNumber: plate.contactNumber ?? plate.ContactNumber ?? '',
        email: plate.email ?? plate.Email ?? '',
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
          status: 'Available',
          category: plate.category,
          soldReservedBy: plate.soldReservedBy || null,
          reservedDate: plate.reservedDate || null,
          soldDate: plate.soldDate || null,
        }),
      });
      
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body.message || `Failed to add plate: ${response.statusText}`;
        throw new Error(message);
      }
      
      const newPlate = await response.json();
      const raw = (newPlate.status ?? newPlate.Status ?? (newPlate.isSold ? 'Sold' : newPlate.isReserved ? 'Reserved' : 'Available')).toString().trim();
      const s = raw.toLowerCase();
      const status = s === 'sold' ? 'Sold' : s === 'reserved' ? 'Reserved' : 'Available';
      return {
        id: newPlate.id.toString(),
        plateNumber: newPlate.plateNumber,
        price: newPlate.price,
        status,
        isSold: s === 'sold',
        isReserved: s === 'reserved',
        category: newPlate.category,
        addedDate: newPlate.addedDate ? newPlate.addedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        soldReservedBy: newPlate.soldReservedBy ?? '',
        reservedDate: newPlate.reservedDate ? newPlate.reservedDate.split('T')[0] : '',
        soldDate: newPlate.soldDate ? newPlate.soldDate.split('T')[0] : '',
        contactNumber: newPlate.contactNumber ?? '',
        email: newPlate.email ?? '',
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

  async updatePlate(id, payload) {
    try {
      const body = {};
      if (payload.plateNumber != null) body.plateNumber = payload.plateNumber;
      if (payload.category != null) body.category = payload.category;
      if (payload.price != null) body.price = payload.price;
      const response = await fetch(`${API_BASE_URL}/Plates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update plate: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating plate:', error);
      throw error;
    }
  },

  // Mark plate as reserved
  async markReserved(id, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/reserve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: options.dealerId ?? null,
          reservedDate: options.reservedDate || null,
          soldReservedBy: options.soldReservedBy || null,
          contactNumber: options.contactNumber || null,
          email: options.email || null,
        }),
      });
      if (!response.ok) throw new Error(`Failed to mark as reserved: ${response.statusText}`);
    } catch (error) {
      console.error('Error marking as reserved:', error);
      throw error;
    }
  },

  // Mark plate as available (clear reserved)
  async markAvailable(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/available`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to mark as available: ${response.statusText}`);
    } catch (error) {
      console.error('Error marking as available:', error);
      throw error;
    }
  },

  // Mark plate as sold
  async markSold(id, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/sold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: options.dealerId ?? null,
          soldReservedBy: options.soldReservedBy ?? null,
          contactNumber: options.contactNumber || null,
          email: options.email || null,
          soldDate: options.soldDate || null,
        }),
      });
      if (!response.ok) throw new Error(`Failed to mark as sold: ${response.statusText}`);
    } catch (error) {
      console.error('Error marking as sold:', error);
      throw error;
    }
  },

  // Delete plate (POST fallback for environments that block DELETE method)
  async deletePlate(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Plates/${id}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Failed to delete plate: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting plate:', error);
      throw error;
    }
  },
};
