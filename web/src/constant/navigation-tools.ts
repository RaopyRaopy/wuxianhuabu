import { Video } from "lucide-react";

export const navigationTools = [
    {
        slug: "video",
        label: "视频创作台",
        icon: Video,
    },
] as const;

export type NavigationToolSlug = (typeof navigationTools)[number]["slug"];
