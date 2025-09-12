"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useCallback } from "react";

interface FloatingObject {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  shape: 'sphere' | 'cube' | 'pyramid';
  color: string;
  rotation: { x: number; y: number; z: number };
  rotationSpeed: { x: number; y: number; z: number };
}

interface BackgroundGradientAnimationProps {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  isAnimationPaused?: boolean;
  containerClassName?: string;
}

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  isAnimationPaused = false,
  containerClassName,
}: BackgroundGradientAnimationProps) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  const [objects, setObjects] = useState<FloatingObject[]>([]);

  // Initialize floating objects
  const initializeObjects = useCallback(() => {
    const colors = [firstColor, secondColor, thirdColor, fourthColor, fifthColor];
    const shapes: ('sphere' | 'cube' | 'pyramid')[] = ['sphere', 'cube', 'pyramid'];
    
    const newObjects: FloatingObject[] = [];
    for (let i = 0; i < 15; i++) {
      newObjects.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 200 - 100,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 40 + 20,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: { x: 0, y: 0, z: 0 },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        }
      });
    }
    setObjects(newObjects);
  }, [firstColor, secondColor, thirdColor, fourthColor, fifthColor]);

  // Collision detection
  const checkCollision = (obj1: FloatingObject, obj2: FloatingObject) => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const dz = obj1.z - obj2.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance < (obj1.size + obj2.size) / 2;
  };

  // Handle collision
  const handleCollision = (obj1: FloatingObject, obj2: FloatingObject) => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const dz = obj1.z - obj2.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance === 0) return;
    
    const nx = dx / distance;
    const ny = dy / distance;
    const nz = dz / distance;
    
    const relativeVelocityX = obj1.vx - obj2.vx;
    const relativeVelocityY = obj1.vy - obj2.vy;
    const relativeVelocityZ = obj1.vz - obj2.vz;
    
    const speed = relativeVelocityX * nx + relativeVelocityY * ny + relativeVelocityZ * nz;
    
    if (speed < 0) return;
    
    const restitution = 0.8;
    const impulse = 2 * speed * restitution / 2;
    
    obj1.vx -= impulse * nx;
    obj1.vy -= impulse * ny;
    obj1.vz -= impulse * nz;
    obj2.vx += impulse * nx;
    obj2.vy += impulse * ny;
    obj2.vz += impulse * nz;
  };

  // Animation loop
  const animate = useCallback(() => {
    setObjects(prevObjects => {
      const updatedObjects = prevObjects.map(obj => {
        // Update position
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.z += obj.vz;

        // Update rotation
        obj.rotation.x += obj.rotationSpeed.x;
        obj.rotation.y += obj.rotationSpeed.y;
        obj.rotation.z += obj.rotationSpeed.z;

        // Boundary collisions
        if (obj.x <= obj.size / 2 || obj.x >= window.innerWidth - obj.size / 2) {
          obj.vx *= -0.8;
          obj.x = Math.max(obj.size / 2, Math.min(window.innerWidth - obj.size / 2, obj.x));
        }
        if (obj.y <= obj.size / 2 || obj.y >= window.innerHeight - obj.size / 2) {
          obj.vy *= -0.8;
          obj.y = Math.max(obj.size / 2, Math.min(window.innerHeight - obj.size / 2, obj.y));
        }
        if (obj.z <= -150 || obj.z >= 150) {
          obj.vz *= -0.8;
          obj.z = Math.max(-150, Math.min(150, obj.z));
        }

        // Add slight gravity and air resistance
        obj.vy += 0.02;
        obj.vx *= 0.999;
        obj.vy *= 0.999;
        obj.vz *= 0.999;

        return obj;
      });

      // Check collisions between objects
      for (let i = 0; i < updatedObjects.length; i++) {
        for (let j = i + 1; j < updatedObjects.length; j++) {
          if (checkCollision(updatedObjects[i], updatedObjects[j])) {
            handleCollision(updatedObjects[i], updatedObjects[j]);
          }
        }
      }

      return updatedObjects;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    document.body.style.setProperty(
      "--gradient-background-start",
      gradientBackgroundStart
    );
    document.body.style.setProperty(
      "--gradient-background-end",
      gradientBackgroundEnd
    );
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, []);

  useEffect(() => {
    initializeObjects();
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeObjects, animate]);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) {
        return;
      }
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(
        curX
      )}px, ${Math.round(curY)}px)`;
    }

    move();
  }, [tgX, tgY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  const renderObject = (obj: FloatingObject) => {
    const scale = 1 + obj.z / 200;
    const opacity = Math.max(0.3, 1 - Math.abs(obj.z) / 200);
    
    const baseStyle = {
      position: 'absolute' as const,
      left: obj.x - obj.size / 2,
      top: obj.y - obj.size / 2,
      width: obj.size,
      height: obj.size,
      transform: `scale(${scale}) rotateX(${obj.rotation.x}deg) rotateY(${obj.rotation.y}deg) rotateZ(${obj.rotation.z}deg)`,
      opacity: opacity,
      background: `linear-gradient(45deg, rgba(${obj.color}, 0.8), rgba(${obj.color}, 0.3))`,
      backdropFilter: 'blur(10px)',
      border: `1px solid rgba(${obj.color}, 0.5)`,
      boxShadow: `0 0 20px rgba(${obj.color}, 0.6), inset 0 0 20px rgba(${obj.color}, 0.2)`,
      zIndex: Math.floor(100 + obj.z),
    };

    switch (obj.shape) {
      case 'sphere':
        return (
          <div
            key={obj.id}
            style={{
              ...baseStyle,
              borderRadius: '50%',
            }}
          />
        );
      case 'cube':
        return (
          <div
            key={obj.id}
            style={{
              ...baseStyle,
              borderRadius: '8px',
            }}
          />
        );
      case 'pyramid':
        return (
          <div
            key={obj.id}
            style={{
              ...baseStyle,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              borderRadius: '4px',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-screen w-screen relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
      style={{ perspective: '1000px' }}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      <div className={cn("", className)}>{children}</div>
      
      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`
          )}
          style={{ animationPlayState: isAnimationPaused ? 'paused' : 'running' }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-400px)]`,
            `animate-second`,
            `opacity-100`
          )}
          style={{ animationPlayState: isAnimationPaused ? 'paused' : 'running' }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+400px)]`,
            `animate-third`,
            `opacity-100`
          )}
          style={{ animationPlayState: isAnimationPaused ? 'paused' : 'running' }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-200px)]`,
            `animate-fourth`,
            `opacity-70`
          )}
          style={{ animationPlayState: isAnimationPaused ? 'paused' : 'running' }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-800px)_calc(50%+800px)]`,
            `animate-fifth`,
            `opacity-100`
          )}
          style={{ animationPlayState: isAnimationPaused ? 'paused' : 'running' }}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`
            )}
          ></div>
        )}
      </div>

      {/* 3D Floating Objects */}
      <div className="absolute inset-0 pointer-events-none">
        {objects.map(renderObject)}
      </div>

      <style jsx>{`
        @keyframes first {
          0%, 100% { transform: translateX(-50%) translateY(-10%) rotate(0deg); }
          50% { transform: translateX(-50%) translateY(-10%) rotate(180deg); }
        }
        @keyframes second {
          0%, 100% { transform: translateX(-50%) translateY(-10%) rotate(0deg); }
          60% { transform: translateX(-50%) translateY(-10%) rotate(120deg); }
        }
        @keyframes third {
          0%, 100% { transform: translateX(-50%) translateY(-10%) rotate(0deg); }
          40% { transform: translateX(-50%) translateY(-10%) rotate(-120deg); }
        }
        @keyframes fourth {
          0%, 100% { transform: translateX(-50%) translateY(-10%) rotate(0deg); }
          50% { transform: translateX(-50%) translateY(-10%) rotate(360deg); }
        }
        @keyframes fifth {
          0%, 100% { transform: translateX(-50%) translateY(-10%) rotate(0deg); }
          50% { transform: translateX(-50%) translateY(-10%) rotate(-180deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-first { animation: first 20s ease-in-out infinite; }
        .animate-second { animation: second 20s ease-in-out infinite; }
        .animate-third { animation: third 20s ease-in-out infinite; }
        .animate-fourth { animation: fourth 15s ease-in-out infinite; }
        .animate-fifth { animation: fifth 20s ease-in-out infinite; }
      `}</style>
    </div>
  );
};