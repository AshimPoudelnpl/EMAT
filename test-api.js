import { api } from './src/services/apiHelpers';

// Test the API integration
async function testAPI() {
  console.log('Testing API integration...');
  
  try {
    // Test health endpoint
    const healthResponse = await api.health.checkHealth();
    console.log('Health check:', healthResponse);
    
    // Test root endpoint
    const rootResponse = await api.health.getRoot();
    console.log('Root endpoint:', rootResponse);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run test
testAPI();
