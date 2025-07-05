import { registerUser, loginUser, type LoginResponse } from '@/components/api/auth';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUsersByRole,
  updateUserStatus,
  resetUserPassword
} from '@/api/users';
import { useMutation, type UseMutationResult, useQueryClient, useQuery, type UseQueryResult } from '@tanstack/react-query';
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
export const  useCreateUser = (): UseMutationResult<TUser, Error, TUserRegister> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: TUserRegister) => registerUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Hook to login a user
export const useLoginUser = (): UseMutationResult<LoginResponse, Error, TUserLogin> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: TUserLogin) => loginUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Hook to fetch all users (using the new API)
export const userService = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['users'],
        queryFn: getAllUsers,
        // refetchOnWindowFocus: false,
    });

    return { data, isLoading, isError, error };
};

// Update user hook
export const useUpdateUser = (): UseMutationResult<TUser, unknown, {id: string; user: TUser}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, user}) => updateUser(id, user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.setQueryData(['users', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating user:', error);
        }
    }); 
};

// Delete user hook
export const useDeleteUser = (): UseMutationResult<void, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
        }
    });
};

// Create user hook (updated to use new API)
export const useCreateUserAdmin = (): UseMutationResult<TUser, unknown, TUserRegister> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user) => createUser(user),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.setQueryData(['users', data.id], data);
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });
};

// Get user by id hook
export const useGetUserById = (id: string): UseQueryResult<TUser | undefined, Error> => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => getUserById(id),
        enabled: !!id, // Only run the query if id is provided
    });
};

// Get users by role hook
export const useGetUsersByRole = (role: string): UseQueryResult<TUser[], Error> => {
    return useQuery({
        queryKey: ['users', 'role', role],
        queryFn: () => getUsersByRole(role),
        enabled: !!role, // Only run the query if role is provided
    });
};

// Update user status hook
export const useUpdateUserStatus = (): UseMutationResult<TUser, unknown, {id: string; status: 'active' | 'inactive'}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, status}) => updateUserStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.setQueryData(['users', data.id], data);
        },
        onError: (error) => {
            console.error('Error updating user status:', error);
        }
    });
};

// Reset user password hook
export const useResetUserPassword = (): UseMutationResult<void, unknown, {id: string; password: string}> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, password}) => resetUserPassword(id, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error resetting user password:', error);
        }
    });
};