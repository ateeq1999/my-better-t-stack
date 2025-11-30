import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/search')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/search"!</div>
}
