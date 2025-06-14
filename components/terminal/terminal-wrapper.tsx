"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { TerminalPanel } from "./terminal-panel";

function TerminalWithSession() {
  return <TerminalPanel />;
}

export function TerminalWrapper() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <SessionProvider>
        <TerminalWithSession />
      </SessionProvider>
    </div>
  );
} 