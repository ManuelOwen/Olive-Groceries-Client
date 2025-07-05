import type { TUser, TUserRegister } from "@/hooks/useUser";
import { authenticatedFetch } from "@/lib/utils";

const url = "http://localhost:8000/api/v1";

// Helper functions
const handleResponseApi = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
        try {
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
    }
    return response;
};

// Temporary function to test API without authentication
export const getAllUsersWithoutAuth = async (): Promise<TUser[]> => {
    console.log('Making unauthenticated request to users API...');
    console.log('URL:', `${url}/users`);
    
    try {
        const response = await fetch(`${url}/users`);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        if (!response.ok) {
            console.error('API request failed:', response.status, response.statusText);
            console.error('Response body:', responseText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        // Try to parse as JSON
        try {
            const data = JSON.parse(responseText);
            console.log('Parsed response data:', data);
            
            // Check if data is an array (direct response)
            if (Array.isArray(data)) {
                return data;
            } else if (data && Array.isArray(data.data)) {
                // If the API returns { success: true, message: "...", data: [...] }
                console.log('Extracting users from data property');
                return data.data;
            } else if (data && Array.isArray(data.users)) {
                // If the API returns { users: [...] }
                return data.users;
            } else {
                console.error('Unexpected data format:', data);
                throw new Error('API returned unexpected data format');
            }
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error('Invalid JSON response from API');
        }
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
};

// Get all users
export const getAllUsers = async (): Promise<TUser[]> => {
    const response = await authenticatedFetch(`${url}/users`);
    await handleResponseApi(response);
    const data = await response.json();
    
    // Handle wrapped response format
    if (Array.isArray(data)) {
        return data;
    } else if (data && Array.isArray(data.data)) {
        // If the API returns { success: true, message: "...", data: [...] }
        return data.data;
    } else if (data && Array.isArray(data.users)) {
        // If the API returns { users: [...] }
        return data.users;
    } else {
        console.error('Unexpected data format:', data);
        throw new Error('API returned unexpected data format');
    }
};

// Get user by user id 
export const getUserById = async (id: number | string): Promise<TUser> => {
    const response = await authenticatedFetch(`${url}/users/${id}`);
    await handleResponseApi(response);
    return response.json();
};

// Create a new user
export const createUser = async (userData: TUserRegister): Promise<TUser> => {
    const response = await authenticatedFetch(`${url}/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
    await handleResponseApi(response);
    return response.json();
};

// Update a user
export const updateUser = async (id: number | string, userData: Partial<TUser>): Promise<TUser> => {
    const response = await authenticatedFetch(`${url}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
    await handleResponseApi(response);
    return response.json();
};

// Delete a user
export const deleteUser = async (id: number | string): Promise<void> => {
    const response = await authenticatedFetch(`${url}/users/${id}`, {
        method: 'DELETE',
    });
    await handleResponseApi(response);
    return response.json();
};

// Get users by role
export const getUsersByRole = async (role: string): Promise<TUser[]> => {
    const response = await authenticatedFetch(`${url}/users/role/${role}`);
    await handleResponseApi(response);
    return response.json();
};

// Get users by email (search)
export const getUsersByEmail = async (email: string): Promise<TUser[]> => {
    const response = await authenticatedFetch(`${url}/users/search?email=${encodeURIComponent(email)}`);
    await handleResponseApi(response);
    return response.json();
};

// Get users by phone number
export const getUsersByPhone = async (phoneNumber: string): Promise<TUser[]> => {
    const response = await authenticatedFetch(`${url}/users/search?phone=${encodeURIComponent(phoneNumber)}`);
    await handleResponseApi(response);
    return response.json();
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (id: number | string, status: 'active' | 'inactive'): Promise<TUser> => {
    const response = await authenticatedFetch(`${url}/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    await handleResponseApi(response);
    return response.json();
};

// Reset user password
export const resetUserPassword = async (id: number | string, newPassword: string): Promise<void> => {
    const response = await authenticatedFetch(`${url}/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPassword }),
    });
    await handleResponseApi(response);
    return response.json();
};
