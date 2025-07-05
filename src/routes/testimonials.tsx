import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/testimonials')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/testimonials"!</div>
}
