import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TUser } from '@/hooks/useUser'

interface AuthState {
  user: TUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (user: TUser, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  updateUser: (user: Partial<TUser>) => void
  setToken: (token: string) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user: TUser, token: string) => {
        console.log('Storing user and token in auth store:', { user, token: token ? 'TOKEN_PRESENT' : 'NO_TOKEN' });
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        })
        console.log('User logged in via store:', user)
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        })
        console.log('User logged out via store')
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (userData: Partial<TUser>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({ user: updatedUser })
          console.log('User updated in store:', updatedUser)
        }
      },

      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user)
export const useToken = () => useAuthStore((state) => state.token)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

// Utility functions
export const getUserRole = (): string | null => {
  const user = useAuthStore.getState().user
  return user?.role || null
}

export const getToken = (): string | null => {
  const token = useAuthStore.getState().token
  console.log('Getting token from store:', token ? 'TOKEN_PRESENT' : 'NO_TOKEN');
  return token
}

export const isAdmin = (): boolean => {
  const role = getUserRole()
  return role === 'admin'
}

export const isUser = (): boolean => {
  const role = getUserRole()
  return role === 'user'
}

export const isDriver = (): boolean => {
  const role = getUserRole()
  return role === 'driver'
}

export const isUserVerified = (): boolean => {
  const { user, isAuthenticated, token } = useAuthStore.getState()
  return Boolean(isAuthenticated && user && user.id && user.email && user.role && token)
} 