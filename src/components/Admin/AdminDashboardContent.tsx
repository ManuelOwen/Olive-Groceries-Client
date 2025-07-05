import { getUserData } from '@/lib/utils';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const AdminDashboardContent = () => {
  const userData = getUserData();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.fullName || 'Admin'}! 👨‍💼
        </h1>
        <p className="text-gray-600">
          Here's your admin overview for today.
        </p>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-green-600">567</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-orange-600">2,891</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">$45,210</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">Add, edit, or remove users</p>
            </button>
            
            <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Package className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Products</h4>
              <p className="text-sm text-gray-600">Add or edit product catalog</p>
            </button>
            
            <button className="p-4 text-left bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">Check sales and performance</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
