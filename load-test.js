/**
 * 🚀 AI Server Load Testing Script
 * Tests concurrent AI requests and measures performance
 */

const axios = require('axios').default;
const fs = require('fs');

// Configuration
const config = {
  // Test targets
  baseUrl: process.env.AI_SERVER_URL || 'http://localhost:3000',
  token: process.env.AI_SERVER_TOKEN || '',
  
  // Test parameters
  concurrent: 5,    // Concurrent requests
  total: 20,        // Total requests
  delay: 1000,      // Delay between batches (ms)
  timeout: 60000,   // Request timeout (ms)
  
  // Test scenarios
  scenarios: [
    {
      name: 'Simple categorization',
      prompt: 'Kategorizáld: Rossz utak a Váci úton',
      expectedTime: 20000 // ms
    },
    {
      name: 'Complex problem analysis',
      prompt: 'Nagy probléma van a helyi közlekedéssel. A buszok késnek, a parkolóhelyek tele vannak, és a kerékpárutak rossz állapotban vannak. Mit javasolsz?',
      expectedTime: 30000 // ms
    },
    {
      name: 'Short query',
      prompt: 'Mi a problémája a közvilágításnak?',
      expectedTime: 15000 // ms
    }
  ]
};

// Test statistics
const stats = {
  requests: [],
  errors: [],
  startTime: null,
  endTime: null,
  cacheHits: 0,
  cacheMisses: 0
};

/**
 * Make AI request
 */
async function makeRequest(scenario, requestId) {
  const start = Date.now();
  
  try {
    console.log(`🔄 Request ${requestId}: ${scenario.name}`);
    
    const response = await axios.post(`${config.baseUrl}/api/ai/proxy`, {
      prompt: scenario.prompt,
      model: 'mistral:7b'
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(config.token && { 'Authorization': `Bearer ${config.token}` })
      },
      timeout: config.timeout
    });
    
    const duration = Date.now() - start;
    const cached = response.data.cached || false;
    
    if (cached) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }
    
    stats.requests.push({
      id: requestId,
      scenario: scenario.name,
      duration,
      cached,
      status: response.status,
      responseLength: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString()
    });
    
    const statusIcon = cached ? '💾' : '🤖';
    const timeIcon = duration < scenario.expectedTime ? '✅' : '⚠️';
    
    console.log(`${statusIcon} ${timeIcon} Request ${requestId}: ${duration}ms ${cached ? '(cached)' : ''}`);
    
    return { success: true, duration, cached };
    
  } catch (error) {
    const duration = Date.now() - start;
    
    stats.errors.push({
      id: requestId,
      scenario: scenario.name,
      duration,
      error: error.message,
      code: error.response?.status,
      timestamp: new Date().toISOString()
    });
    
    console.log(`❌ Request ${requestId} failed: ${error.message} (${duration}ms)`);
    
    return { success: false, duration, error: error.message };
  }
}

/**
 * Run concurrent batch of requests
 */
async function runBatch(batchId, scenario) {
  console.log(`\n🚀 Starting batch ${batchId}: ${config.concurrent} concurrent "${scenario.name}" requests`);
  
  const promises = [];
  for (let i = 0; i < config.concurrent; i++) {
    const requestId = `${batchId}.${i + 1}`;
    promises.push(makeRequest(scenario, requestId));
  }
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const cached = results.filter(r => r.cached).length;
  
  console.log(`📊 Batch ${batchId} complete: ${successful}/${config.concurrent} success, avg ${Math.round(avgTime)}ms, ${cached} cached`);
  
  return results;
}

/**
 * Generate performance report
 */
function generateReport() {
  const totalTime = stats.endTime - stats.startTime;
  const totalRequests = stats.requests.length;
  const successfulRequests = stats.requests.length;
  const failedRequests = stats.errors.length;
  
  const avgResponseTime = stats.requests.reduce((sum, r) => sum + r.duration, 0) / totalRequests;
  const minResponseTime = Math.min(...stats.requests.map(r => r.duration));
  const maxResponseTime = Math.max(...stats.requests.map(r => r.duration));
  
  const cacheHitRate = (stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100;
  
  const report = {
    summary: {
      totalTime: `${totalTime}ms (${Math.round(totalTime/1000)}s)`,
      totalRequests: totalRequests + failedRequests,
      successfulRequests,
      failedRequests,
      requestsPerSecond: Math.round((totalRequests / totalTime) * 1000),
      cacheHitRate: `${Math.round(cacheHitRate)}%`
    },
    performance: {
      avgResponseTime: `${Math.round(avgResponseTime)}ms`,
      minResponseTime: `${minResponseTime}ms`,
      maxResponseTime: `${maxResponseTime}ms`,
      cacheHits: stats.cacheHits,
      cacheMisses: stats.cacheMisses
    },
    byScenario: {},
    errors: stats.errors,
    recommendations: []
  };
  
  // Group by scenario
  config.scenarios.forEach(scenario => {
    const scenarioRequests = stats.requests.filter(r => r.scenario === scenario.name);
    if (scenarioRequests.length > 0) {
      const avg = scenarioRequests.reduce((sum, r) => sum + r.duration, 0) / scenarioRequests.length;
      report.byScenario[scenario.name] = {
        count: scenarioRequests.length,
        avgTime: `${Math.round(avg)}ms`,
        expectedTime: `${scenario.expectedTime}ms`,
        withinExpected: avg <= scenario.expectedTime
      };
    }
  });
  
  // Generate recommendations
  if (avgResponseTime > 25000) {
    report.recommendations.push('⚠️ Average response time > 25s. Consider upgrading to faster GPU (A100)');
  }
  
  if (cacheHitRate < 30) {
    report.recommendations.push('💾 Cache hit rate < 30%. Consider increasing cache TTL');
  }
  
  if (failedRequests > 0) {
    report.recommendations.push(`❌ ${failedRequests} requests failed. Check server logs and timeouts`);
  }
  
  if (cacheHitRate > 60) {
    report.recommendations.push('✅ High cache hit rate. Good performance optimization!');
  }
  
  return report;
}

/**
 * Main test runner
 */
async function runLoadTest() {
  console.log('🚀 Starting AI Server Load Test');
  console.log('=====================================');
  console.log(`Target: ${config.baseUrl}`);
  console.log(`Auth: ${config.token ? 'Enabled' : 'Disabled'}`);
  console.log(`Concurrent: ${config.concurrent}`);
  console.log(`Total: ${config.total}`);
  console.log(`Scenarios: ${config.scenarios.length}`);
  console.log('');
  
  stats.startTime = Date.now();
  
  // Run tests for each scenario
  for (const scenario of config.scenarios) {
    console.log(`\n📋 Testing scenario: ${scenario.name}`);
    console.log(`Expected time: ${scenario.expectedTime}ms`);
    
    const batches = Math.ceil(config.total / config.concurrent / config.scenarios.length);
    
    for (let batch = 1; batch <= batches; batch++) {
      await runBatch(`${scenario.name.slice(0, 3)}-${batch}`, scenario);
      
      if (batch < batches) {
        console.log(`⏸️ Waiting ${config.delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
  }
  
  stats.endTime = Date.now();
  
  // Generate and display report
  console.log('\n🎯 Load Test Complete');
  console.log('====================');
  
  const report = generateReport();
  
  console.log('📊 Summary:');
  Object.entries(report.summary).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  console.log('\n⚡ Performance:');
  Object.entries(report.performance).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  console.log('\n📋 By Scenario:');
  Object.entries(report.byScenario).forEach(([scenario, data]) => {
    const icon = data.withinExpected ? '✅' : '⚠️';
    console.log(`   ${icon} ${scenario}: ${data.avgTime} (expected: ${data.expectedTime})`);
  });
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
  }
  
  if (report.errors.length > 0) {
    console.log(`\n❌ Errors (${report.errors.length}):`);
    report.errors.slice(0, 5).forEach(err => {
      console.log(`   ${err.id}: ${err.error}`);
    });
    if (report.errors.length > 5) {
      console.log(`   ... and ${report.errors.length - 5} more`);
    }
  }
  
  // Save detailed report
  const reportFile = `load-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportFile}`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  runLoadTest().catch(console.error);
}

module.exports = { runLoadTest, config };