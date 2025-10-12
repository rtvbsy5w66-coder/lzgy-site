const geocodingService = require('../services/geocodingService');

class GeocodingController {
  
  async geocodeSingle(req, res) {
    try {
      const { address } = req.body;
      
      // Input validation
      if (!address) {
        return res.status(400).json({ 
          success: false,
          error: 'Address is required in request body',
          example: { address: "Váci utca 1" }
        });
      }

      if (typeof address !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: 'Address must be a string'
        });
      }

      console.log(`📍 Single geocode request: ${address}`);
      const startTime = Date.now();
      
      const result = await geocodingService.geocode(address);
      
      const duration = Date.now() - startTime;
      
      // Add request metadata
      const response = {
        timestamp: new Date().toISOString(),
        input: address,
        duration_ms: duration,
        ...result
      };

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(response);

      console.log(`📍 Single geocode completed in ${duration}ms - ${result.success ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
      console.error('Single geocode error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async geocodeBatch(req, res) {
    try {
      const { addresses, options = {} } = req.body;
      
      // Input validation
      if (!addresses) {
        return res.status(400).json({ 
          success: false,
          error: 'Addresses array is required in request body',
          example: { 
            addresses: ["Váci utca 1", "Petőfi Sándor utca 2"],
            options: { delayMs: 1100, stopOnError: false }
          }
        });
      }

      if (!Array.isArray(addresses)) {
        return res.status(400).json({ 
          success: false,
          error: 'Addresses must be an array'
        });
      }

      if (addresses.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Addresses array cannot be empty'
        });
      }

      if (addresses.length > 100) {
        return res.status(400).json({ 
          success: false,
          error: 'Maximum 100 addresses per batch request',
          received: addresses.length
        });
      }

      console.log(`📦 Batch geocode request: ${addresses.length} addresses`);

      // Setup progress tracking for large batches
      let progressData = null;
      const onProgress = (progress) => {
        progressData = progress;
        if (progress.processed % 10 === 0 || progress.processed === progress.total) {
          console.log(`📊 Batch progress: ${progress.processed}/${progress.total} (${progress.percentage}%)`);
        }
      };

      const results = await geocodingService.batchGeocode(addresses, {
        ...options,
        onProgress
      });
      
      console.log(`📦 Batch geocode completed: ${results.success_count}/${results.total_processed} successful`);

      res.json({
        success: true,
        ...results
      });

    } catch (error) {
      console.error('Batch geocode error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async autocomplete(req, res) {
    try {
      const { query } = req.query;
      
      // Input validation
      if (!query) {
        return res.status(400).json({ 
          success: false,
          error: 'Query parameter is required',
          example: "/api/autocomplete?query=Váci"
        });
      }

      console.log(`🔍 Autocomplete request: ${query}`);
      const startTime = Date.now();
      
      const result = await geocodingService.autocomplete(query);
      
      const duration = Date.now() - startTime;
      
      const response = {
        timestamp: new Date().toISOString(),
        query: query,
        duration_ms: duration,
        ...result
      };

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(response);

      console.log(`🔍 Autocomplete completed in ${duration}ms - ${result.success ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
      console.error('Autocomplete error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getStatus(req, res) {
    try {
      const status = geocodingService.getServiceStatus();
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        district: 'Budapest V. kerület (Belváros-Lipótváros)',
        ...status
      });

    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async clearCache(req, res) {
    try {
      const result = geocodingService.clearCache();
      
      console.log('🧹 Cache cleared via API request');
      
      res.json({
        timestamp: new Date().toISOString(),
        ...result
      });

    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async healthCheck(req, res) {
    try {
      const status = geocodingService.getServiceStatus();
      const configuredServices = status.services.filter(s => s.configured);
      
      res.json({ 
        success: true,
        status: 'OK', 
        timestamp: new Date().toISOString(),
        district: 'Budapest V. kerület',
        configured_services: configuredServices.length,
        total_services: status.services.length,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        version: '1.0.0'
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        success: false,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new GeocodingController();