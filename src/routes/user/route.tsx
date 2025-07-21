import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LayoutWithSidebar } from '@/components/LayoutWithSidebar'

export const Route = createFileRoute("/user")({
    component:() =>(
        <LayoutWithSidebar>
        <Outlet />
        </LayoutWithSidebar>
    )
})