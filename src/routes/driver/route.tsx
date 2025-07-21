import { Outlet, createFileRoute } from '@tanstack/react-router';
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';

export const Route = createFileRoute('/driver')({
  component: () => (
    <LayoutWithSidebar>
      <Outlet />
    </LayoutWithSidebar>
  ),
}); 