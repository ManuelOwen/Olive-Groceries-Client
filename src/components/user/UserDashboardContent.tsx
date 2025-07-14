import { getUserData } from '@/lib/utils'
import { ShoppingCart, Package, Heart, Clock, Star } from 'lucide-react'

export const UserDashboardContent = () => {
  const userData = getUserData()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.fullName || 'User'}! 🛒
        </h1>
        <p className="text-gray-600">
          Ready to shop for fresh groceries today?
        </p>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Orders</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Wishlist Items
              </p>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-orange-600">3</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Loyalty Points
              </p>
              <p className="text-2xl font-bold text-green-600">350</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  id: '#ORD-123',
                  date: '2025-01-02',
                  status: 'Delivered',
                  total: 'KSH 45.99',
                },
                {
                  id: '#ORD-124',
                  date: '2025-01-04',
                  status: 'Processing',
                  total: 'KSH 32.50',
                },
                {
                  id: '#ORD-125',
                  date: '2025-01-06',
                  status: 'Shipped',
                  total: 'KSH 67.25',
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {order.total}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Shop */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Shop</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-center bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Package className="h-8 w-8 text-orange-600 mb-2 mx-auto" />
                <h4 className="font-medium text-gray-900">Fresh Produce</h4>
              </button>

              <button className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <ShoppingCart className="h-8 w-8 text-green-600 mb-2 mx-auto" />
                <h4 className="font-medium text-gray-900">Groceries</h4>
              </button>

              <button className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Heart className="h-8 w-8 text-blue-600 mb-2 mx-auto" />
                <h4 className="font-medium text-gray-900">Favorites</h4>
              </button>

              <button className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Star className="h-8 w-8 text-purple-600 mb-2 mx-auto" />
                <h4 className="font-medium text-gray-900">Deals</h4>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboardContent
