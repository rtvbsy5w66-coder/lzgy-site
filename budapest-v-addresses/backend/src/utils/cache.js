const NodeCache = require('node-cache');
const config = require('../config/env');

// Create separate caches for different types of data
const geocodeCache = new NodeCache({ 
  stdTTL: config.CACHE.GEOCODE_TTL,
  checkperiod: 3600,
  useClones: false
});

const autocompleteCache = new NodeCache({ 
  stdTTL: config.CACHE.AUTOCOMPLETE_TTL,
  checkperiod: 1800,
  useClones: false
});

// Cache statistics
let cacheStats = {
  geocode: { hits: 0, misses: 0 },
  autocomplete: { hits: 0, misses: 0 }
};

// Helper functions
const generateGeocodeKey = (address) => {
  return `geocode_${address.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
};

const generateAutocompleteKey = (query) => {
  return `autocomplete_${query.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
};

// Cache interface for geocoding
const geocodeInterface = {
  get: (address) => {
    const key = generateGeocodeKey(address);
    const result = geocodeCache.get(key);
    
    if (result) {
      cacheStats.geocode.hits++;
      console.log(`💾 Cache HIT for: ${address}`);
      return result;
    } else {
      cacheStats.geocode.misses++;
      console.log(`🔍 Cache MISS for: ${address}`);
      return null;
    }
  },
  
  set: (address, value) => {
    const key = generateGeocodeKey(address);
    geocodeCache.set(key, value);
    console.log(`💾 Cached result for: ${address}`);
  },
  
  delete: (address) => {
    const key = generateGeocodeKey(address);
    return geocodeCache.del(key);
  }
};

// Cache interface for autocomplete
const autocompleteInterface = {
  get: (query) => {
    const key = generateAutocompleteKey(query);
    const result = autocompleteCache.get(key);
    
    if (result) {
      cacheStats.autocomplete.hits++;
      return result;
    } else {
      cacheStats.autocomplete.misses++;
      return null;
    }
  },
  
  set: (query, value) => {
    const key = generateAutocompleteKey(query);
    autocompleteCache.set(key, value);
  }
};

// Cache statistics and management
const getCacheStats = () => {
  return {
    geocode: {
      ...cacheStats.geocode,
      keys: geocodeCache.keys().length,
      hitRate: cacheStats.geocode.hits / (cacheStats.geocode.hits + cacheStats.geocode.misses) || 0
    },
    autocomplete: {
      ...cacheStats.autocomplete,
      keys: autocompleteCache.keys().length,
      hitRate: cacheStats.autocomplete.hits / (cacheStats.autocomplete.hits + cacheStats.autocomplete.misses) || 0
    }
  };
};

const clearCache = () => {
  geocodeCache.flushAll();
  autocompleteCache.flushAll();
  cacheStats = {
    geocode: { hits: 0, misses: 0 },
    autocomplete: { hits: 0, misses: 0 }
  };
  console.log('🧹 Cache cleared');
};

module.exports = {
  geocode: geocodeInterface,
  autocomplete: autocompleteInterface,
  getCacheStats,
  clearCache
};