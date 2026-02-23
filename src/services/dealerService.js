const API_BASE_URL = 'http://localhost:5000/api';

export const dealerService = {
  // Dealer portal login - validate username/password against dbo.Dealers
  async login(username, password) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    try {
      const response = await fetch(`${API_BASE_URL}/dealers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password');
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Check that the backend is running on http://localhost:5000');
      }
      if (error.message) throw error;
      throw new Error('Cannot reach server. Is the backend running on http://localhost:5000?');
    }
  },

  // Add a new dealer
  async addDealer(dealerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dealers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealerData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to add dealer');
      }

      return await response.json();
    } catch (error) {
      console.error('Add dealer error:', error);
      throw error;
    }
  },

  // Get all dealers
  async getDealers() {
    try {
      const response = await fetch(`${API_BASE_URL}/dealers`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch dealers');
      }

      return await response.json();
    } catch (error) {
      console.error('Get dealers error:', error);
      throw error;
    }
  },

  // Update dealer
  async updateDealer(id, dealerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dealers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealerData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update dealer');
      }

      // 204 No Content has no body - do not parse as JSON
      if (response.status === 204) return;
      return await response.json();
    } catch (error) {
      console.error('Update dealer error:', error);
      throw error;
    }
  },

  // Delete dealer
  async deleteDealer(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/dealers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete dealer');
      }

      // 204 No Content has no body - do not parse as JSON
      if (response.status === 204) return;
      return await response.json();
    } catch (error) {
      console.error('Delete dealer error:', error);
      throw error;
    }
  },
};
