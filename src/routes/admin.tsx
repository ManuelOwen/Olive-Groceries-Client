import { createFileRoute,Outlet } from '@tanstack/react-router'
// import {AdminSidebar} from '@/components/sidebar'


export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex min-h-screen'>
    {/* <AdminSidebar /> */}
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        <Outlet />
      </main>
 


  </div>
}
