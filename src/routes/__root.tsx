import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import type { QueryClient } from '@tanstack/react-query'
import Header from '@/components/Header.tsx'
import { Toaster } from 'sonner' 

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackQueryLayout />
      <TanStackRouterDevtools />
      <Toaster position="top-center" richColors /> 
    </>
  ),
})
