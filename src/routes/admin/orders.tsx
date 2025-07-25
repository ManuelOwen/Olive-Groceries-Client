import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import {
  orderService,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from '@/hooks/useOrders'
import {
  type TOrders,
  OrderPriority,
  OrderStatus,
} from '@/interfaces/orderInterface'
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/admin/orders')({
  beforeLoad: () => {
    // Use direct import and getState for auth store
    const { user, isAuthenticated, token } = useAuthStore.getState()
    console.log('Admin orders beforeLoad - auth check:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      userRole: user?.role,
    })

    if (!isAuthenticated || !user || !token) {
      console.log('Admin orders - User not authenticated, redirecting to login')
      throw redirect({ to: '/login' })
    }

    if (user.role !== 'admin') {
      console.log('Admin orders - User not admin, redirecting to dashboard')
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminOrdersComponent,
})
function AdminOrdersComponent() {
  const { data: orders = [], isLoading, isError, error } = orderService()
  const createOrderMutation = useCreateOrder()
  const updateOrderMutation = useUpdateOrder()
  const deleteOrderMutation = useDeleteOrder()

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<TOrders | null>(null)

  // State for form data
  const [formData, setFormData] = useState<Partial<TOrders>>({
    order_number: '',
    total_amount: 0,
    status: OrderStatus.PENDING,
    priority: OrderPriority.Low,
    shipping_address: '',
    billing_address: '',
    user_id: 0,
  })

  // Add view mode state
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Filter and search orders
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesSearch =
          order.order_number?.toString().includes(searchTerm) ||
          order.shipping_address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user_id?.toString().includes(searchTerm) ||
          order.user?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus =
          statusFilter === 'all' ||
          String(order.status) === String(statusFilter)
        const matchesPriority =
          priorityFilter === 'all' || order.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
      })
    : []

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
      },
      processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Processing',
      },
      shipped: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Shipped',
      },
      delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Delivered',
      },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmed',
      },
    }

    const config = statusConfig[status?.toLowerCase()] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status || 'Unknown',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
      high: { bg: 'bg-red-100', text: 'text-red-800', label: 'High' },
      urgent: { bg: 'bg-red-200', text: 'text-red-900', label: 'Urgent' },
    }

    const config = priorityConfig[priority?.toLowerCase()] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: priority || 'Normal',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KSH',
    }).format(numAmount)
  }

  // CRUD Operations
  const handleCreate = async () => {
    try {
      await createOrderMutation.mutateAsync(formData as TOrders)
      setShowCreateModal(false)
      setFormData({
        order_number: '',
        total_amount: 0,
        status: OrderStatus.PENDING,
        priority: OrderPriority.Low,
        shipping_address: '',
        billing_address: '',
        user_id: 0,
      })
      toast.success('Order created successfully!')
    } catch (error) {
      toast.error('Failed to create order')
      console.error('Create error:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedOrder) return
    try {
      // Only send allowed fields for update
      const allowedFields = [
        // 'order_number', 
        'total_amount',
        'status',
        'priority',
        'shipping_address',
        'billing_address',
        'user_id',
      ]
      // Remove forbidden fields from formData before filtering
      const { shipped_at, delivered_at, ...formDataClean } = formData
      let updatePayload = Object.fromEntries(
        Object.entries(formDataClean).filter(([key]) =>
          allowedFields.includes(key),
        ),
      )
      // Extra safety: Remove forbidden fields 
      delete updatePayload.shipped_at
      delete updatePayload.delivered_at
      console.log('Update payload being sent:', updatePayload) // Debug log
      await updateOrderMutation.mutateAsync({
        id: selectedOrder.id.toString(),
        order: updatePayload as any,
      })
      setShowEditModal(false)
      setSelectedOrder(null)
      toast.success('Order updated successfully!')
    } catch (error) {
      toast.error('Failed to update order')
      console.error('Update error:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedOrder) return

    try {
      await deleteOrderMutation.mutateAsync(selectedOrder.id.toString())
      setShowDeleteModal(false)
      setSelectedOrder(null)
      toast.success('Order deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete order')
      console.error('Delete error:', error)
    }
  }

  const openEditModal = (order: TOrders) => {
    setSelectedOrder(order)
    setFormData(order)
    setShowEditModal(true)
  }

  const openDeleteModal = (order: TOrders) => {
    setSelectedOrder(order)
    setShowDeleteModal(true)
  }

  if (isLoading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (isError) {
    return (
      <LayoutWithSidebar>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-red-600">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      </LayoutWithSidebar>
    )
  }

  // Check if orders is not an array (API returned unexpected data)
  if (!Array.isArray(orders)) {
    return (
      <LayoutWithSidebar>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Unexpected Data Format
          </h3>
          <p className="text-yellow-600">
            The API returned unexpected data. Expected an array of orders, but
            got: {typeof orders}
          </p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(orders, null, 2)}
          </pre>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <>
        <Toaster position="top-right" richColors closeButton />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Orders</h1>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-600">Manage all customer orders</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-l-lg border ${viewMode === 'table' ? 'bg-orange-300 text-white' : 'bg-white text-white-600 border-none'} transition-colors`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-r-lg border-l-0 border ${viewMode === 'card' ? 'bg-orange-300 text-white' : 'bg-white text-orange-300 border-orange-300'} transition-colors`}
              >
                Card View
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-300 text-white rounded-lg hover:bg-orange-300 transition-colors ml-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Order
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
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-300"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card View */}
          {viewMode === 'card' && (
            <div className="overflow-y-auto max-h-[600px] mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-orange-300">#{order.order_number}</span>
                        {getStatusBadge(String(order.status))}
                      </div>
                      <div className="text-gray-700 mb-1">Customer: <span className="font-semibold">{order.user?.fullName || `User ${order.user_id}`}</span></div>
                      <div className="text-gray-700 mb-1">Total: <span className="font-semibold">{formatCurrency(order.total_amount)}</span></div>
                      <div className="text-gray-700 mb-1">Priority: {getPriorityBadge(order.priority)}</div>
                      <div className="text-gray-700 mb-1">Shipping: <span className="font-semibold">{order.shipping_address}</span></div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => openEditModal(order)} className="text-orange-600 hover:text-orange-900 p-1 rounded" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => openDeleteModal(order)} className="text-red-600 hover:text-red-900 p-1 rounded" title="Delete">
                        <Trash2 className="h-4 w-4" />
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shipping Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.user.fullName}
                              </div>
                              <div className="text-gray-500">
                                {order.user.email}
                              </div>
                            </div>
                          ) : (
                            `User ${order.user_id}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(String(order.status))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPriorityBadge(order.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.shipping_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(order)}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(order)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Table View (already present) */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(endIndex, filteredOrders.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {filteredOrders.length}
                        </span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === page
                                  ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ),
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ||
                statusFilter !== 'all' ||
                priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating a new order.'}
              </p>
            </div>
          )}
        </div>

        {/* Continue with modals... */}

        {/* Create Order Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Order
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Number
                    </label>
                    <input
                      type="text"
                      value={formData.order_number || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order_number: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter order number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input
                      type="text"
                      value={formData.total_amount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter amount (e.g., 99.99)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status || OrderStatus.PENDING}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as OrderStatus,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={OrderStatus.PENDING}>Pending</option>
                      <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                      <option value={OrderStatus.PROCESSING}>Processing</option>
                      <option value={OrderStatus.SHIPPED}>Shipped</option>
                      <option value={OrderStatus.DELIVERED}>Delivered</option>
                      <option value={OrderStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={formData.priority || OrderPriority.Low}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as OrderPriority,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={OrderPriority.Low}>Low</option>
                      <option value={OrderPriority.Medium}>Medium</option>
                      <option value={OrderPriority.High}>High</option>
                      <option value={OrderPriority.Urgent}>Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={formData.user_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user_id: parseInt(e.target.value) || 0,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      value={formData.shipping_address || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_address: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
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
                    disabled={createOrderMutation.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {createOrderMutation.isPending
                      ? 'Creating...'
                      : 'Create Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Order Modal */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Order #{selectedOrder.order_number}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total_amount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_amount: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status || OrderStatus.PENDING}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as OrderStatus,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={OrderStatus.PENDING}>Pending</option>
                      <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                      <option value={OrderStatus.PROCESSING}>Processing</option>
                      <option value={OrderStatus.SHIPPED}>Shipped</option>
                      <option value={OrderStatus.DELIVERED}>Delivered</option>
                      <option value={OrderStatus.CANCELLED}>Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <select
                      value={formData.priority || OrderPriority.Low}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as OrderPriority,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={OrderPriority.Low}>Low</option>
                      <option value={OrderPriority.Medium}>Medium</option>
                      <option value={OrderPriority.High}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      value={formData.shipping_address || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_address: e.target.value,
                        })
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
                    disabled={updateOrderMutation.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {updateOrderMutation.isPending
                      ? 'Updating...'
                      : 'Update Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">
                  Delete Order
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete order #
                    {selectedOrder.order_number}? This action cannot be undone.
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
                    disabled={deleteOrderMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </LayoutWithSidebar>
  )
}

export default AdminOrdersComponent
