import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚨 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('🚨 API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class AddressService {
  
  // Single address geocoding
  async geocode(address) {
    try {
      const response = await api.post('/geocode', { address });
      return response.data;
    } catch (error) {
      this.handleError(error, 'geocoding');
      throw error;
    }
  }

  // Batch address geocoding
  async geocodeBatch(addresses, options = {}) {
    try {
      const response = await api.post('/geocode/batch', { 
        addresses, 
        options 
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'batch geocoding');
      throw error;
    }
  }

  // Address autocomplete
  async autocomplete(query) {
    try {
      const response = await api.get('/autocomplete', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'autocomplete');
      throw error;
    }
  }

  // Get service status
  async getStatus() {
    try {
      const response = await api.get('/status');
      return response.data;
    } catch (error) {
      this.handleError(error, 'status check');
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      this.handleError(error, 'health check');
      throw error;
    }
  }

  // Clear cache
  async clearCache() {
    try {
      const response = await api.post('/cache/clear');
      return response.data;
    } catch (error) {
      this.handleError(error, 'cache clearing');
      throw error;
    }
  }

  // Error handling helper
  handleError(error, operation) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`🚨 ${operation} failed:`, {
        status,
        error: data.error || data.message,
        details: data
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error(`🚨 ${operation} failed: No response from server`);
    } else {
      // Something else happened
      console.error(`🚨 ${operation} failed:`, error.message);
    }
  }

  // Utility: Check if address is valid for District V
  isValidDistrictVAddress(result) {
    if (!result.success || !result.data) return false;
    
    const { latitude, longitude } = result.data;
    
    // District V boundaries
    const bounds = {
      southwest: { lat: 47.485, lng: 19.035 },
      northeast: { lat: 47.515, lng: 19.065 }
    };
    
    return latitude >= bounds.southwest.lat && 
           latitude <= bounds.northeast.lat && 
           longitude >= bounds.southwest.lng && 
           longitude <= bounds.northeast.lng;
  }

  // Utility: Format address for display
  formatAddress(addressData) {
    if (!addressData) return '';
    
    const parts = [];
    
    if (addressData.street_name) {
      parts.push(addressData.street_name);
    }
    
    if (addressData.house_number) {
      parts.push(addressData.house_number);
    }
    
    if (addressData.postal_code) {
      parts.push(`(${addressData.postal_code})`);
    }
    
    return parts.join(' ');
  }

  // Utility: Get Google Maps URL
  getGoogleMapsUrl(latitude, longitude, zoom = 17) {
    return `https://www.google.com/maps/@${latitude},${longitude},${zoom}z`;
  }

  // Utility: Get OpenStreetMap URL
  getOpenStreetMapUrl(latitude, longitude, zoom = 17) {
    return `https://www.openstreetmap.org/#map=${zoom}/${latitude}/${longitude}`;
  }
}

// Export singleton instance
export default new AddressService();