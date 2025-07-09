import { createFileRoute } from '@tanstack/react-router'
import { UserSidebar } from '@/components/user/userSidebar'
import { UserDashboardContent } from '@/components/user/UserDashboardContent'
import { isUserVerified } from '@/lib/utils'
import { redirect } from '@tanstack/react-router'
import {
  Bell,
  Search,
} from 'lucide-react'
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';

export const Route = createFileRoute('/dashboard/user')({
  // Check if the user is verified by checking localStorage
  beforeLoad: () => {
    const isVerified = isUserVerified();
    console.log('User verification status:', isVerified);
    if (!isVerified) {
      throw redirect({ to: '/login' });
    }
  },
  component: UserDashboard,
})

function UserDashboard() {
  console.log('UserDashboard component is rendering');
  return (
    <LayoutWithSidebar>
      {/* Place your profile page content here */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {/* ...rest of your profile page content... */}
      </div>
    </LayoutWithSidebar>
  );
}
