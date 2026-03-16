"use client";
import { useEffect, useRef } from "react";

// ✨ Saturated Palette for visibility on light backgrounds
const COLORS = ["#FFD700", "#C98895", "#82A899", "#D4A24C", "#8A5559", "#6D7E5E"];

class Particle {
  x: number;
  y: number;
  size: number;
  life: number;
  decay: number;
  speedX: number;
  speedY: number;
  color: string;
  type: string;
  angle: number;
  spin: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    // 🤏 Slightly smaller base size for better performance and cleaner look
    this.size = Math.random() * 4 + 2; 
    this.life = 1;
    // ⚡ Slightly faster decay to prevent particle buildup
    this.decay = Math.random() * 0.02 + 0.015;
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = (Math.random() - 0.5) * 3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.2;
    
    const typeChance = Math.random();
    this.type = typeChance > 0.97 ? "cherry" : typeChance > 0.88 ? "star" : "glow";
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    this.angle += this.spin;
    this.size *= 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color;
    
    // Reduced blur slightly to save on GPU draw calls
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;

    if (this.type === "star") {
      this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2.5);
    } else if (this.type === "cherry") {
      ctx.font = `${this.size * 2.5}px serif`;
      ctx.fillText("🍒", 0, 0);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(0, -outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }
}

export default function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const addParticles = (e: MouseEvent) => {
      // 📉 Spawn 3 particles instead of 5 to reduce CPU load
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push(new Particle(e.clientX, e.clientY));
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", addParticles);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.life <= 0 || p.size <= 0.4) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", addParticles);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
    />
  );
}