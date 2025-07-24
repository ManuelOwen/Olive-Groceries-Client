import { useAuthStore, getToken } from '@/stores/authStore';
import { authenticatedFetch } from '@/lib/utils';
import { loginUser } from '@/components/api/auth';

export const AuthTestComponent = () => {
  const { user, isAuthenticated, token } = useAuthStore();
  const currentToken = getToken();

  const testAuth = async () => {
    console.log('=== AUTH TEST ===');
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Token from store:', token);
    console.log('Token from getToken():', currentToken);
    
    try {
      console.log('Making test API call...');
      const response = await authenticatedFetch('http://localhost:8000/api/v1/orders');
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
      } else {
        console.log('API Error:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('Error details:', errorText);
      }
    } catch (error) {
      console.error('Test API call failed:', error);
    }
  };

  const testLogin = async () => {
    console.log('=== LOGIN TEST ===');
    try {
      // Test with a sample user (you'll need to replace with actual credentials)
      const loginData = {
        email: 'admin@example.com', 
        password: 'password123'     
      };
      
      console.log('Attempting login with:', loginData);
      type LoginResult = { user?: any; token?: string };
      const result = await loginUser(loginData) as LoginResult;
      console.log('Login API Response:', result);
      console.log('Response type:', typeof result);
      console.log('Has user property:', 'user' in result);
      console.log('Has token property:', 'token' in result);
      
      if (typeof result.token === 'string' && result.token) {
        console.log('✅ Token found in response:', result.token.substring(0, 20) + '...');
      } else {
        console.log('❌ No token found in response');
        console.log('Full response structure:', Object.keys(result));
      }
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  const testApiAccess = async () => {
    console.log('=== API ACCESS TEST ===');
    
    // Test 1: Basic fetch without any headers
    try {
      console.log('Test 1: Basic fetch without headers');
      const response1 = await fetch('http://localhost:8000/api/v1/orders');
      console.log('Response 1 status:', response1.status);
      const text1 = await response1.text();
      console.log('Response 1 body:', text1);
    } catch (error) {
      console.error('Test 1 failed:', error);
    }
    
    // Test 2: Fetch with Content-Type header
    try {
      console.log('Test 2: Fetch with Content-Type header');
      const response2 = await fetch('http://localhost:8000/api/v1/orders', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response 2 status:', response2.status);
      const text2 = await response2.text();
      console.log('Response 2 body:', text2);
    } catch (error) {
      console.error('Test 2 failed:', error);
    }
    
    // Test 3: Fetch with fake token
    try {
      console.log('Test 3: Fetch with fake token');
      const response3 = await fetch('http://localhost:8000/api/v1/orders', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-123'
        }
      });
      console.log('Response 3 status:', response3.status);
      const text3 = await response3.text();
      console.log('Response 3 body:', text3);
    } catch (error) {
      console.error('Test 3 failed:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Authentication Debug Info</h3>
      <div className="space-y-2 text-sm mb-4">
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
        <p><strong>Token from store:</strong> {token ? 'Present' : 'None'}</p>
        <p><strong>Token from getToken():</strong> {currentToken ? 'Present' : 'None'}</p>
        <p><strong>Token value:</strong> {token || 'No token'}</p>
      </div>
      
      <div className="space-x-2">
        <button 
          onClick={testAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Authenticated Request
        </button>
        
        <button 
          onClick={testLogin}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Login API
        </button>
        
        <button 
          onClick={testApiAccess}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test API Access
        </button>
        
        <button 
          onClick={async () => {
            try {
              console.log('Testing non-authenticated request...');
              const response = await fetch('http://localhost:8000/api/v1/orders');
              console.log('Non-auth Response status:', response.status);
              if (response.ok) {
                const data = await response.json();
                console.log('Non-auth Response data:', data);
              } else {
                console.log('Non-auth Error:', response.status, response.statusText);
              }
            } catch (error) {
              console.error('Non-auth test failed:', error);
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Non-Authenticated Request
        </button>
      </div>
    </div>
  );
};
