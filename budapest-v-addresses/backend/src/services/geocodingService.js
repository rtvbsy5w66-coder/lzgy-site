const hereService = require('./hereService');
const nominatimService = require('./nominatimService');
const mapboxService = require('./mapboxService');
const cache = require('../utils/cache');

class GeocodingService {
  
  constructor() {
    // Service priority order (best quality first)
    this.services = [
      { name: 'HERE', service: hereService },
      { name: 'MapBox', service: mapboxService },
      { name: 'Nominatim', service: nominatimService }
    ];
  }

  async geocode(address) {
    // Input validation
    if (!address || typeof address !== 'string' || address.trim().length < 2) {
      return { 
        success: false, 
        error: 'Invalid address: must be at least 2 characters long' 
      };
    }

    const cleanAddress = address.trim();
    
    // Check cache first
    const cachedResult = cache.geocode.get(cleanAddress);
    if (cachedResult) {
      console.log(`💾 Cache hit for: ${cleanAddress}`);
      return { ...cachedResult, cached: true };
    }

    console.log(`🔍 Starting geocoding for: ${cleanAddress}`);

    // Try services in order of preference
    for (const { name, service } of this.services) {
      try {
        // Skip if service is not configured
        if (!service.isConfigured()) {
          console.log(`⚠️  ${name} not configured, skipping...`);
          continue;
        }

        console.log(`🚀 Trying ${name} for address: ${cleanAddress}`);
        const result = await service.geocode(cleanAddress);
        
        if (result.success) {
          // Cache successful result
          cache.geocode.set(cleanAddress, result);
          console.log(`✅ ${name} successful for: ${cleanAddress}`);
          
          // Add metadata
          result.cached = false;
          result.timestamp = new Date().toISOString();
          
          return result;
        } else {
          console.log(`❌ ${name} failed: ${result.error}`);
        }
      } catch (error) {
        console.error(`💥 ${name} error: ${error.message}`);
        continue;
      }
    }

    // If all services failed
    const failureResult = { 
      success: false, 
      error: 'All geocoding services failed or returned no results',
      attempted_services: this.services
        .filter(s => s.service.isConfigured())
        .map(s => s.name),
      input_address: cleanAddress,
      timestamp: new Date().toISOString()
    };

    console.log(`💀 All services failed for: ${cleanAddress}`);
    return failureResult;
  }

  async batchGeocode(addresses, options = {}) {
    const { 
      delayMs = 1100, // Default 1.1 second delay between requests
      onProgress = null,
      stopOnError = false 
    } = options;

    if (!Array.isArray(addresses)) {
      throw new Error('Addresses must be an array');
    }

    if (addresses.length > 1000) {
      throw new Error('Maximum 1000 addresses per batch');
    }

    const results = [];
    const startTime = Date.now();
    
    console.log(`📦 Starting batch geocoding for ${addresses.length} addresses`);

    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      
      try {
        // Add delay to respect rate limits (except for first request)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        const result = await this.geocode(address);
        
        const batchResult = {
          index: i,
          input_address: address,
          result: result
        };
        
        results.push(batchResult);
        
        // Progress callback
        if (onProgress) {
          onProgress({
            processed: i + 1,
            total: addresses.length,
            current: address,
            result: result,
            percentage: Math.round(((i + 1) / addresses.length) * 100)
          });
        }
        
        console.log(`📍 Processed ${i + 1}/${addresses.length}: ${address} - ${result.success ? '✅' : '❌'}`);
        
        // Stop on error if requested
        if (stopOnError && !result.success) {
          console.log(`🛑 Stopping batch on error as requested`);
          break;
        }
        
      } catch (error) {
        console.error(`💥 Batch error for address ${address}:`, error.message);
        
        results.push({
          index: i,
          input_address: address,
          result: { 
            success: false, 
            error: `Batch processing error: ${error.message}` 
          }
        });
        
        if (stopOnError) {
          break;
        }
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`🏁 Batch geocoding completed in ${duration}ms`);
    
    return {
      timestamp: new Date().toISOString(),
      total_requested: addresses.length,
      total_processed: results.length,
      duration_ms: duration,
      success_count: results.filter(r => r.result.success).length,
      failure_count: results.filter(r => !r.result.success).length,
      results: results
    };
  }

  async autocomplete(query) {
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return { 
        success: false, 
        error: 'Query must be at least 2 characters long' 
      };
    }

    const cleanQuery = query.trim();
    
    // Check cache first
    const cachedResult = cache.autocomplete.get(cleanQuery);
    if (cachedResult) {
      return { ...cachedResult, cached: true };
    }

    // Try HERE first (best autocomplete quality)
    if (hereService.isConfigured()) {
      try {
        console.log(`🔍 HERE autocomplete for: ${cleanQuery}`);
        const result = await hereService.autocomplete(cleanQuery);
        
        if (result.success) {
          cache.autocomplete.set(cleanQuery, result);
          return { ...result, cached: false };
        }
      } catch (error) {
        console.error('HERE autocomplete error:', error.message);
      }
    }

    // Fallback to MapBox
    if (mapboxService.isConfigured()) {
      try {
        console.log(`🔍 MapBox autocomplete for: ${cleanQuery}`);
        const result = await mapboxService.autocomplete(cleanQuery);
        
        if (result.success) {
          cache.autocomplete.set(cleanQuery, result);
          return { ...result, cached: false };
        }
      } catch (error) {
        console.error('MapBox autocomplete error:', error.message);
      }
    }

    return { 
      success: false, 
      error: 'Autocomplete services unavailable or failed',
      query: cleanQuery
    };
  }

  // Get service status and configuration
  getServiceStatus() {
    return {
      services: this.services.map(({ name, service }) => ({
        name,
        configured: service.isConfigured(),
        available: service.isConfigured()
      })),
      cache_stats: cache.getCacheStats()
    };
  }

  // Clear all caches
  clearCache() {
    cache.clearCache();
    return { success: true, message: 'All caches cleared' };
  }
}

module.exports = new GeocodingService();