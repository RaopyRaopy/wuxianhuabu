import { FolderOpen, House, ImagePlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { AppConfigModal } from "@/components/layout/app-config-modal";
import { UserStatusActions } from "@/components/layout/user-status-actions";

export function AppTopNav() {
    const { pathname } = useLocation();
    const imagePage = pathname === "/image";
    return (
        <>
            <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-stone-200 bg-background/90 backdrop-blur-xl dark:border-stone-800">
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-5 px-6">
                    <Link to="/video" className="flex h-full shrink-0 items-center gap-2 text-sm font-semibold leading-none tracking-tight text-stone-950 transition hover:text-stone-600 dark:text-stone-100 dark:hover:text-stone-300">
                        <span className="size-5 shrink-0 bg-current" style={{ mask: "url(/logo.svg) center / contain no-repeat", WebkitMask: "url(/logo.svg) center / contain no-repeat" }} />
                        <span className="text-base font-medium">{imagePage ? "\u56fe\u7247\u521b\u4f5c\u53f0" : "\u89c6\u9891\u521b\u4f5c\u53f0"}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/" className="specular-nav-link" aria-label={"\u8fd4\u56de\u9996\u9875"}>
                            <House className="size-4" aria-hidden="true" />
                            <span>{"\u8fd4\u56de\u9996\u9875"}</span>
                        </Link>
                        <Link to="/image" className="specular-nav-link">
                            <ImagePlus className="size-4" aria-hidden="true" />
                            <span>{"\u56fe\u7247\u521b\u4f5c"}</span>
                        </Link>
                        <Link to="/assets" className="specular-nav-link">
                            <FolderOpen className="size-4" aria-hidden="true" />
                            <span>{"\u6211\u7684\u7d20\u6750"}</span>
                        </Link>
                        <UserStatusActions />
                    </div>
                </div>
            </header>
            <AppConfigModal />
        </>
    );
}
