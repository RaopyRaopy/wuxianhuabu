import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import GradientWaves from "@/components/ui/gradient-waves";
import StrokeText from "@/components/ui/stroke-text";
import SpecularButton from "@/components/ui/specular-button";

export default function HomePage() {
    const navigate = useNavigate();
    return (
        <main className="relative flex h-full min-h-0 flex-col overflow-hidden bg-black text-white">
            <GradientWaves
                className="absolute inset-0"
                horizonColor="#5227FF"
                waveColor="#FF9FFC"
                crestColor="#FFFFFF"
                speed={0.4}
                amplitude={2.5}
                waveScale={0.6}
                waveRatio={0.9}
                swell={35}
                turbulence={20}
                tilt={1.11}
                zoom={1}
                height={5.5}
                fogDepth={15}
                detail="medium"
                brightness={1}
                opacity={1}
                mouseInteraction
                parallaxStrength={0.5}
                grain
                grainIntensity={0.05}
            />
            <div className="absolute inset-x-0 top-[23%] z-10 mx-auto w-[min(88vw,1100px)] text-center">
                <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.48em] text-white/45 sm:text-xs">INFINITE CANVAS / 01</p>
                <StrokeText text="Video generation" fontSize={166} fontWeight={700} letterSpacing={-5} className="mx-auto max-w-[1100px]" />
            </div>
            <div className="absolute inset-x-0 bottom-[15%] z-10 flex justify-center px-6">
                <SpecularButton size="lg" autoAnimate speed={0.28} onClick={() => navigate("/video")} className="specular-action group min-h-12 gap-4 px-6 text-sm font-medium tracking-[0.08em]">
                    <span>&#36827;&#20837;&#35270;&#39057;&#21019;&#20316;&#21488;</span>
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </SpecularButton>
            </div>
        </main>
    );
}
