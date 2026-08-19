import { memo, useEffect, useRef, type HTMLAttributes } from "react";

import "./dot-field.css";

type DotFieldProps = HTMLAttributes<HTMLDivElement> & {
    dotRadius?: number;
    dotSpacing?: number;
    cursorRadius?: number;
    cursorForce?: number;
    bulgeOnly?: boolean;
    bulgeStrength?: number;
    glowRadius?: number;
    sparkle?: boolean;
    waveAmplitude?: number;
    gradientFrom?: string;
    gradientTo?: string;
    glowColor?: string;
};

const TWO_PI = Math.PI * 2;

const DotField = memo(function DotField({
    dotRadius = 1.5,
    dotSpacing = 14,
    cursorRadius = 500,
    cursorForce = 0.1,
    bulgeOnly = true,
    bulgeStrength = 67,
    glowRadius = 160,
    sparkle = false,
    waveAmplitude = 0,
    gradientFrom = "rgba(168, 85, 247, 0.35)",
    gradientTo = "rgba(180, 151, 207, 0.25)",
    glowColor = "#120F17",
    className,
    ...rest
}: DotFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glowRef = useRef<SVGCircleElement>(null);
    const dotsRef = useRef<Array<{ ax: number; ay: number; sx: number; sy: number }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;
        if (!canvas || !parent) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        const mouse = { x: -9999, y: -9999, previousX: -9999, previousY: -9999, speed: 0 };
        const glow = { opacity: 0 };
        let frame = 0;
        let animation = 0;
        let active = true;
        let resizeTimer: number | undefined;

        const buildDots = (width: number, height: number) => {
            const step = dotRadius + dotSpacing;
            const columns = Math.max(1, Math.floor(width / step));
            const rows = Math.max(1, Math.floor(height / step));
            const padX = (width - (columns - 1) * step) / 2;
            const padY = (height - (rows - 1) * step) / 2;
            dotsRef.current = Array.from({ length: rows * columns }, (_, index) => {
                const column = index % columns;
                const row = Math.floor(index / columns);
                const x = padX + column * step;
                const y = padY + row * step;
                return { ax: x, ay: y, sx: x, sy: y };
            });
        };

        const resize = () => {
            const rect = parent.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildDots(rect.width, rect.height);
        };

        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(resize, 100);
        };
        const onMouseMove = (event: MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        };
        const updateSpeed = () => {
            const dx = mouse.x - mouse.previousX;
            const dy = mouse.y - mouse.previousY;
            mouse.speed += (Math.hypot(dx, dy) - mouse.speed) * 0.5;
            mouse.previousX = mouse.x;
            mouse.previousY = mouse.y;
        };

        const speedTimer = window.setInterval(updateSpeed, 20);
        const tick = () => {
            if (!active) return;
            const rect = parent.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const engagement = Math.min(mouse.speed / 5, 1);
            glow.opacity += (engagement - glow.opacity) * 0.08;
            const glowElement = glowRef.current;
            if (glowElement) {
                glowElement.setAttribute("cx", String(mouse.x));
                glowElement.setAttribute("cy", String(mouse.y));
                glowElement.style.opacity = String(glow.opacity);
            }
            context.clearRect(0, 0, width, height);
            const gradient = context.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, gradientFrom);
            gradient.addColorStop(1, gradientTo);
            context.fillStyle = gradient;
            context.beginPath();
            const radius = dotRadius / 2;
            const cursorRadiusSquared = cursorRadius * cursorRadius;
            dotsRef.current.forEach((dot, index) => {
                const dx = mouse.x - dot.ax;
                const dy = mouse.y - dot.ay;
                const distanceSquared = dx * dx + dy * dy;
                if (distanceSquared < cursorRadiusSquared && engagement > 0.01) {
                    const distance = Math.sqrt(distanceSquared) || 1;
                    const amount = (1 - distance / cursorRadius) ** 2 * bulgeStrength * engagement;
                    const angle = Math.atan2(dy, dx);
                    dot.sx += (dot.ax - Math.cos(angle) * amount - dot.sx) * 0.15;
                    dot.sy += (dot.ay - Math.sin(angle) * amount - dot.sy) * 0.15;
                } else {
                    dot.sx += (dot.ax - dot.sx) * 0.1;
                    dot.sy += (dot.ay - dot.sy) * 0.1;
                }
                const wave = waveAmplitude > 0 ? Math.sin(dot.ax * 0.03 + frame * 0.02) * waveAmplitude : 0;
                const drawX = dot.sx + (waveAmplitude > 0 ? Math.cos(dot.ay * 0.03 + frame * 0.014) * waveAmplitude * 0.5 : 0);
                const drawY = dot.sy + wave;
                const sparkleSize = sparkle && (((index * 2654435761) ^ (frame >> 3)) >>> 0) % 100 < 3 ? radius * 1.8 : radius;
                context.moveTo(drawX + sparkleSize, drawY);
                context.arc(drawX, drawY, sparkleSize, 0, TWO_PI);
            });
            context.fill();
            frame += 1;
            animation = requestAnimationFrame(tick);
        };

        resize();
        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMouseMove, { passive: true });
        animation = requestAnimationFrame(tick);
        return () => {
            active = false;
            cancelAnimationFrame(animation);
            window.clearInterval(speedTimer);
            window.clearTimeout(resizeTimer);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMouseMove);
        };
    }, [bulgeStrength, cursorRadius, dotRadius, dotSpacing, gradientFrom, gradientTo, sparkle, waveAmplitude]);

    return (
        <div className={`dot-field-container pointer-events-none ${className || ""}`} {...rest}>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <radialGradient id="dot-field-glow">
                        <stop offset="0%" stopColor={glowColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
                <circle ref={glowRef} cx="-9999" cy="-9999" r={glowRadius} fill="url(#dot-field-glow)" />
            </svg>
        </div>
    );
});

export default DotField;
