import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-api')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test-api"!</div>
}
