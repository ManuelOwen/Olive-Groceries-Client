import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  )
} 