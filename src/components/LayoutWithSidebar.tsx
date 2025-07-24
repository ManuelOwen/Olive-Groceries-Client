import React from 'react';
// import { SidebarDashboard } from '@/components/sidebar';
import { AdminSidebar } from '@/components/Admin/adminSidebar';
import { UserSidebar } from '@/components/user/userSidebar';
import { DriverSidebar } from '@/components/drivers/driverDasboard';
import { useAuthStore } from '@/stores/authStore';

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && role === 'admin' && <AdminSidebar />}
      {isAuthenticated && role === 'user' && <UserSidebar />}
      {isAuthenticated && role === 'driver' && <DriverSidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
} 