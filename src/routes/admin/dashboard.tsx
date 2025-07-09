import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <LayoutWithSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div>Hello "/admin/dashboard"!</div>
      </div>
    </LayoutWithSidebar>
  );
}
