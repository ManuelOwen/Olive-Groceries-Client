import { registerUser, loginUser } from '@/components/api/auth';
import { useMutation, type UseMutationResult, useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { API_URL } from '@/components/api/url';
// import { createUserApi } from '@/components/'; 

// Define the type for the user data
export interface TUser {
  id: string;
  fullName: string;
  email: string;
  // password: string;
  address: string;
  phoneNumber: string;
  role?: 'admin' | 'user' | 'driver'; // Add role property
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
export interface TUserLogin {
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
      console.log('Login mutation result:', result);
      return result;
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

      // Handle wrapped response (e.g., { success: true, data: [...] })
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
      // Replace with your actual API call to fetch a single user
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId,
  });
};
//  hook to update user (corrected to mutation)
export const useUpdateUser = (): UseMutationResult<TUser, Error, { id: string; user: TUser }> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, user }: { id: string; user: TUser }) => {
      // Remove forbidden fields
      const { id: _id,  ...userData } = user;
      // Debug: Get token from store
      const { getToken } = await import('@/stores/authStore');
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[UpdateUser] Using token:', token);
      } else {
        console.warn('[UpdateUser] No token found in store!');
      }
      console.log('[UpdateUser] Headers:', headers);
      const response = await fetch(`${API_URL}/users/${id}`, {
      
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      await handleApiResponse(response);
      const data = await response.json();
      if (data.data) {
        return data.data;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

//  hook to delete user (corrected to mutation)
export const useDeleteUser = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Debug: Get token from store
      const { getToken } = await import('@/stores/authStore');
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
