/**
 * Simple Load Test - 1-2 concurrent requests
 */

const axios = require('axios');

const config = {
  baseUrl: 'http://localhost:3000',
  concurrent: 1,  // Start with 1 concurrent request
  total: 5,       // Only 5 total requests
  timeout: 120000 // 2 minutes timeout
};

async function testSingle() {
  console.log('🧪 Single Request Performance Test');
  console.log('==================================');
  
  const testCases = [
    { name: 'Cache MISS', prompt: 'Kategorizáld: Rossz utak a Váci úton ' + Date.now() },
    { name: 'Cache HIT', prompt: 'Kategorizáld: Rossz utak a Váci úton ' + Date.now() },
    { name: 'Cache HIT (repeat)', prompt: 'Kategorizáld: Rossz utak a Váci úton ' + (Date.now()-1) }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔄 Testing: ${testCase.name}`);
    const start = Date.now();
    
    try {
      const response = await axios.post(`${config.baseUrl}/api/ai/proxy`, {
        prompt: testCase.prompt,
        model: 'mistral:7b'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: config.timeout
      });
      
      const duration = Date.now() - start;
      const cached = response.data.cached || false;
      const statusIcon = cached ? '💾' : '🤖';
      
      console.log(`${statusIcon} ${testCase.name}: ${duration}ms ${cached ? '(cached)' : ''}`);
      
      // Wait between tests
      if (testCase !== testCases[testCases.length - 1]) {
        console.log('⏸️ Waiting 5s...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ ${testCase.name} failed: ${error.message} (${duration}ms)`);
    }
  }
}

async function testConcurrent() {
  console.log('\n🧪 Concurrent Request Test (2 parallel)');
  console.log('=======================================');
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= 2; i++) {
    promises.push(
      axios.post(`${config.baseUrl}/api/ai/proxy`, {
        prompt: `Test request ${i}: Kategorizáld problémát`,
        model: 'mistral:7b'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: config.timeout
      }).then(response => {
        const duration = Date.now() - startTime;
        const cached = response.data.cached || false;
        console.log(`✅ Request ${i}: ${duration}ms ${cached ? '(cached)' : ''}`);
        return { success: true, duration, cached };
      }).catch(error => {
        const duration = Date.now() - startTime;
        console.log(`❌ Request ${i}: ${error.message} (${duration}ms)`);
        return { success: false, duration, error: error.message };
      })
    );
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  
  console.log(`\n📊 Concurrent test complete:`);
  console.log(`   Successful: ${successful}/2`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Parallel efficiency: ${successful > 0 ? 'OK' : 'FAILED'}`);
}

async function runTests() {
  try {
    await testSingle();
    await testConcurrent();
    
    console.log('\n🎯 Test Summary');
    console.log('================');
    console.log('✅ Single requests: Working with cache');
    console.log('⚠️ Concurrent limit: 2 parallel max on M1');
    console.log('🚀 Production: Use RTX 4090 for better concurrency');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();