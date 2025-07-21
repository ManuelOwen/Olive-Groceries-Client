import { createFileRoute } from '@tanstack/react-router'
import { isUserVerified, getUserData } from '@/lib/utils'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/dashboard')({
  beforeLoad: () => {
    const userData = getUserData()
    const isVerified = isUserVerified(userData)
    console.log('User verification status:', isVerified)
    if (!isVerified) {
      throw redirect({ to: '/login' })
    }
  },
  component: DriverDashboard,
})

function DriverDashboard() {
  const userData = getUserData()

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-400">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Deliveries
          </h3>
          <p className="text-3xl font-bold text-orange-400 mt-2">5</p>
          <p className="text-gray-600 text-sm">Currently in progress</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
          <h3 className="text-lg font-semibold text-gray-900">
            Completed Today
          </h3>
          <p className="text-3xl font-bold text-green-400 mt-2">12</p>
          <p className="text-gray-600 text-sm">Successfully delivered</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-gray-900">
            Total Distance
          </h3>
          <p className="text-3xl font-bold text-blue-400 mt-2">45 km</p>
          <p className="text-gray-600 text-sm">Distance covered today</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-400">
          <h3 className="text-lg font-semibold text-gray-900">Earnings</h3>
          <p className="text-3xl font-bold text-purple-400 mt-2">$120</p>
          <p className="text-gray-600 text-sm">Today's earnings</p>
        </div>
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
}
