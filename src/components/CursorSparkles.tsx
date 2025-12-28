import { useEffect, useRef, useCallback, useMemo } from "react";
interface Sparkle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    opacity: number;
    vx: number;
    vy: number;
}
export default function CursorSparkles() {
    const containerRef = useRef<HTMLCanvasElement>(null);
    const sparklesRef = useRef<Sparkle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const lastMouseXRef = useRef<number>(-1);
    const lastMouseYRef = useRef<number>(-1);
    const sparkleIdRef = useRef<number>(0);
    const colors = useMemo(() => [
        "#FFB3D9", 
        "#FFD9B3", 
        "#FFF4B3", 
        "#D9B3FF", 
        "#FFB3E6", 
    ], []);
    const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number = 0) => {
        ctx.beginPath();
        const spikes = 5; 
        const outerRadius = size;
        const innerRadius = size * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes - Math.PI / 2 + rotation;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    }, []);
    const createSparkle = useCallback((x: number, y: number): Sparkle => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return {
            id: sparkleIdRef.current++,
            x,
            y,
            color,
            size: 3 + Math.random() * 4,
            opacity: 0.6 + Math.random() * 0.3,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
        };
    }, [colors]);
    const animate = useCallback(() => {
        if (!containerRef.current) return;
        const canvas = containerRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparklesRef.current = sparklesRef.current.filter((sparkle) => {
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.opacity -= 0.02;
            sparkle.size *= 0.98;
            if (sparkle.opacity <= 0 || sparkle.size <= 0.5) {
                return false;
            }
            ctx.save();
            const rotation = (sparkle.id * 0.1) % (Math.PI * 2);
            ctx.shadowBlur = 8;
            ctx.shadowColor = sparkle.color;
            ctx.globalAlpha = sparkle.opacity * 0.4;
            ctx.fillStyle = sparkle.color;
            drawStar(ctx, sparkle.x, sparkle.y, sparkle.size * 1.2, rotation);
            ctx.fill();
            ctx.shadowBlur = 5;
            ctx.globalAlpha = sparkle.opacity;
            ctx.fillStyle = sparkle.color;
            drawStar(ctx, sparkle.x, sparkle.y, sparkle.size, rotation);
            ctx.fill();
            ctx.strokeStyle = sparkle.color;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = sparkle.opacity * 0.6;
            drawStar(ctx, sparkle.x, sparkle.y, sparkle.size, rotation);
            ctx.stroke();
            ctx.globalAlpha = sparkle.opacity * 0.8;
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return true;
        });
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [drawStar]);
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (lastMouseXRef.current === -1) {
                lastMouseXRef.current = e.clientX;
                lastMouseYRef.current = e.clientY;
                return;
            }
            const distance = Math.sqrt(
                Math.pow(e.clientX - lastMouseXRef.current, 2) +
                    Math.pow(e.clientY - lastMouseYRef.current, 2)
            );
            if (distance > 5) {
                const particleCount = Math.min(Math.max(1, Math.floor(distance / 20)), 3);
                for (let i = 0; i < particleCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 15;
                    const offsetY = (Math.random() - 0.5) * 15;
                    const sparkle = createSparkle(
                        e.clientX + offsetX,
                        e.clientY + offsetY
                    );
                    sparklesRef.current.push(sparkle);
                }
                lastMouseXRef.current = e.clientX;
                lastMouseYRef.current = e.clientY;
            }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [animate, createSparkle]);
    return (
        <canvas
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-[9999]"
            style={{ mixBlendMode: "normal" }}
        />
    );
}
