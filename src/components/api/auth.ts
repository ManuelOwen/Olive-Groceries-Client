import { API_URL } from '@/components/api/url';
import type { TUser } from '@/hooks/useUser';

// Define the login response type
export interface LoginResponse {
  user: TUser;
  token: string;
}

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
}): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  await handleApiResponse(response);
  const data = await response.json();
  console.log('Login API response:', data);
  
  // Handle different response formats
  if (data.token && data.user) {
    // If the API returns { user: {...}, token: "..." }
    console.log('Login response format: { user, token }');
    return data;
  } else if (data.token) {
    // If the API returns { id, email, role, token, ... }
    console.log('Login response format: { ...userData, token }');
    const { token, ...userData } = data;
    return { user: userData, token };
  } else {
    // Fallback: assume the entire response is user data and no token
    console.warn('No token found in login response, using user data only');
    console.log('Login response format: user data only');
    return { user: data, token: '' };
  }
};

