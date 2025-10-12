const axios = require('axios');
const config = require('../config/env');
const { consumeLimit, isServiceAvailable } = require('../utils/rateLimit');

class MapBoxService {
  constructor() {
    this.baseURL = config.ENDPOINTS.MAPBOX;
    this.accessToken = config.MAPBOX_TOKEN;
  }

  async geocode(address) {
    try {
      if (!isServiceAvailable('mapbox')) {
        throw new Error('MapBox API rate limit exceeded');
      }
      
      await consumeLimit('mapbox');
      
      const encodedAddress = encodeURIComponent(`${address} Budapest Hungary`);
      const bbox = `${config.DISTRICT_V_BOUNDS.southwest.lng},${config.DISTRICT_V_BOUNDS.southwest.lat},${config.DISTRICT_V_BOUNDS.northeast.lng},${config.DISTRICT_V_BOUNDS.northeast.lat}`;
      
      const url = `${this.baseURL}/${encodedAddress}.json?access_token=${this.accessToken}&bbox=${bbox}&country=hu&limit=1&types=address`;
      
      console.log(`🗺️  MapBox geocoding: ${address}`);
      const response = await axios.get(url, {
        timeout: 12000 // 12 second timeout
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const lat = feature.center[1];
        const lng = feature.center[0];
        
        // Validate coordinates are in District V
        if (this.isInDistrictV(lat, lng)) {
          // Extract postal code from context
          const postalCode = feature.context?.find(c => c.id.includes('postcode'))?.text;
          
          return {
            success: true,
            source: 'MapBox',
            data: {
              formatted_address: feature.place_name,
              latitude: lat,
              longitude: lng,
              postal_code: postalCode,
              street_name: feature.text,
              house_number: feature.address,
              district: 'V. kerület',
              confidence: feature.relevance || 0.7
            }
          };
        } else {
          return { 
            success: false, 
            source: 'MapBox', 
            error: 'Result outside District V boundaries' 
          };
        }
      }

      return { success: false, source: 'MapBox', error: 'No results found' };

    } catch (error) {
      if (error.message.includes('rate limit')) {
        return { success: false, source: 'MapBox', error: 'Rate limit exceeded' };
      }
      console.error('MapBox error:', error.message);
      return { success: false, source: 'MapBox', error: error.message };
    }
  }

  async autocomplete(query) {
    try {
      if (!isServiceAvailable('mapbox')) {
        throw new Error('MapBox API rate limit exceeded');
      }
      
      await consumeLimit('mapbox');
      
      const encodedQuery = encodeURIComponent(`${query} Budapest`);
      const bbox = `${config.DISTRICT_V_BOUNDS.southwest.lng},${config.DISTRICT_V_BOUNDS.southwest.lat},${config.DISTRICT_V_BOUNDS.northeast.lng},${config.DISTRICT_V_BOUNDS.northeast.lat}`;
      
      const url = `${this.baseURL}/${encodedQuery}.json?access_token=${this.accessToken}&bbox=${bbox}&country=hu&limit=5&types=address`;
      
      console.log(`🔍 MapBox autocomplete: ${query}`);
      const response = await axios.get(url, {
        timeout: 8000
      });
      
      const suggestions = response.data.features
        .filter(feature => this.isInDistrictV(feature.center[1], feature.center[0]))
        .map(feature => ({
          title: feature.text,
          address: feature.place_name,
          position: {
            lat: feature.center[1],
            lng: feature.center[0]
          },
          type: feature.place_type[0]
        }));

      return {
        success: true,
        source: 'MapBox',
        suggestions: suggestions
      };
      
    } catch (error) {
      console.error('MapBox autocomplete error:', error.message);
      return { success: false, source: 'MapBox', error: error.message };
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
    return !!this.accessToken;
  }
}

module.exports = new MapBoxService();