import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboardContent } from '@/components/Admin/AdminDashboardContent'
import { UserDashboardContent } from '@/components/user/UserDashboardContent'
import { getUserData } from '@/lib/utils'
import { isAdmin, isUser, isDriver } from '@/stores/authStore'

function DashboardIndex() {
  const userData = getUserData()

  // Render content based on user role
  if (isAdmin()) {
    return <AdminDashboardContent />
  } else if (isUser()) {
    return <UserDashboardContent />
  } else if (isDriver()) {
    // For now, show a simple driver dashboard content
    return (
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
          <h2 className="text-lg font-semibold text-orange-800 mb-2">
            Driver Dashboard
          </h2>
          <p className="text-orange-700">
            This is your driver dashboard. Here you can manage your deliveries,
            routes, and track your progress.
          </p>
        </div>
      </div>
    )
  } else {
    // Fallback for unknown roles
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userData?.fullName || 'User'}!
          </h1>
          <p className="text-gray-600">Your dashboard is loading...</p>
        </div>
      </div>
    )
  }
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

export default DashboardIndex
