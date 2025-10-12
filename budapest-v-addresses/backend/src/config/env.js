require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  HERE_API_KEY: process.env.HERE_API_KEY, // User will provide
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN, // User will provide
  
  // District V boundaries (Belváros-Lipótváros)
  DISTRICT_V_BOUNDS: {
    southwest: { lat: 47.485, lng: 19.035 },
    northeast: { lat: 47.515, lng: 19.065 }
  },
  
  // Rate limiting configuration
  RATE_LIMIT: {
    HERE_DAILY: 8300, // 250k monthly / 30 days
    MAPBOX_DAILY: 1650, // 50k monthly / 30 days
    NOMINATIM_PER_SECOND: 1
  },

  // Cache configuration
  CACHE: {
    GEOCODE_TTL: 86400, // 24 hours
    AUTOCOMPLETE_TTL: 3600 // 1 hour
  },

  // API endpoints
  ENDPOINTS: {
    HERE_GEOCODE: 'https://geocode.search.hereapi.com/v1',
    NOMINATIM: 'https://nominatim.openstreetmap.org',
    MAPBOX: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  }
};