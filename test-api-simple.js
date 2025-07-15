import { api } from './src/services/apiHelpers.js';

// Simple test script to verify API connectivity
async function testAPI() {
  console.log('🔍 Testing API connectivity...');
  
  try {
    // Test health endpoint
    console.log('\n📡 Testing health endpoint...');
    const healthResponse = await api.health.checkHealth();
    
    if (healthResponse.data) {
      console.log('✅ Health check successful:', healthResponse.data);
    } else {
      console.log('❌ Health check failed:', healthResponse.error);
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log('\n💡 Make sure your FastAPI backend is running on http://localhost:8000');
    console.log('💡 You can start it with: uvicorn main:app --reload');
  }
}

// Run the test
testAPI();
