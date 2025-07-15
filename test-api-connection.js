// Simple test to check API connectivity
const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/../health`);
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    }
    
    // Test elections endpoint without auth (should get 401)
    const electionsResponse = await fetch(`${API_BASE_URL}/elections/`);
    console.log('Elections endpoint status:', electionsResponse.status);
    
    if (electionsResponse.status === 401) {
      console.log('✅ Elections endpoint is properly protected (401 Unauthorized)');
    } else {
      console.log('⚠️ Unexpected response from elections endpoint');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
