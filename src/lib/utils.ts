import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuthStore, getToken } from '@/stores/authStore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get auth headers for API requests
export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Utility function to make authenticated fetch requests
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  console.log('authenticatedFetch - Token value:', token);
  console.log('authenticatedFetch - URL:', url);

  // Only set Content-Type if body is not FormData
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('authenticatedFetch - Added Authorization header:', headers['Authorization']);
  } else {
    console.log('authenticatedFetch - No token available, request will be unauthenticated');
  }

  console.log('authenticatedFetch - Final headers:', headers);

  return fetch(url, {
    ...options,
    headers,
  });
}

// Utility function to check if user is authenticated and verified
export function isUserVerified(user: any): boolean {
  // Allow access if user exists and has role 'driver'
  return !!user && user.role === 'driver';
}

// Utility function to get user data from auth store
export function getUserData(): any | null {
  try {
    const { user } = useAuthStore.getState();
    return user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Utility function to clear user data from auth store
export function clearUserData(): void {
  useAuthStore.getState().logout();
}

// Utility function to handle user logout
export function logoutUser(): void {
  useAuthStore.getState().logout();

}

// Utility function to get user role
export function getUserRole(): string | null {
  try {
    const { user } = useAuthStore.getState();
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}
