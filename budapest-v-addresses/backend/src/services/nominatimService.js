const axios = require('axios');
const config = require('../config/env');
const { consumeLimit, isServiceAvailable } = require('../utils/rateLimit');

class NominatimService {
  constructor() {
    this.baseURL = config.ENDPOINTS.NOMINATIM;
    this.userAgent = 'Budapest-V-Address-App/1.0 (contact@example.com)';
  }

  async geocode(address) {
    try {
      // Respect 1 request per second limit
      if (!isServiceAvailable('nominatim')) {
        throw new Error('Nominatim rate limit exceeded');
      }
      
      await consumeLimit('nominatim');
      
      const params = {
        q: `${address}, Budapest V. kerület, Hungary`,
        format: 'json',
        bounded: 1,
        viewbox: `${config.DISTRICT_V_BOUNDS.southwest.lng},${config.DISTRICT_V_BOUNDS.northeast.lat},${config.DISTRICT_V_BOUNDS.northeast.lng},${config.DISTRICT_V_BOUNDS.southwest.lat}`,
        addressdetails: 1,
        countrycodes: 'hu',
        limit: 1,
        dedupe: 1
      };

      console.log(`🌍 Nominatim geocoding: ${address}`);
      const response = await axios.get(`${this.baseURL}/search`, { 
        params,
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 15000 // 15 second timeout (Nominatim can be slow)
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        
        // Validate coordinates are in District V
        if (this.isInDistrictV(lat, lng)) {
          return {
            success: true,
            source: 'Nominatim',
            data: {
              formatted_address: item.display_name,
              latitude: lat,
              longitude: lng,
              postal_code: item.address?.postcode,
              street_name: item.address?.road || item.address?.pedestrian,
              house_number: item.address?.house_number,
              district: 'V. kerület',
              confidence: parseFloat(item.importance || 0.5)
            }
          };
        } else {
          return { 
            success: false, 
            source: 'Nominatim', 
            error: 'Result outside District V boundaries' 
          };
        }
      }

      return { success: false, source: 'Nominatim', error: 'No results found' };

    } catch (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, source: 'Nominatim', error: 'Rate limit exceeded' };
      }
      console.error('Nominatim error:', error.message);
      return { success: false, source: 'Nominatim', error: error.message };
    }
  }

  async reverse(lat, lng) {
    try {
      await consumeLimit('nominatim');
      
      const params = {
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        zoom: 18
      };

      console.log(`🔄 Nominatim reverse geocoding: ${lat}, ${lng}`);
      const response = await axios.get(`${this.baseURL}/reverse`, { 
        params,
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });

      if (response.data && response.data.address) {
        const item = response.data;
        
        return {
          success: true,
          source: 'Nominatim',
          data: {
            formatted_address: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            postal_code: item.address.postcode,
            street_name: item.address.road || item.address.pedestrian,
            house_number: item.address.house_number,
            district: item.address.city_district || 'V. kerület',
            confidence: parseFloat(item.importance || 0.5)
          }
        };
      }

      return { success: false, source: 'Nominatim', error: 'No reverse geocoding result' };

    } catch (error) {
      console.error('Nominatim reverse error:', error.message);
      return { success: false, source: 'Nominatim', error: error.message };
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

  // Always available (no API key required)
  isConfigured() {
    return true;
  }
}

module.exports = new NominatimService();