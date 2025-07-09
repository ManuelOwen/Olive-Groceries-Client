import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <LayoutWithSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
        <div>Hello "/admin/settings/profile"!</div>
      </div>
    </LayoutWithSidebar>
  );
}
