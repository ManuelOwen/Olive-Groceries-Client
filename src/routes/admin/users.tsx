import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import {
  userService,
  useCreateUserAdmin,
  useUpdateUser,
  useDeleteUser,
  type TUser,
  type TUserRegister,
} from '@/hooks/useUser'
import { userRole } from '@/interfaces/orderInterface'
import {
  Plus,
  Edit,
  Trash2,
 
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
import { useAuthStore } from '@/stores/authStore';
import modalBg from '@/images/bg.jpeg';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/admin/users')({
  beforeLoad: () => {
    // Use direct import and getState for auth store
    const { user, isAuthenticated, token } = useAuthStore.getState();
    console.log('Admin users beforeLoad - auth check:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      userRole: user?.role,
    })

    if (!isAuthenticated || !user || !token) {
      console.log('Admin users - User not authenticated, redirecting to login')
      throw redirect({ to: '/login' })
    }

    if (user.role !== 'admin') {
      console.log('Admin users - User not admin, redirecting to dashboard')
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminUsersComponent,
})
function AdminUsersComponent() {
  const { data: users = [], isLoading, isError, error } = userService()
  const createUserMutation = useCreateUserAdmin()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null)

  // State for form data
  const [formData, setFormData] = useState<Partial<TUserRegister & TUser>>({
    fullName: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
    role: userRole.User,
  })

  // Add view mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  // Filter and search users
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber?.includes(searchTerm) ||
          user.address?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole =
          roleFilter === 'all' || String(user.role) === String(roleFilter)

        return matchesSearch && matchesRole
      })
    : []

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Helper functions
  const getRoleBadge = (role: string) => {
    const roleConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin' },
      user: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'User' },
      driver: { bg: 'bg-green-100', text: 'text-green-800', label: 'Driver' },
    }

    const config = roleConfig[role?.toLowerCase()] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: role || 'User',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  // CRUD Operations
  const handleCreate = async () => {
    try {
      await createUserMutation.mutateAsync(formData as TUserRegister)
      setShowCreateModal(false)
      setFormData({
        fullName: '',
        email: '',
        password: '',
        address: '',
        phoneNumber: '',
        role: userRole.User,
      })
      toast.success('User created successfully!')
    } catch (error) {
      toast.error('Failed to create user')
      console.error('Create error:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser) return

    // Only send allowed fields
    const allowedFields = [
      'fullName',
      'email',
      'address',
      'phoneNumber',
      'role',
    ]
    const userUpdatePayload = Object.fromEntries(
      Object.entries({ ...selectedUser, ...formData }).filter(([key]) =>
        allowedFields.includes(key),
      ),
    )

    // Validate phone number format
    if (
      userUpdatePayload.phoneNumber &&
      !/^\+2547\d{8}$/.test(String(userUpdatePayload.phoneNumber))
    ) {
      toast.error('Phone number must be in the format +2547XXXXXXXX')
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id.toString(),
        user: userUpdatePayload as unknown as TUser,
      })
      setShowEditModal(false)
      setSelectedUser(null)
      toast.success('User updated successfully!')
    } catch (error) {
      toast.error('Failed to update user')
      console.error('Update error:', error)
      console.log(error)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id.toString())
      setShowDeleteModal(false)
      setSelectedUser(null)
      toast.success('User deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete user')
      console.error('Delete error:', error)
    }
  }

  const openEditModal = (user: TUser) => {
    setSelectedUser(user)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      address: user.address,
      phoneNumber: user.phoneNumber,
      role: user.role,
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (user: TUser) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Users
        </h3>
        <p className="text-red-600">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    )
  }

  // Check if users is not an array (API returned unexpected data)
  if (!Array.isArray(users)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Unexpected Data Format
        </h3>
        <p className="text-yellow-600">
          The API returned unexpected data. Expected an array of users, but got:{' '}
          {typeof users}
        </p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <Toaster position="top-right" richColors closeButton />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage all registered users</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-l-lg border ${viewMode === 'table' ? 'bg-orange-300 text-white' : 'bg-orange-300 text-white-300 border-orange-600'} transition-colors`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-r-lg border-l-0 border ${viewMode === 'card' ? 'bg-orange-300 text-white' : 'bg-orange-300 text-white-300 border-orange-300'} transition-colors`}
            >
              Card View
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-300 text-white rounded-lg hover:bg-orange-300 transition-colors ml-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Card View */}
        {viewMode === 'card' && (
          <div className="overflow-y-auto max-h-[600px] mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 cursor-pointer transform transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:border-orange-200 hover:-translate-y-1"
                >
                  {/* User Avatar and Basic Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center transition-all duration-300 group-hover:bg-orange-200">
                        <User className="h-6 w-6 text-orange-600 transition-colors duration-300" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-300">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                    <div className="flex-shrink-0">{getRoleBadge(String(user.role))}</div>
                  </div>
                  {/* Contact Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
                      <span>{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{user.address}</span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(user)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white-300 bg-orange-50 rounded-md hover:bg-orange-200 transition-colors"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination for Card View */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${currentPage === page ? 'bg-orange-100 text-orange-600 font-bold' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6 overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRoleBadge(String(user.role))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openEditModal(user)} className="text-orange-600 hover:text-orange-900 p-1 rounded" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900 p-1 rounded" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination for Table View */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50 ${currentPage === page ? 'bg-orange-100 text-orange-600 font-bold' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto h-full w-full" style={{background: `url(${modalBg}) center center / cover no-repeat`}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New User
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={formData.role || userRole.User}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as userRole,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={userRole.User}>User</option>
                    <option value={userRole.Admin}>Admin</option>
                    <option value={userRole.Driver}>Driver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createUserMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto h-full w-full" style={{background: `url(${modalBg}) center center / cover no-repeat`}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit User: {selectedUser.fullName}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={formData.role || 'user'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'admin' | 'user' | 'driver',
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateUserMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto h-full w-full" style={{background: `url(${modalBg}) center center / cover no-repeat`}}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            >
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  Delete User
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete user "{selectedUser.fullName}
                    "? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteUserMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </LayoutWithSidebar>
  )
}

export default AdminUsersComponent
