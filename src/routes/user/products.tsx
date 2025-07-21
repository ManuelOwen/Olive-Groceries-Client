import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/products')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/products"!</div>
}
