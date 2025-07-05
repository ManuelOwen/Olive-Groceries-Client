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
  const token = getToken()
  console.log('authenticatedFetch - Token available:', !!token);
  console.log('authenticatedFetch - URL:', url);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('authenticatedFetch - Added Authorization header');
  } else {
    console.log('authenticatedFetch - No token available, request will be unauthenticated');
  }
  
  console.log('authenticatedFetch - Final headers:', headers);
  
  return fetch(url, {
    ...options,
    headers,
  })
}

// Utility function to check if user is authenticated and verified
export function isUserVerified(): boolean {
  try {
    const { user, isAuthenticated, token } = useAuthStore.getState();
    console.log('dashboard', user)
    // Check if user object has required properties and is verified
    return Boolean(
      isAuthenticated &&
      user &&
      user.id !== undefined && user.id !== null &&
      user.email !== undefined && user.email !== null &&
      user.role !== undefined && user.role !== null &&
      token
    );
  } catch (error) {
    console.error('Error checking user verification:', error);
    return false;
  }
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
  // Note: In a real application, you might want to also:
  // 1. Call an API endpoint to invalidate the session server-side
  // 2. Clear any other authentication tokens
  // 3. Redirect to login page (this should be handled by the calling component)
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

// Role-based check functions
export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function isUser(): boolean {
  return getUserRole() === 'user';
}

export function isDriver(): boolean {
  return getUserRole() === 'driver';
}
