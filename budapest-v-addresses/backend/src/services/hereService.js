const axios = require('axios');
const config = require('../config/env');
const { consumeLimit, isServiceAvailable } = require('../utils/rateLimit');

class HereService {
  constructor() {
    this.baseURL = config.ENDPOINTS.HERE_GEOCODE;
    this.apiKey = config.HERE_API_KEY;
  }

  async geocode(address) {
    try {
      // Check if service is available and consume rate limit
      if (!isServiceAvailable('here')) {
        throw new Error('HERE API rate limit exceeded');
      }
      
      await consumeLimit('here');
      
      const params = {
        apiKey: this.apiKey,
        q: `${address}, Budapest V. kerület, Hungary`,
        in: `bbox:${config.DISTRICT_V_BOUNDS.southwest.lng},${config.DISTRICT_V_BOUNDS.southwest.lat},${config.DISTRICT_V_BOUNDS.northeast.lng},${config.DISTRICT_V_BOUNDS.northeast.lat}`,
        limit: 1
      };

      console.log(`🗺️  HERE API geocoding: ${address}`);
      const response = await axios.get(`${this.baseURL}/geocode`, { 
        params,
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        
        // Validate that result is actually in District V
        const lat = item.position.lat;
        const lng = item.position.lng;
        
        if (this.isInDistrictV(lat, lng)) {
          return {
            success: true,
            source: 'HERE',
            data: {
              formatted_address: item.address.label,
              latitude: lat,
              longitude: lng,
              postal_code: item.address.postalCode,
              street_name: item.address.street,
              house_number: item.address.houseNumber,
              district: item.address.district || 'V. kerület',
              confidence: item.scoring.queryScore || 0.8
            }
          };
        } else {
          return { 
            success: false, 
            source: 'HERE', 
            error: 'Result outside District V boundaries' 
          };
        }
      }
      
      return { success: false, source: 'HERE', error: 'No results found' };
      
    } catch (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, source: 'HERE', error: 'Rate limit exceeded' };
      }
      console.error('HERE API error:', error.message);
      return { success: false, source: 'HERE', error: error.message };
    }
  }

  async autocomplete(query) {
    try {
      if (!isServiceAvailable('here')) {
        throw new Error('HERE API rate limit exceeded');
      }
      
      await consumeLimit('here');
      
      const params = {
        apiKey: this.apiKey,
        q: query,
        in: `bbox:${config.DISTRICT_V_BOUNDS.southwest.lng},${config.DISTRICT_V_BOUNDS.southwest.lat},${config.DISTRICT_V_BOUNDS.northeast.lng},${config.DISTRICT_V_BOUNDS.northeast.lat}`,
        limit: 5
      };

      console.log(`🔍 HERE API autocomplete: ${query}`);
      const response = await axios.get(`${this.baseURL}/autosuggest`, { 
        params,
        timeout: 8000
      });
      
      const suggestions = response.data.items
        .filter(item => item.position && this.isInDistrictV(item.position.lat, item.position.lng))
        .map(item => ({
          title: item.title,
          address: item.address?.label || item.title,
          position: item.position,
          type: item.resultType
        }));

      return {
        success: true,
        source: 'HERE',
        suggestions: suggestions
      };
      
    } catch (error) {
      console.error('HERE autocomplete error:', error.message);
      return { success: false, source: 'HERE', error: error.message };
    }
  }

  // Helper method to validate coordinates are within District V
  isInDistrictV(lat, lng) {
    const bounds = config.DISTRICT_V_BOUNDS;
    return lat >= bounds.southwest.lat && 
           lat <= bounds.northeast.lat && 
           lng >= bounds.southwest.lng && 
           lng <= bounds.northeast.lng;
  }

  // Check if service is properly configured
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = new HereService();