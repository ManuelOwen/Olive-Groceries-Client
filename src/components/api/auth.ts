import { API_URL } from '@/components/api/url';
import type { TUser } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/authStore'

//  helper functions to handle errors
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;

    try {
      // Try to parse as JSON first
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        // If not JSON, try to read as text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      // If parsing fails, use the default error message
      console.warn('Failed to parse error response:', parseError);
    }

    throw new Error(errorMessage);
    console.log('Error:', errorMessage);
  }
  return response;
};

// register a new user
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
}): Promise<TUser> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  await handleApiResponse(response);
  return response.json();
};
//  create a user

// login a user
export const loginUser = async (userData: {
  email: string;
  password: string;
}): Promise<TUser> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  await handleApiResponse(response);
  const data = await response.json();

  // Debug: Log the actual response from the server
  console.log('Raw login API response:', data);
  console.log('Response keys:', Object.keys(data));

  let user: TUser;
  let token: string;

  if (data.user && data.accessToken) {
 
    user = data.user;
    token = data.accessToken;
  } else if (data.data && data.token) {
   
    user = data.data;
    token = data.token;
  } else if (data.user && data.token) {

    user = data.user;
    token = data.token;
  } else if (data.token && (data.id || data.email)) {
  
    token = data.token;
    user = { ...data };
    delete (user as any).token; // Remove token from user object
  } else if (data.access_token) {
    
    token = data.access_token;
    user = data.user || data;
  } else if (data.accessToken) {
    // Format: { accessToken: "...", refreshToken: "...", role: "...", id: ... }
    token = data.accessToken;
    user = {
      id: data.id?.toString() || '',
      email: data.email || userData.email || '',
      fullName: data.fullName || data.name || data.username || 'User',
      address: data.address || '',
      phoneNumber: data.phoneNumber || data.phone || '',
      role: data.role // Do not fallback to 'user' if missing
    };
    if (!user.role) {
      console.error('Role missing in login response:', data);
    }
    console.log('AccessToken format detected. Built user object:', user);
  } else {
    // Fallback - assume data is the user and look for token in various possible field names
    user = data;
    token = data.token ||
      data.access_token ||
      data.accessToken ||
      data.auth_token ||
      data.authToken ||
      data.jwt ||
      data.JWT ||
      data.bearer_token ||
      data.bearerToken ||
      '';
    if (!user.role) {
      console.error('Role missing in fallback login response:', data);
    }
  }

  console.log('Extracted login data:', {
    user: user ? { id: user.id, email: user.email, role: user.role } : 'NO_USER',
    token: token ? 'TOKEN_PRESENT' : 'NO_TOKEN',
    tokenLength: token ? token.length : 0
  });

  if (!token) {
    console.error('Token extraction failed. Available fields in response:', Object.keys(data));
    console.error('Full response data:', JSON.stringify(data, null, 2));
    throw new Error(`No authentication token received from server. Response contained: ${Object.keys(data).join(', ')}`);
  }

  
  const { login } = useAuthStore.getState();

  // Save user and token to the store
  login(user, token);

  return user;
};

