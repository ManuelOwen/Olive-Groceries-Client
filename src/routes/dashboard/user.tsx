import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'
import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/components/api/url'
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { OrderStatus } from '@/interfaces/orderInterface'

export const Route = createFileRoute('/dashboard/user')({
  beforeLoad: () => {
    // Use direct import and getState for auth store
    const { user, isAuthenticated, token } = useAuthStore.getState();
    console.log('User dashboard beforeLoad - user:', user, 'isAuthenticated:', isAuthenticated, 'token:', token);
    if (!isAuthenticated || !user || !user.id || !token) {
      throw redirect({ to: '/login' });
    }
  },
  component: UserDashboard,
})

// Fetch user orders
const fetchUserOrders = async (userId: string) => {
  console.log('Fetching orders for user:', userId)
  const token = useAuthStore.getState().token
  console.log('Token available:', !!token)

  try {
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      headers: {
        Authorization: 'Bearer ${token}',
        'Content-Type': 'application/json',
      },
    })
    console.log('Orders response status:', response.status)

    if (!response.ok) {
      console.error('Orders API error:', response.status, response.statusText)
      // Return empty array as fallback
      return []
    }

    const data = await response.json()
    console.log('Orders data:', data)
    return data
  } catch (error) {
    console.error('Orders fetch error:', error)
    return []
  }
}

// Fetch user payments
const fetchUserPayments = async (userId: string) => {
  console.log('Fetching payments for user:', userId)
  const token = useAuthStore.getState().token

  try {
    const response = await fetch(`${API_URL}/payments/user/${userId}`, {
      headers: {
        Authorization: 'Bearer ${token}',
        'Content-Type': 'application/json',
      },
    })
    console.log('Payments response status:', response.status)

    if (!response.ok) {
      console.error('Payments API error:', response.status, response.statusText)
      // Return empty array as fallback
      return []
    }

    const data = await response.json()
    console.log('Payments data:', data)
    return data
  } catch (error) {
    console.error('Payments fetch error:', error)
    return []
  }
}

function UserDashboard() {
  const { user } = useAuthStore()

  console.log('Current user:', user)
  console.log('User ID:', user?.id)

  // Fetch user orders
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['userOrders', user?.id],
    queryFn: () => fetchUserOrders(user?.id || ''),
    enabled: !!user?.id,
  })

  // Fetch user payments
  const {
    data: payments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ['userPayments', user?.id],
    queryFn: () => fetchUserPayments(user?.id || ''),
    enabled: !!user?.id,
  })

  console.log('Orders data:', orders)
  console.log('Payments data:', payments)
  console.log('Orders error:', ordersError)
  console.log('Payments error:', paymentsError)

  // Filter orders by status
  const pendingOrders =
    orders?.filter((order: any) => order.status === OrderStatus.PENDING) || []
  const recentOrders = orders?.slice(0, 5) || [] // Last 5 orders
  const lastPayments = payments?.slice(0, 3) || [] // Last 3 payments

  if (ordersLoading || paymentsLoading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            Debug Info:
          </h3>
          <p className="text-xs text-yellow-700">
            User ID: {user?.id || 'Not found'}
          </p>
          <p className="text-xs text-yellow-700">
            Orders: {orders?.length || 0}
          </p>
          <p className="text-xs text-yellow-700">
            Payments: {payments?.length || 0}
          </p>
          {ordersError && (
            <p className="text-xs text-red-600">
              Orders Error: {ordersError.message}
            </p>
          )}
          {paymentsError && (
            <p className="text-xs text-red-600">
              Payments Error: {paymentsError.message}
            </p>
          )}
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2" />
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Mail className="mr-2 text-gray-500" />
              <span className="font-medium">{user?.email || 'No email'}</span>
            </div>
            <div className="flex items-center">
              <User className="mr-2 text-gray-500" />
              <span className="font-medium">{user?.fullName || 'No name'}</span>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 text-gray-500" />
              <span className="font-medium">
                {user?.phoneNumber || 'No phone'}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 text-gray-500" />
              <span className="font-medium">
                {user?.address || 'No address'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.length || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingOrders.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completed Orders
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {orders?.filter(
                    (order: any) => order.status === OrderStatus.DELIVERED,
                  ).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === OrderStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === OrderStatus.DELIVERED
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: KSH {order.total_amount}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent orders</p>
          )}
        </div>

        {/* Last Payments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2" />
            Last Payments
          </h2>
          {lastPayments.length > 0 ? (
            <div className="space-y-4">
              {lastPayments.map((payment: any) => (
                <div key={payment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Payment #{payment.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-green-600 font-semibold">
                      KSH {payment.amount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Method: {payment.payment_method}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No payment history</p>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
