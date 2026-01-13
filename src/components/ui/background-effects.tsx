"use client";

import React, { useEffect, useRef } from "react";

export function BackgroundRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let ripples: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const addRipple = (x: number, y: number) => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 0.3,
        opacity: 0.15,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ripples = ripples.filter((ripple) => ripple.opacity > 0.01);

      ripples.forEach((ripple) => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 166, 35, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ripple.radius += 3;
        ripple.opacity -= 0.002;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleClick = (e: MouseEvent) => {
      addRipple(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Add subtle ripple on mouse move (throttled)
      if (Math.random() > 0.95) {
        addRipple(e.clientX, e.clientY);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

// Animated grid background
export function AnimatedGridBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(245, 166, 35, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(255, 107, 107, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[150px] opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-secondary)] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}
