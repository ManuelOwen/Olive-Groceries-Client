import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver"!</div>
}
