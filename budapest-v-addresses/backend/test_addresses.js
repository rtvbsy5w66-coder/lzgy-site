const geocodingService = require('./src/services/geocodingService');

// Test addresses from District V (Belváros-Lipótváros)
const testAddresses = [
  // Famous landmarks and squares
  "Vörösmarty tér 7-8",
  "Erzsébet tér 4", 
  "Szabadság tér 12",
  "Szent István tér 3",
  "Roosevelt tér 5-6",
  
  // Main streets
  "Váci utca 1",
  "Váci utca 15", 
  "Váci utca 30",
  "Petőfi Sándor utca 2",
  "Petőfi Sándor utca 12",
  "Bajcsy-Zsilinszky út 12",
  "József Attila utca 1",
  "Deák Ferenc utca 15",
  "Kossuth Lajos utca 8",
  "Arany János utca 10",
  
  // Government and institutional buildings
  "Kossuth Lajos tér 1-3", // Parliament
  "Szent István körút 13", // St. Stephen's Basilica area
  "Széchenyi István tér 5-6", // Four Seasons Hotel
  "Akadémia utca 3", // Hungarian Academy of Sciences
  
  // Commercial areas
  "Váci utca 19-21", // Shopping area
  "Kristóf tér 7-8",
  "Ferenciek tere 2",
  "Károlyi Mihály utca 16",
  
  // Hotels and restaurants
  "Széchenyi István tér 2", // Gresham Palace
  "Roosevelt tér 2", // Sofitel
  "József Attila utca 4",
  
  // Edge cases for testing
  "Váci utca 100", // Should fail - doesn't exist
  "Nonexistent street 1", // Should fail completely
  "Vaci utca 1", // Typo test
  "Vörösmarty", // Incomplete address
];

// Results tracking
const results = {
  total: 0,
  successful: 0,
  failed: 0,
  cached: 0,
  services_used: {},
  errors: [],
  timing: {
    start: null,
    end: null,
    duration: 0
  }
};

async function runTests() {
  console.log('🧪 Testing Budapest V. district address geocoding...');
  console.log('='.repeat(60));
  console.log(`📍 Testing ${testAddresses.length} addresses`);
  console.log(`🌍 District boundaries: 47.485-47.515 N, 19.035-19.065 E`);
  console.log('='.repeat(60));
  console.log('');
  
  results.timing.start = Date.now();
  
  for (let i = 0; i < testAddresses.length; i++) {
    const address = testAddresses[i];
    const addressNumber = i + 1;
    
    console.log(`\n📍 [${addressNumber}/${testAddresses.length}] Testing: ${address}`);
    console.log('-'.repeat(50));
    
    try {
      const startTime = Date.now();
      const result = await geocodingService.geocode(address);
      const duration = Date.now() - startTime;
      
      results.total++;
      
      if (result.success) {
        results.successful++;
        
        // Track service usage
        const source = result.source;
        results.services_used[source] = (results.services_used[source] || 0) + 1;
        
        // Track cache usage
        if (result.cached) {
          results.cached++;
        }
        
        console.log(`✅ SUCCESS (${duration}ms)`);
        console.log(`   Source: ${source}${result.cached ? ' (CACHE)' : ''}`);
        console.log(`   Address: ${result.data.formatted_address}`);
        console.log(`   Coordinates: ${result.data.latitude.toFixed(6)}, ${result.data.longitude.toFixed(6)}`);
        console.log(`   Postal Code: ${result.data.postal_code || 'N/A'}`);
        console.log(`   Confidence: ${(result.data.confidence * 100).toFixed(1)}%`);
        
        // Validate coordinates are in District V
        const lat = result.data.latitude;
        const lng = result.data.longitude;
        const inDistrict = lat >= 47.485 && lat <= 47.515 && lng >= 19.035 && lng <= 19.065;
        
        if (!inDistrict) {
          console.log(`   ⚠️  WARNING: Coordinates outside District V boundaries!`);
          results.errors.push({
            address,
            error: 'Outside district boundaries',
            coordinates: { lat, lng }
          });
        }
        
      } else {
        results.failed++;
        console.log(`❌ FAILED (${duration}ms)`);
        console.log(`   Error: ${result.error}`);
        
        if (result.attempted_services) {
          console.log(`   Attempted: ${result.attempted_services.join(', ')}`);
        }
        
        results.errors.push({
          address,
          error: result.error,
          attempted_services: result.attempted_services
        });
      }
      
    } catch (error) {
      results.total++;
      results.failed++;
      console.log(`💥 EXCEPTION: ${error.message}`);
      
      results.errors.push({
        address,
        error: `Exception: ${error.message}`
      });
    }
    
    // Rate limiting delay (1.5 seconds between requests)
    if (i < testAddresses.length - 1) {
      console.log('⏳ Waiting 1.5s for rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  results.timing.end = Date.now();
  results.timing.duration = results.timing.end - results.timing.start;
  
  // Print summary
  printSummary();
}

function printSummary() {
  console.log('\n');
  console.log('🏁 TESTING COMPLETED');
  console.log('='.repeat(60));
  
  // Basic stats
  console.log('📊 RESULTS SUMMARY:');
  console.log(`   Total addresses tested: ${results.total}`);
  console.log(`   Successful geocoding: ${results.successful} (${(results.successful/results.total*100).toFixed(1)}%)`);
  console.log(`   Failed geocoding: ${results.failed} (${(results.failed/results.total*100).toFixed(1)}%)`);
  console.log(`   Cache hits: ${results.cached} (${(results.cached/results.total*100).toFixed(1)}%)`);
  console.log(`   Total duration: ${(results.timing.duration/1000).toFixed(1)}s`);
  console.log(`   Average per address: ${(results.timing.duration/results.total).toFixed(0)}ms`);
  
  // Service usage
  console.log('\n🗺️  SERVICE USAGE:');
  Object.entries(results.services_used).forEach(([service, count]) => {
    console.log(`   ${service}: ${count} requests (${(count/results.successful*100).toFixed(1)}%)`);
  });
  
  // Errors summary
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS SUMMARY:');
    const errorTypes = {};
    results.errors.forEach(err => {
      const errorType = err.error.split(':')[0];
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([errorType, count]) => {
      console.log(`   ${errorType}: ${count} occurrences`);
    });
    
    console.log('\n📝 DETAILED ERRORS:');
    results.errors.forEach(err => {
      console.log(`   • ${err.address}: ${err.error}`);
    });
  }
  
  // Performance assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  const successRate = results.successful / results.total;
  if (successRate >= 0.9) {
    console.log('   ✅ EXCELLENT: >90% success rate');
  } else if (successRate >= 0.8) {
    console.log('   👍 GOOD: 80-90% success rate');
  } else if (successRate >= 0.7) {
    console.log('   ⚠️  ACCEPTABLE: 70-80% success rate');
  } else {
    console.log('   ❌ POOR: <70% success rate - needs improvement');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.cached / results.total < 0.1) {
    console.log('   • Consider running tests multiple times to verify caching');
  }
  if (results.services_used['Nominatim'] > results.services_used['HERE']) {
    console.log('   • HERE API might not be configured - check API keys');
  }
  if (results.errors.some(e => e.error.includes('rate limit'))) {
    console.log('   • Rate limiting detected - increase delays between requests');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. Review failed addresses for potential data issues');
  console.log('   2. Verify API configurations for optimal service usage');
  console.log('   3. Consider adding more test cases for edge cases');
  console.log('   4. Monitor rate limiting in production usage');
  
  console.log('\n='.repeat(60));
  console.log('✨ Test completed successfully!');
}

// Export for use in other scripts
module.exports = { 
  testAddresses, 
  runTests,
  results 
};

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}