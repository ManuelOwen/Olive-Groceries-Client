import { createFileRoute } from '@tanstack/react-router'
import { DriverSidebar } from '@/components/drivers/driverDasboard'
import { isUserVerified, getUserData } from '@/lib/utils'
import { redirect } from '@tanstack/react-router'
import {
  Bell,
  Search,
} from 'lucide-react'

export const Route = createFileRoute('/driver/dashboard')({
  // Check if the user is verified by checking localStorage
  beforeLoad: () => {
    const isVerified = isUserVerified();
    console.log('User verification status:', isVerified);
    if (!isVerified) {
      throw redirect({ to: '/login' });
    }
  },
  component: DriverDashboard,
})

function DriverDashboard() {
  const userData = getUserData();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Driver Sidebar */}
      <DriverSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Driver Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {userData?.fullName || 'Driver'}! 🚛
              </h1>
              <p className="text-gray-600">
                Your delivery dashboard. Check your routes and orders.
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-orange-800 mb-2">Driver Dashboard</h2>
              <p className="text-orange-700">
                This is your driver dashboard. Here you can manage your deliveries, routes, and track your progress.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
