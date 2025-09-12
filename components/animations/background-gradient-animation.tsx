"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);

  // Apply CSS vars
  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    document.body.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    size,
    blendingValue,
  ]);

  // Smooth pointer movement
  useEffect(() => {
    function move() {
      if (!interactiveRef.current) return;
      setCurX((prev) => prev + (tgX - prev) / 20);
      setCurY((prev) => prev + (tgY - prev) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    }
    move();
  }, [tgX, tgY, curX, curY]);

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

  return (
    <div
      className={cn(
        "h-screen w-screen relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
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

      {/* Gradient Layers */}
      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
        onMouseMove={handleMouseMove}
      >
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] animate-first`
          )}
          style={{ animationPlayState: isAnimationPaused ? "paused" : "running" }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)] no-repeat`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] animate-second`
          )}
          style={{ animationPlayState: isAnimationPaused ? "paused" : "running" }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)] no-repeat`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] animate-third`
          )}
          style={{ animationPlayState: isAnimationPaused ? "paused" : "running" }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)] no-repeat`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] animate-fourth`
          )}
          style={{ animationPlayState: isAnimationPaused ? "paused" : "running" }}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)] no-repeat`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)]`,
            `top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)] animate-fifth`
          )}
          style={{ animationPlayState: isAnimationPaused ? "paused" : "running" }}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)] no-repeat`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2 opacity-70`
            )}
          ></div>
        )}
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
        .animate-first { animation: first 20s ease-in-out infinite; }
        .animate-second { animation: second 20s ease-in-out infinite; }
        .animate-third { animation: third 20s ease-in-out infinite; }
        .animate-fourth { animation: fourth 15s ease-in-out infinite; }
        .animate-fifth { animation: fifth 20s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
