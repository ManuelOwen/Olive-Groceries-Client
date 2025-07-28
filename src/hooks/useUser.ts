import { registerUser, loginUser } from '@/components/api/auth';
import { useMutation, type UseMutationResult, useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { API_URL } from '@/components/api/url';
import { getToken } from '@/stores/authStore'

// import { createUserApi } from '@/components/'; 

// Define the type for the user data
export interface TUser {
  id: number | string; // Support both number and string to match backend
  fullName: string;
  email: string;
  address: string;
  phoneNumber: string;
  role?: 'admin' | 'user' | 'driver'; // Add role property
  token?: string; // Add token property to ensure it can be stored if needed
}
// Define the type for the user registration data
export interface TUserRegister {
  fullName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
}
// Define the type for the user login data
export interface  TUserLogin {
  email: string;
  password: string;
}
//  hook to create a user 
export const useCreateUser = (): UseMutationResult<TUser, Error, TUserRegister> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: TUserRegister) => registerUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Hook to login a user
export const useLoginUser = (): UseMutationResult<TUser, Error, TUserLogin> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: TUserLogin) => {
      const result = await loginUser(user);
      // Ensure token is included in the returned user object for storage
      if (result && typeof result.token === 'string' && result.token) {
        return result;
      } else {
      
        const token = getToken() || '';
        return { ...result, token } as TUser;
      }
    },
    onSuccess: (user) => {
      console.log('Login successful, user:', user);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });
};

// Helper function to handle API responses
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      // Handle duplicate phone number error
      if (data.message && typeof data.message === 'string' && data.message.includes('already exists')) {
        errorMessage = 'Phone number is already registered. Please use a different phone number.';
      } else if (Array.isArray(data.message)) {
        errorMessage = data.message
          .map((m: any) => m.constraints ? Object.values(m.constraints).join(', ') : m)
          .join('\n');
      } else {
        errorMessage = data.message || data.error || errorMessage;
      }
    } catch (parseError) {
      // If parsing fails, use the default error message
      console.warn('Failed to parse error response:', parseError);
    }
    throw new Error(errorMessage);
  }
  return response;
}

// Admin function to fetch all users (replaces useGetUsers for admin use)
export const userService = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/users`);
      await handleApiResponse(response);
      const data = await response.json();

      // Handle wrapped response 
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }

      // Handle direct array response
      if (Array.isArray(data)) {
        return data;
      }

      return [];
    },
  });
};

// Hook to create a user (admin function)
export const useCreateUserAdmin = (): UseMutationResult<TUser, Error, TUserRegister> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: TUserRegister) => {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      await handleApiResponse(response);
      const data = await response.json();

      // Handle wrapped response
      if (data.data) {
        return data.data;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Hook to fetch all users (for display)
export const useGetUsers = (): UseQueryResult<TUser[], Error> => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {

      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });
};

// Hook to fetch a single user by ID
export const useGetUser = (userId: string): UseQueryResult<TUser, Error> => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      console.log('useGetUser - Fetching user with ID:', userId);

      // Add Authorization header
  
      const token = getToken();
      console.log('useGetUser - Token:', token ? 'Present' : 'Missing');

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('useGetUser - Making request to:', `${API_URL}/users/${userId}`);
      console.log('useGetUser - Headers:', headers);

      const response = await fetch(`${API_URL}/users/${userId}`, { headers });
      console.log('useGetUser - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('useGetUser - Error response:', errorText);
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('useGetUser - Response data:', data);

      // Handle wrapped response format
      if (data && data.success && data.data) {
        console.log('useGetUser - Returning wrapped data:', data.data);
        return data.data;
      } else if (data && data.id) {
        // Direct user object
        console.log('useGetUser - Returning direct data:', data);
        return data;
      } else {
        console.error('useGetUser - Unexpected response format:', data);
        throw new Error('Unexpected response format from API');
      }
    },
    enabled: !!userId,
  });
};
export const useUpdateUser = (): UseMutationResult<TUser, Error, { id:string; user: TUser }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, user }: { id: string; user: TUser }) => {
      console.log('[UpdateUser] Starting update for user ID:', id);
      console.log('[UpdateUser] User data to update:', user);

      // Remove forbidden fields
      const { id: _id, ...userData } = user;
      console.log('[UpdateUser] Cleaned user data:', userData);

      // Debug: Get token from store
     
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[UpdateUser] Using token:', token ? 'TOKEN_PRESENT' : 'NO_TOKEN');
        console.log('[UpdateUser] Token length:', token?.length);
      } else {
        console.warn('[UpdateUser] No token found in store!');
        throw new Error('Authentication token is missing. Please log in again.');
      }

      console.log('[UpdateUser] Request URL:', `${API_URL}/users/${id}`);
      console.log('[UpdateUser] Headers:', headers);
      console.log('[UpdateUser] Body:', JSON.stringify(userData, null, 2));

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });

      console.log('[UpdateUser] Response status:', response.status);
      console.log('[UpdateUser] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[UpdateUser] Error response:', errorText);
        throw new Error(`Update failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[UpdateUser] Success response:', data);

      if (data.data) {
        return data.data;
      }
      return data;
    },
    onSuccess: (data) => {
      console.log('[UpdateUser] Update successful:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('[UpdateUser] Update failed:', error);
    }
  });
};

//  hook to delete user (corrected to mutation)
export const useDeleteUser = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Debug: Get token from store
    
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[DeleteUser] Using token:', token);
      } else {
        console.warn('[DeleteUser] No token found in store!');
      }
      console.log('[DeleteUser] Headers:', headers);
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers,
      });
      await handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
