import { useEffect, useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

import "./specular-button.css";

type SpecularButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children?: ReactNode;
    size?: "sm" | "md" | "lg";
    radius?: number;
    lineColor?: string;
    baseColor?: string;
    intensity?: number;
    speed?: number;
    followMouse?: boolean;
    autoAnimate?: boolean;
    proximity?: number;
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragment = `#version 300 es
precision highp float;
uniform vec2 uCenter; uniform vec2 uHalfSize; uniform float uRadius; uniform float uAngle;
uniform float uIntensity; uniform vec3 uLineColor; uniform vec3 uBaseColor;
out vec4 fragColor;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 p = gl_FragCoord.xy - uCenter; float d = sdRound(p, uHalfSize, uRadius);
  vec2 n = normalize(p / (uHalfSize * uHalfSize) + 1e-6); vec2 light = vec2(cos(uAngle), sin(uAngle));
  float rim = 1.0 - smoothstep(0.25, 0.85, acos(clamp(abs(dot(n, light)), 0.0, 1.0)));
  float line = exp(-pow(d / 1.8, 2.0)) * rim * uIntensity;
  float base = (1.0 - smoothstep(0.0, 2.0, abs(d))) * 0.35;
  fragColor = vec4(uBaseColor * base + uLineColor * line, clamp(base + line, 0.0, 1.0));
}`;

export default function SpecularButton({ children = "Get Started", size = "lg", radius = 12, lineColor = "#ffffff", baseColor = "#64748b", intensity = 1.4, speed = 0.35, followMouse = true, autoAnimate = false, proximity = 260, className = "", ...props }: SpecularButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const fxRef = useRef<HTMLSpanElement>(null);
    const settingsRef = useRef({ lineColor, baseColor, intensity, speed, followMouse, autoAnimate, proximity });

    useEffect(() => {
        settingsRef.current = { lineColor, baseColor, intensity, speed, followMouse, autoAnimate, proximity };
    }, [autoAnimate, baseColor, followMouse, intensity, lineColor, proximity, speed]);

    useEffect(() => {
        const button = buttonRef.current;
        const fx = fxRef.current;
        if (!button || !fx) return;
        const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const program = new Program(gl, { vertex, fragment, uniforms: { uCenter: { value: [0, 0] }, uHalfSize: { value: [1, 1] }, uRadius: { value: radius }, uAngle: { value: 2.4 }, uIntensity: { value: 0 }, uLineColor: { value: [1, 1, 1] }, uBaseColor: { value: [0.4, 0.4, 0.4] } } });
        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
        fx.appendChild(gl.canvas);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let angle = 2.4;
        let pointerAngle: number | null = null;
        let proximityValue = 0;
        let active = true;
        let raf = 0;
        const resize = () => {
            const rect = button.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);
            program.uniforms.uCenter.value = [(rect.width / 2) * dpr, (rect.height / 2) * dpr];
            program.uniforms.uHalfSize.value = [(rect.width / 2) * dpr, (rect.height / 2) * dpr];
        };
        const observer = new ResizeObserver(resize);
        observer.observe(button);
        resize();
        const onPointerMove = (event: PointerEvent) => {
            const rect = button.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
            const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
            const distance = Math.hypot(dx, dy);
            pointerAngle = Math.atan2(cy - event.clientY, event.clientX - cx);
            const t = Math.max(0, 1 - distance / Math.max(settingsRef.current.proximity, 1));
            proximityValue = t * t * (3 - 2 * t);
        };
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        const line = new Color();
        const base = new Color();
        let previous = performance.now();
        const update = (now: number) => {
            if (!active) return;
            raf = requestAnimationFrame(update);
            const dt = Math.min((now - previous) / 1000, 0.05);
            previous = now;
            const settings = settingsRef.current;
            angle += settings.speed * dt;
            if (settings.followMouse && pointerAngle !== null && proximityValue > 0) angle += (pointerAngle - angle) * 0.08;
            const brightness = settings.autoAnimate ? 1 : proximityValue;
            line.set(settings.lineColor); base.set(settings.baseColor);
            program.uniforms.uAngle.value = angle;
            program.uniforms.uIntensity.value = settings.intensity * brightness;
            program.uniforms.uLineColor.value = [line.r, line.g, line.b];
            program.uniforms.uBaseColor.value = [base.r, base.g, base.b];
            renderer.render({ scene: mesh });
        };
        raf = requestAnimationFrame(update);
        return () => {
            active = false;
            cancelAnimationFrame(raf);
            observer.disconnect();
            window.removeEventListener("pointermove", onPointerMove);
            if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [radius]);

    return <button ref={buttonRef} className={`specular-button specular-button--${size}${className ? ` ${className}` : ""}`} style={{ "--sb-radius": `${radius}px` } as CSSProperties} {...props}><span ref={fxRef} className="specular-button__fx" aria-hidden="true" /><span className="specular-button__label">{children}</span></button>;
}
