import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";

import "./stroke-text.css";

type StrokeTextProps = {
    text?: string;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    drawDuration?: number;
    fillDelay?: number;
    stagger?: number;
    fontSize?: number | string;
    fontWeight?: number | string;
    letterSpacing?: number | string;
    trigger?: "mount" | "hover";
    className?: string;
    style?: CSSProperties;
};

export default function StrokeText({
    text = "Draw Attention",
    strokeColor = "#ffffff",
    fillColor = "#ffffff",
    strokeWidth = 1.2,
    drawDuration = 1.35,
    fillDelay = 0.12,
    stagger = 0.055,
    fontSize = 128,
    fontWeight = 700,
    letterSpacing = -3,
    trigger = "hover",
    className = "",
    style,
}: StrokeTextProps) {
    const rootRef = useRef<HTMLSpanElement>(null);
    const measureRef = useRef<SVGTextElement>(null);
    const [box, setBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const rawId = useId();
    const clipId = `stroke-text-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const characters = useMemo(() => Array.from(String(text)), [text]);
    const numericFontSize = Number(fontSize) || 128;
    const dash = Math.max(numericFontSize * 7, 200);

    useLayoutEffect(() => {
        const node = measureRef.current;
        if (!node) return;
        const measure = () => {
            const bbox = node.getBBox();
            if (!bbox.width) return;
            const pad = Math.max(Number(strokeWidth) || 1, numericFontSize * 0.1);
            setBox({ x: bbox.x - pad, y: bbox.y - pad, width: bbox.width + pad * 2, height: bbox.height + pad * 2 });
        };
        measure();
        document.fonts?.ready.then(measure).catch(() => undefined);
    }, [characters, numericFontSize, fontWeight, letterSpacing, strokeWidth]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !box) return;
        const strokes = gsap.utils.toArray<SVGTextElement>(root.querySelectorAll("[data-stroke-char]"));
        const fills = gsap.utils.toArray<SVGTextElement>(root.querySelectorAll("[data-fill-char]"));
        const wipe = root.querySelector<SVGRectElement>("[data-wipe]");
        const targets = [...strokes, ...fills, ...(wipe ? [wipe] : [])];
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const reveal = () => {
            gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 });
            gsap.set(fills, { opacity: 1 });
            if (wipe) gsap.set(wipe, { attr: { width: box.width } });
        };
        if (reducedMotion) {
            reveal();
            return () => gsap.killTweensOf(targets);
        }

        let timeline: gsap.core.Timeline | undefined;
        const play = () => {
            timeline?.kill();
            gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash });
            if (wipe) gsap.set(wipe, { attr: { width: 0 } });
            timeline = gsap.timeline();
            timeline.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease: "power2.out", stagger });
            if (wipe) timeline.to(wipe, { attr: { width: box.width }, duration: Math.max(0.45, drawDuration * 0.5), ease: "power2.inOut" }, drawDuration + fillDelay);
        };

        reveal();
        if (trigger === "mount") {
            play();
            return () => {
                timeline?.kill();
                gsap.killTweensOf(targets);
            };
        }
        root.addEventListener("pointerenter", play);
        root.addEventListener("pointerdown", play);
        return () => {
            root.removeEventListener("pointerenter", play);
            root.removeEventListener("pointerdown", play);
            timeline?.kill();
            gsap.killTweensOf(targets);
        };
    }, [box, dash, drawDuration, fillDelay, stagger, trigger]);

    const fontStyle = { fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` };
    const viewBox = box ? `${box.x} ${box.y} ${box.width} ${box.height}` : `0 ${-numericFontSize} 900 ${numericFontSize * 1.3}`;

    return (
        <span ref={rootRef} className={`stroke-text ${className}`.trim()} style={{ ...style, "--stroke-text-height": `${Math.round(numericFontSize * 1.3)}px` } as CSSProperties} role="img" aria-label={text}>
            <svg className="stroke-text__svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                {box ? (
                    <defs>
                        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                            <rect data-wipe x={box.x} y={box.y} width="0" height={box.height} />
                        </clipPath>
                    </defs>
                ) : null}
                <text ref={measureRef} x="0" y="0" fill="none" stroke="none" style={fontStyle}>
                    {characters.map((char, index) => <tspan key={`m-${index}`}>{char}</tspan>)}
                </text>
                <text x="0" y="0" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" style={fontStyle}>
                    {characters.map((char, index) => <tspan data-stroke-char key={`s-${index}`}>{char}</tspan>)}
                </text>
                <text x="0" y="0" fill={fillColor} stroke="none" style={fontStyle} clipPath={box ? `url(#${clipId})` : undefined}>
                    {characters.map((char, index) => <tspan data-fill-char key={`f-${index}`}>{char}</tspan>)}
                </text>
            </svg>
        </span>
    );
}
