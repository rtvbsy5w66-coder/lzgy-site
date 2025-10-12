const express = require('express');
const cors = require('cors');
const geocodingController = require('./controllers/geocodingController');
const config = require('./config/env');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Add your production domain
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for batch requests
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`${timestamp} - ${req.method} ${req.path} - ${ip}`);
  next();
});

// Request body size validation
app.use((req, res, next) => {
  if (req.path === '/api/geocode/batch' && req.body.addresses && req.body.addresses.length > 100) {
    return res.status(413).json({
      success: false,
      error: 'Request too large: maximum 100 addresses per batch'
    });
  }
  next();
});

// API Routes
app.post('/api/geocode', geocodingController.geocodeSingle);
app.post('/api/geocode/batch', geocodingController.geocodeBatch);
app.get('/api/autocomplete', geocodingController.autocomplete);
app.get('/api/status', geocodingController.getStatus);
app.post('/api/cache/clear', geocodingController.clearCache);
app.get('/api/health', geocodingController.healthCheck);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Budapest V. Kerület Address API',
    version: '1.0.0',
    description: 'Geocoding és autocomplete szolgáltatás Budapest V. kerületéhez',
    district: 'Belváros-Lipótváros',
    endpoints: {
      'POST /api/geocode': 'Single address geocoding',
      'POST /api/geocode/batch': 'Batch address geocoding (max 100)',
      'GET /api/autocomplete?query=...': 'Address autocomplete',
      'GET /api/status': 'Service status and configuration',
      'GET /api/health': 'Health check',
      'POST /api/cache/clear': 'Clear all caches'
    },
    examples: {
      geocode: {
        method: 'POST',
        url: '/api/geocode',
        body: { address: 'Váci utca 1' }
      },
      batch: {
        method: 'POST',
        url: '/api/geocode/batch',
        body: { 
          addresses: ['Váci utca 1', 'Petőfi Sándor utca 2'],
          options: { delayMs: 1100, stopOnError: false }
        }
      },
      autocomplete: {
        method: 'GET',
        url: '/api/autocomplete?query=Váci'
      }
    },
    rate_limits: {
      HERE: '250,000/month (8,300/day)',
      MapBox: '50,000/month (1,650/day)', 
      Nominatim: '1/second'
    },
    cache_duration: {
      geocoding: '24 hours',
      autocomplete: '1 hour'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /',
      'POST /api/geocode',
      'POST /api/geocode/batch',
      'GET /api/autocomplete',
      'GET /api/status',
      'GET /api/health',
      'POST /api/cache/clear'
    ]
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Budapest V. Address API Server Started');
  console.log('==========================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗺️  District: Budapest V. kerület (Belváros-Lipótváros)`);
  console.log(`📦 Boundaries: ${JSON.stringify(config.DISTRICT_V_BOUNDS)}`);
  console.log('');
  console.log('🔧 Service Configuration:');
  console.log(`   HERE API: ${config.HERE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   MapBox API: ${config.MAPBOX_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Nominatim: ✅ Always available`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/geocode`);
  console.log(`   POST http://localhost:${PORT}/api/geocode/batch`);
  console.log(`   GET  http://localhost:${PORT}/api/autocomplete?query=...`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log('');
  
  if (!config.HERE_API_KEY && !config.MAPBOX_TOKEN) {
    console.log('⚠️  WARNING: No API keys configured!');
    console.log('   Copy .env.template to .env and add your API keys');
    console.log('   Only Nominatim will be available (limited functionality)');
    console.log('');
  }
});

module.exports = app;