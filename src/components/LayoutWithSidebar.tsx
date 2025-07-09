import React from 'react';
import { SidebarDashboard } from '@/components/sidebar';
import { AdminSidebar } from '@/components/Admin/adminSidebar';
import { UserSidebar } from '@/components/user/userSidebar';
import { DriverSidebar } from '@/components/drivers/driverDasboard';
import { isAdmin, isUser, isDriver } from '@/stores/authStore';

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const renderSidebar = () => {
    if (isAdmin()) return <AdminSidebar />;
    if (isUser()) return <UserSidebar />;
    if (isDriver()) return <DriverSidebar />;
    return <SidebarDashboard />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {renderSidebar()}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
} 