import { Metadata } from "next";
import { TerminalWrapper } from "@/components/terminal/terminal-wrapper";

export const metadata: Metadata = {
  title: "Terminal | Beta",
  description: "Interactive terminal interface for Authentication",
};

export default function TerminalPage() {
  return <TerminalWrapper />;
} 