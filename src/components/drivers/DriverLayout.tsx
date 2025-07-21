import { DriverSidebar } from './driverDasboard'
import { useAuthStore } from '@/stores/authStore'

interface DriverLayoutProps {
  children: React.ReactNode
}

export const DriverLayout = ({ children }: DriverLayoutProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const isDriver = isAuthenticated && user?.role === 'driver'
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (only for authenticated drivers) */}
      {isDriver && <DriverSidebar />}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">
              Driver Dashboard
            </h2>
            <div className="flex items-center space-x-4">
              {/* You can add notifications, user menu, etc. here */}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
