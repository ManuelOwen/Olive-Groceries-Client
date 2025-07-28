import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import Header from '@/components/Header.tsx'
import Footer from '@/components/footer.tsx'
import { Toaster } from 'sonner'
import ChatInterface from '@/components/oliveAI/chatAi'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Footer />
   
      <Toaster position="top-right" richColors />
      <ChatInterface />
    </>
  ),
})
