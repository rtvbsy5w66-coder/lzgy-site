const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('../config/env');

// Create rate limiters for each service
const rateLimiters = {
  here: new RateLimiterMemory({
    keyGenerator: () => 'here_api',
    points: config.RATE_LIMIT.HERE_DAILY, // requests per day
    duration: 86400, // 24 hours in seconds
  }),
  
  mapbox: new RateLimiterMemory({
    keyGenerator: () => 'mapbox_api', 
    points: config.RATE_LIMIT.MAPBOX_DAILY,
    duration: 86400,
  }),
  
  nominatim: new RateLimiterMemory({
    keyGenerator: () => 'nominatim_api',
    points: 1, // 1 request per second
    duration: 1,
  })
};

// Usage tracking for monitoring
const usageStats = {
  here: { used: 0, limit: config.RATE_LIMIT.HERE_DAILY },
  mapbox: { used: 0, limit: config.RATE_LIMIT.MAPBOX_DAILY },
  nominatim: { used: 0, limit: 3600 } // per hour
};

// Reset daily stats at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    usageStats.here.used = 0;
    usageStats.mapbox.used = 0;
    console.log('📊 Daily rate limits reset');
  }
}, 60000); // Check every minute

// Helper function to check if service is available
const isServiceAvailable = (serviceName) => {
  const stats = usageStats[serviceName];
  return stats.used < stats.limit;
};

// Helper function to consume rate limit and track usage
const consumeLimit = async (serviceName) => {
  if (!isServiceAvailable(serviceName)) {
    throw new Error(`${serviceName} rate limit exceeded`);
  }
  
  await rateLimiters[serviceName].consume(`${serviceName}_api`);
  usageStats[serviceName].used++;
  
  console.log(`📈 ${serviceName}: ${usageStats[serviceName].used}/${usageStats[serviceName].limit} used`);
};

module.exports = {
  rateLimiters,
  usageStats,
  isServiceAvailable,
  consumeLimit
};