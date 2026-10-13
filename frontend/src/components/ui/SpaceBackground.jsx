import React, { useEffect, useRef } from "react";

/**
 * High-performance Space, Milky Way & Starfield Canvas Motion Background
 * Features:
 * - 300+ multi-depth twinkling stars with spectral colors
 * - Swirling Milky Way cosmic nebula clouds (cyan, violet, indigo, rose)
 * - Dynamic periodic shooting stars / meteors with glowing trails
 * - Subtle cursor gravitational starlight interaction
 * - Constellation starlight connections for nearby stars
 */
export function SpaceBackground({ interactive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for starlight attraction
    const mouse = {
      x: width / 2,
      y: height / 2,
      radius: 120,
      active: false,
    };

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    // Star Colors (Celestial Spectral Types)
    const starColors = [
      "rgba(255, 255, 255, ", // Pure white
      "rgba(165, 243, 252, ", // Cyan star (O-type)
      "rgba(196, 181, 253, ", // Violet star (B-type)
      "rgba(254, 240, 138, ", // Golden yellow star (G-type)
      "rgba(244, 114, 182, ", // Pink/Rose pulsar
      "rgba(147, 197, 253, ", // Electric blue star
    ];

    // Generate Stars
    let stars = [];
    const STAR_COUNT = Math.min(280, Math.floor((width * height) / 4500));

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.2,
          alpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          originalRadius: Math.random() * 1.8 + 0.4,
        });
      }
    }
    initStars();

    // Shooting Stars / Meteors
    let shootingStars = [];

    function maybeSpawnShootingStar() {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        const startX = Math.random() * width;
        const startY = Math.random() * (height * 0.4);
        const length = Math.random() * 120 + 80;
        const speed = Math.random() * 8 + 6;
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // diagonal down-right
        shootingStars.push({
          x: startX,
          y: startY,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          length,
          life: 1.0,
          decay: Math.random() * 0.018 + 0.012,
          color: Math.random() > 0.5 ? "#38bdf8" : "#c084fc",
        });
      }
    }

    // Nebula Galaxy background drift angle
    let galaxyRotation = 0;

    // Main Animation Loop
    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Deep Space Base Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#01040f");
      bgGrad.addColorStop(0.5, "#020617");
      bgGrad.addColorStop(1, "#03081e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Milky Way Cosmic Nebula Clouds
      galaxyRotation += 0.0003;
      
      // Nebula Arm 1: Deep Violet / Indigo
      const neb1 = ctx.createRadialGradient(
        width * 0.35 + Math.sin(galaxyRotation) * 40,
        height * 0.25 + Math.cos(galaxyRotation) * 30,
        50,
        width * 0.35,
        height * 0.25,
        Math.max(width, height) * 0.6
      );
      neb1.addColorStop(0, "rgba(99, 102, 241, 0.12)"); // Indigo
      neb1.addColorStop(0.4, "rgba(139, 92, 246, 0.07)"); // Purple
      neb1.addColorStop(0.8, "rgba(59, 130, 246, 0.02)");
      neb1.addColorStop(1, "transparent");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Nebula Arm 2: Vibrant Cyan / Teal Galactic Rift
      const neb2 = ctx.createRadialGradient(
        width * 0.75 - Math.cos(galaxyRotation) * 50,
        height * 0.65 - Math.sin(galaxyRotation) * 40,
        40,
        width * 0.75,
        height * 0.65,
        Math.max(width, height) * 0.55
      );
      neb2.addColorStop(0, "rgba(6, 182, 212, 0.11)"); // Cyan
      neb2.addColorStop(0.4, "rgba(14, 165, 233, 0.06)"); // Sky
      neb2.addColorStop(0.9, "transparent");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // Nebula Arm 3: Core Cosmic Cluster (Center Glow)
      const nebCore = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.4
      );
      nebCore.addColorStop(0, "rgba(236, 72, 153, 0.05)"); // Pink dust
      nebCore.addColorStop(0.5, "rgba(124, 58, 237, 0.03)");
      nebCore.addColorStop(1, "transparent");
      ctx.fillStyle = nebCore;
      ctx.fillRect(0, 0, width, height);

      // 3. Render and Update Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Drift slowly
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle Alpha
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Mouse gravity / glow interaction
        let currentRadius = star.radius;
        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const pull = (1 - dist / mouse.radius) * 1.5;
            currentRadius = star.originalRadius * (1 + pull);
          }
        }

        // Draw Star Glow (for larger stars)
        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, currentRadius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${star.colorPrefix}${star.alpha * 0.25})`;
          ctx.fill();
        }

        // Draw Star Core
        ctx.beginPath();
        ctx.arc(star.x, star.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${star.colorPrefix}${star.alpha})`;
        ctx.fill();
      }

      // 4. Draw Faint Constellation Links for Nearest Stars
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 6, stars.length); j++) {
          const s1 = stars[i];
          const s2 = stars[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 65) {
            const alpha = (1 - dist / 65) * 0.12;
            ctx.strokeStyle = `rgba(165, 243, 252, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }

      // 5. Update and Render Shooting Stars / Meteors
      maybeSpawnShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life -= s.decay;

        if (s.life <= 0 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw glowing meteor tail
        const tailX = s.x - (s.dx / Math.hypot(s.dx, s.dy)) * s.length;
        const tailY = s.y - (s.dy / Math.hypot(s.dx, s.dy)) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
        grad.addColorStop(0.2, `${s.color}${Math.floor(s.life * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "transparent");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor Head Glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-opacity duration-1000"
      style={{ background: "#020617" }}
    />
  );
}

export default SpaceBackground;
