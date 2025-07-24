import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import type { QueryClient } from '@tanstack/react-query'
import Header from '@/components/Header.tsx'
import Footer from '@/components/footer.tsx'
import { Toaster } from 'sonner' 

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Footer />
      <TanStackQueryLayout />
      <TanStackRouterDevtools />
      <Toaster position="top-right" richColors /> 
    </>
  ),
})
