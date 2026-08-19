import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { AppTopNav } from "@/components/layout/app-top-nav";

export default function UserLayout({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const isHome = pathname === "/";
    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
            {isHome ? null : <AppTopNav />}
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </div>
    );
}
