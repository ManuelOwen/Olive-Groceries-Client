import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateUser, useDeleteUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Edit,
  Trash2,
} from 'lucide-react'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
import { motion } from 'framer-motion'
import { logoutUser } from '@/lib/utils'

export const Route = createFileRoute('/admin/settings/profile')({
  component: ProfilePage,
})
function ProfilePage() {
  const authUser = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Debug logging
  console.log('Profile Page Debug:', {
    authUser,
    token: token ? 'Present' : 'Missing',
    isAuthenticated,
    userId: authUser?.id,
  })

  // Add real-time token validation
  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.warn('Profile page accessed without proper authentication')
    }
  }, [isAuthenticated, token])

  // For now, let's use the auth store user directly instead of fetching from API
  // This is more efficient and the auth store should have the current user data
  const user = authUser
  const isLoading = false
  const isError = !authUser
  const error = !authUser ? new Error('User not found in auth store') : null

  const updateUser = useUpdateUser()
  const updateUserStore = useAuthStore((s) => s.updateUser)
  const deleteUserMutation = useDeleteUser()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      })
    }
  }, [user])

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  if (isError || !user) {
    console.error('Profile Page Error:', { isError, error, user, authUser })
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Error loading profile
        </h3>
        <p className="text-red-600 mb-2">
          {error?.message || 'Failed to load user profile'}
        </p>
        <div className="text-sm text-red-500">
          Debug info:
          <br />• Auth User ID: {(authUser as any)?.id || 'None'}
          <br />• Auth User: {authUser ? 'Present' : 'Missing'}
          <br />• Token: {token ? 'Present' : 'Missing'}
        </div>
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setUploading(true)

      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        role: user.role,
      }

      console.log('Updating user with payload:', payload)
      const { getToken } = await import('@/stores/authStore')
      const token = getToken()
      console.log('Token being sent:', token)

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        console.warn('No token found! User is not authenticated.')
      }
      await updateUser.mutateAsync({
        id: user.id,
        user: payload as any,
        headers,
      })
      updateUserStore(payload)
      toast.success('Profile updated successfully!')
      setUploading(false)
      setEditing(false)
    } catch (err: any) {
      console.error('Profile update error:', err)
      const errorMessage = err?.message || 'Failed to update profile'

      // Handle specific error types
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401')
      ) {
        toast.error('Authentication failed. Please log in again.')
      } else if (errorMessage.includes('403')) {
        toast.error('You do not have permission to update this profile.')
      } else if (errorMessage.includes('Network')) {
        toast.error(
          'Network error. Please check your connection and try again.',
        )
      } else {
        toast.error(errorMessage)
      }

      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.',
      )
    )
      return
    try {
      await deleteUserMutation.mutateAsync(user.id)
      toast.success('Account deleted.')
      logoutUser()
      window.location.href = '/login'
    } catch (err) {
      toast.error('Failed to delete account')
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6 flex justify-center items-start min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-green-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 8px 32px 0 rgba(255, 122, 0, 0.15)',
          }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 px-10 py-12 flex flex-col items-center relative"
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
              onClick={() => setEditing((e) => !e)}
              title="Update Profile"
            >
              <Edit className="h-5 w-5 mr-2" />
              {editing ? 'Cancel' : 'Update'}
            </button>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
              onClick={handleDelete}
              title="Delete Account"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="h-32 w-32 mb-4 relative group">
              <div className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {user.fullName}
            </div>
            <div className="text-base text-gray-500">ID: {user.id}</div>
          </div>
          <div className="w-full space-y-5 mb-8">
            <div className="flex items-center text-base text-gray-700">
              <Mail className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center text-base text-gray-700">
              <Phone className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
              <span>{user.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex items-start text-base text-gray-700">
              <MapPin className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {user.address || 'Not provided'}
              </span>
            </div>
          </div>
          {editing && (
            <motion.form
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="w-full mt-4 bg-orange-50 rounded-2xl p-6 shadow-inner flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </LayoutWithSidebar>
  )
}
