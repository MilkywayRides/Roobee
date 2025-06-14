"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export function TerminalPreview() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 11,
      fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
      theme: {
        background: "#0f172a",
        foreground: "#e2e8f0",
        cursor: "#38bdf8",
        cursorAccent: "#0f172a",
      },
      rows: 6,
      cols: 35,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    const writeWithDelay = (text: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          term.writeln(text);
          resolve();
        }, delay);
      });
    };

    const demoContent = async () => {
      await writeWithDelay("\x1b[1;36m$ \x1b[0mTerminal View", 500);
      await writeWithDelay("\x1b[1;33mFeatures:\x1b[0m", 800);
      await writeWithDelay("  • Real-time collab", 1100);
      await writeWithDelay("  • Advanced features", 1400);
      await writeWithDelay("  • Secure & reliable", 1700);
      await writeWithDelay("\x1b[1;32m$ \x1b[0mTry it now!", 2000);
    };

    demoContent();

    terminal.current = term;

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="relative bg-slate-900/50 rounded-lg p-2 backdrop-blur-sm border border-slate-700/50">
        <div className="absolute -top-1 left-2 right-2 flex items-center justify-between">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <div className="text-[8px] font-medium text-slate-400">Live Preview</div>
        </div>
        <div 
          ref={terminalRef} 
          className="w-full h-[120px] rounded overflow-hidden border border-slate-700/50 bg-slate-900/90 shadow-lg"
        />
        <div className="absolute -bottom-1 left-2 right-2 flex items-center justify-between">
          <div className="text-[8px] font-medium text-slate-400">Press Enter</div>
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-medium text-slate-400">Live Demo</span>
          </div>
        </div>
      </div>
    </div>
  );
} 