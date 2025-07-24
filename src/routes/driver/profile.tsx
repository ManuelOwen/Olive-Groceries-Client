import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateUser } from '@/hooks/useUser'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, User as UserIcon, Edit } from 'lucide-react'
// import { DriverLayout } from '@/components/drivers/DriverLayout'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/driver/profile')({
  component: DriverProfilePage,
})

function DriverProfilePage() {
  const authUser = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateUser = useUpdateUser()
  const updateUserStore = useAuthStore((s) => s.updateUser)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (authUser && authUser.role === 'driver') {
      setForm({
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        phoneNumber: authUser.phoneNumber || '',
        address: authUser.address || '',
      })
    }
  }, [authUser])

  if (!isAuthenticated || !authUser || !token || authUser.role !== 'driver') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Access Denied</h3>
        <p className="text-red-600 mb-2">You must be logged in as a driver to view this page.</p>
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
        role: authUser.role,
      }
      await updateUser.mutateAsync({
        id: String(authUser.id),
        user: payload as any,
      })
      updateUserStore(payload)
      toast.success('Profile updated successfully!')
      setUploading(false)
      setEditing(false)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update profile'
      toast.error(errorMessage)
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-green-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(255, 122, 0, 0.15)' }}
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
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="h-32 w-32 mb-4 relative group">
            <div className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center">
              <UserIcon className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {authUser.fullName}
          </div>
          <div className="text-base text-gray-500">ID: {authUser.id}</div>
        </div>
        <div className="w-full space-y-5 mb-8">
          <div className="flex items-center text-base text-gray-700">
            <Mail className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{authUser.email || 'Not provided'}</span>
          </div>
          <div className="flex items-center text-base text-gray-700">
            <Phone className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
            <span>{authUser.phoneNumber || 'Not provided'}</span>
          </div>
          <div className="flex items-start text-base text-gray-700">
            <MapPin className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{authUser.address || 'Not provided'}</span>
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
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
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
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
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
  )
}
