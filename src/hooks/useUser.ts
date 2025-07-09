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
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }

    throw new Error(errorMessage);
  }
  return response;
};

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
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
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
};

//  hook to delete user (corrected to mutation)
export const useDeleteUser = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });

      await handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
