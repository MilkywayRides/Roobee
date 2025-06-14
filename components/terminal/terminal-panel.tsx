"use client";

import { useEffect, useRef, useState } from "react";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import { signIn, signOut, useSession } from "next-auth/react";
import Cookies from "js-cookie";
import "xterm/css/xterm.css";

// Add custom scrollbar styles
const scrollbarStyles = `
  .xterm-viewport::-webkit-scrollbar {
    width: 8px;
  }
  .xterm-viewport::-webkit-scrollbar-track {
    background: #000000;
  }
  .xterm-viewport::-webkit-scrollbar-thumb {
    background: #333333;
    border-radius: 4px;
  }
  .xterm-viewport::-webkit-scrollbar-thumb:hover {
    background: #444444;
  }
`;

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Session {
  user?: User;
  expires: string;
}

interface Command {
  description: string;
  usage: string;
  execute: (args: string[], term: Terminal) => string[] | Promise<string[]>;
}

interface HistoryEntry {
  command: string;
  output: string[];
  timestamp: number;
}

interface TerminalPanelProps {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
}

export function TerminalPanel() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const commandHistory = useRef<string[]>([]);
  const sessionHistory = useRef<HistoryEntry[]>([]);
  const currentCommand = useRef<string>("");
  const commandBuffer = useRef<string>("");
  const historyIndex = useRef<number>(-1);
  const terminalInstance = useRef<Terminal | null>(null);
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // Silent handling of unauthenticated state
    },
  });

  const writePrompt = (term: Terminal) => {
    const username = session?.user?.name?.toLowerCase() || "roobee";
    const hostname = "auth-system";
    const currentDir = "~";
    term.write(`\r\n\x1b[38;5;99m${username}\x1b[0m@\x1b[38;5;99m${hostname}\x1b[0m:\x1b[38;5;39m${currentDir}\x1b[0m$ `);
  };

  const clearTerminal = (term: Terminal) => {
    term.clear();
    // Clear command history from cookies
    Cookies.remove('commandHistory');
    // Clear session history
    sessionHistory.current = [];
    // Clear command history
    commandHistory.current = [];
    // Clear current command
    currentCommand.current = '';
    // Clear command buffer
    commandBuffer.current = '';
    // Reset history index
    historyIndex.current = -1;
    term.writeln("\x1b[38;5;99m┌──────────────────────────────────────────────────────────┐\x1b[0m");
    term.writeln("\x1b[38;5;99m│\x1b[0m  \x1b[1mWelcome to Roobee Auth System Terminal\x1b[0m");
    term.writeln("\x1b[38;5;99m│\x1b[0m  Type 'help' to see available commands");
    term.writeln("\x1b[38;5;99m└──────────────────────────────────────────────────────────┘\x1b[0m");
  };

  const commands: { [key: string]: Command } = {
    help: {
      description: "Show available commands",
      usage: "help [command]",
      execute: (args: string[], term: Terminal) => {
        const output = [
          "\x1b[38;5;99m┌─ Available Commands ─┐\x1b[0m",
          ...Object.entries(commands).map(([cmd, { description }]) => 
            `\x1b[38;5;99m│\x1b[0m \x1b[38;5;39m${cmd.padEnd(10)}\x1b[0m - ${description}`
          ),
          "\x1b[38;5;99m└────────────────────┘\x1b[0m"
        ];
        output.forEach(line => term.writeln(line));
        return output;
      },
    },
    clear: {
      description: "Clear terminal screen and history",
      usage: "clear",
      execute: (args: string[], term: Terminal) => {
        clearTerminal(term);
        return [];
      },
    },
    login: {
      description: "Login to your account",
      usage: "login <email> <password>",
      execute: async (args: string[], term: Terminal) => {
        if (args.length < 2) {
          term.writeln("\r\n\x1b[31mError: Email and password required\x1b[0m");
          term.writeln("Usage: login <email> <password>");
          return [];
        }

        try {
          term.writeln("\r\n\x1b[33mAttempting to login...\x1b[0m");
          
          const result = await signIn("credentials", {
            email: args[0],
            password: args[1],
            redirect: false
          });

          if (result?.error) {
            if (result.error === "Invalid credentials") {
              term.writeln("\r\n\x1b[31mError: Invalid email or password\x1b[0m");
              term.writeln("\x1b[33mIf you haven't verified your email, please check your inbox for the verification code.\x1b[0m");
              term.writeln("\x1b[33mUse 'verify <code>' to verify your email.\x1b[0m");
            } else {
              term.writeln(`\r\n\x1b[31mError: ${result.error}\x1b[0m`);
            }
            return [];
          }

          if (result?.ok) {
            term.writeln("\r\n\x1b[32mLogin successful!\x1b[0m");
            term.writeln("Welcome back!");
            // Force a session refresh
            window.location.reload();
          } else {
            term.writeln("\r\n\x1b[31mError: Login failed\x1b[0m");
            term.writeln("\x1b[33mPlease try again or use 'google' or 'github' to login.\x1b[0m");
          }
          return [];
        } catch (error) {
          console.error("Login error:", error);
          term.writeln("\r\n\x1b[31mError: Failed to login. Please try again.\x1b[0m");
          return [];
        }
      }
    },
    register: {
      description: "Register a new account",
      usage: "register <email> <password> <name>",
      execute: async (args: string[], term: Terminal) => {
        if (args.length < 3) {
          term.writeln("\r\n\x1b[31mError: Email, password, and name required\x1b[0m");
          term.writeln("Usage: register <email> <password> <name>");
          return [];
        }

        try {
          term.writeln("\r\n\x1b[33mRegistering new account...\x1b[0m");
          
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: args[0],
              password: args[1],
              name: args[2]
            })
          });

          const data = await response.json();

          if (!response.ok) {
            term.writeln(`\r\n\x1b[31mError: ${data.message || 'Registration failed'}\x1b[0m`);
            return [];
          }

          term.writeln("\r\n\x1b[32mRegistration successful!\x1b[0m");
          term.writeln("Please check your email for the verification code.");
          term.writeln("Use 'verify <code>' to verify your email.");
          return [];
        } catch (error) {
          console.error("Registration error:", error);
          term.writeln("\r\n\x1b[31mError: Failed to register. Please try again.\x1b[0m");
          return [];
        }
      }
    },
    verify: {
      description: "Verify your email address",
      usage: "verify <code>",
      execute: async (args: string[], term: Terminal) => {
        if (args.length < 1) {
          term.writeln("\r\n\x1b[31mError: Verification code required\x1b[0m");
          term.writeln("Usage: verify <code>");
          return [];
        }

        try {
          term.writeln("\r\n\x1b[33mVerifying email...\x1b[0m");
          
          // Get email from session history or command history
          const email = sessionHistory.current
            .filter(entry => entry.command.startsWith('register'))
            .map(entry => entry.command.split(' ')[1])
            .pop();

          if (!email) {
            term.writeln("\r\n\x1b[31mError: No registration found\x1b[0m");
            term.writeln("\x1b[33mPlease register first using the 'register' command.\x1b[0m");
            return [];
          }

          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              otp: args[0]
            })
          });

          if (!response.ok) {
            const data = await response.json();
            term.writeln(`\r\n\x1b[31mError: ${data.error || 'Verification failed'}\x1b[0m`);
            return [];
          }

          term.writeln("\r\n\x1b[32mEmail verified successfully!\x1b[0m");
          term.writeln("You can now login using the 'login' command.");
          return [];
        } catch (error) {
          console.error("Verification error:", error);
          term.writeln("\r\n\x1b[31mError: Failed to verify email. Please try again.\x1b[0m");
          return [];
        }
      }
    },
    reset: {
      description: "Reset your password",
      usage: "reset <email>",
      execute: async (args: string[], term: Terminal) => {
        if (args.length < 1) {
          term.writeln("\r\n\x1b[31mError: Email required\x1b[0m");
          term.writeln("Usage: reset <email>");
          return [];
        }

        try {
          const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: args[0] })
          });

          const data = await response.json();

          if (response.ok) {
            term.writeln("\r\n\x1b[32mPassword reset email sent!\x1b[0m");
            term.writeln("Please check your email for reset instructions.");
          } else {
            term.writeln(`\r\n\x1b[31mError: ${data.error}\x1b[0m`);
          }
          return [];
        } catch (error) {
          term.writeln("\r\n\x1b[31mError: Failed to connect to server\x1b[0m");
          return [];
        }
      }
    },
    logout: {
      description: "Logout from your account",
      usage: "logout",
      execute: async (args: string[], term: Terminal) => {
        try {
          await signOut({ callbackUrl: "/terminal" });
          term.writeln("\r\n\x1b[32mLogged out successfully!\x1b[0m");
          return [];
        } catch (error) {
          term.writeln("\r\n\x1b[31mError: Failed to logout\x1b[0m");
          return [];
        }
      }
    },
    google: {
      description: "Login with Google",
      usage: "google",
      execute: async (args: string[], term: Terminal) => {
        try {
          term.writeln("\r\n\x1b[33mInitiating Google OAuth...\x1b[0m");
          await signIn("google", { 
            callbackUrl: "/terminal",
            redirect: true
          });
          return [];
        } catch (error) {
          console.error("Google OAuth error:", error);
          term.writeln("\r\n\x1b[31mError: Failed to initiate Google login. Please try again.\x1b[0m");
          return [];
        }
      }
    },
    github: {
      description: "Login with GitHub",
      usage: "github",
      execute: async (args: string[], term: Terminal) => {
        try {
          term.writeln("\r\n\x1b[33mInitiating GitHub OAuth...\x1b[0m");
          await signIn("github", { 
            callbackUrl: "/terminal",
            redirect: true
          });
          return [];
        } catch (error) {
          console.error("GitHub OAuth error:", error);
          term.writeln("\r\n\x1b[31mError: Failed to initiate GitHub login. Please try again.\x1b[0m");
          return [];
        }
      }
    },
    user: {
      description: "Show current user information",
      usage: "user",
      execute: (args: string[], term: Terminal) => {
        console.log('Executing user command with status:', status);
        console.log('Session data:', session);

        if (status === "loading") {
          term.writeln("\r\n\x1b[33mLoading session...\x1b[0m");
          term.writeln("\x1b[33mPlease wait a moment and try again.\x1b[0m");
          return [];
        }

        if (status === "unauthenticated") {
          term.writeln("\r\n\x1b[31mError: Not logged in\x1b[0m");
          term.writeln("\x1b[33mPlease use 'google' or 'github' to login.\x1b[0m");
          return [];
        }

        if (!session?.user) {
          term.writeln("\r\n\x1b[31mError: No user data available\x1b[0m");
          term.writeln("\x1b[33mTry logging in again using 'google' or 'github'.\x1b[0m");
          return [];
        }

        const user = session.user;
        const output = [
          "\x1b[38;5;99m┌─ Current User ─┐\x1b[0m",
          `\x1b[38;5;99m│\x1b[0m \x1b[38;5;39mName:\x1b[0m  ${user.name || 'Not set'}`,
          `\x1b[38;5;99m│\x1b[0m \x1b[38;5;39mEmail:\x1b[0m ${user.email || 'Not set'}`,
          "\x1b[38;5;99m└───────────────┘\x1b[0m"
        ];
        output.forEach(line => term.writeln(line));
        return output;
      }
    }
  };

  // Load command history from cookies
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = Cookies.get("terminalHistory");
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory) as HistoryEntry[];
          const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
          const validHistory = parsedHistory.filter(entry => entry.timestamp > tenDaysAgo);
          
          commandHistory.current = validHistory.map(entry => entry.command);
          sessionHistory.current = validHistory;
          
          // Update cookie with cleaned history
          Cookies.set("terminalHistory", JSON.stringify(validHistory), { expires: 10 });
        } catch (error) {
          console.error("Error parsing command history:", error);
          commandHistory.current = [];
          sessionHistory.current = [];
        }
      }
    }
  }, []);

  // Save command history to cookies
  const saveCommandHistory = (command: string, output: string[]) => {
    const historyEntry: HistoryEntry = {
      command,
      output: output.map(line => line.trim()).filter(line => line),
      timestamp: Date.now(),
    };
    sessionHistory.current = [...sessionHistory.current, historyEntry];
    commandHistory.current = [...commandHistory.current, command];
    Cookies.set('commandHistory', JSON.stringify(commandHistory.current), { expires: 10 });
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      return undefined;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !terminalRef.current || typeof window === "undefined") return;

    const initTerminal = async () => {
      try {
        const [{ Terminal }, { FitAddon }] = await Promise.all([
          import("xterm"),
          import("xterm-addon-fit")
        ]);

        const term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: "Ubuntu Mono, monospace",
          theme: {
            background: "#000000",
            foreground: "#FFFFFF",
            cursor: "#FFFFFF",
            black: "#000000",
            red: "#CD0000",
            green: "#00CD00",
            yellow: "#CDCD00",
            blue: "#0000EE",
            magenta: "#CD00CD",
            cyan: "#00CDCD",
            white: "#E5E5E5",
            brightBlack: "#7F7F7F",
            brightRed: "#FF0000",
            brightGreen: "#00FF00",
            brightYellow: "#FFFF00",
            brightBlue: "#5C5CFF",
            brightMagenta: "#FF00FF",
            brightCyan: "#00FFFF",
            brightWhite: "#FFFFFF"
          },
          convertEol: true,
          scrollback: 1000,
          rows: 24,
          cols: 80,
        });

        terminalInstance.current = term;

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current!);
        term.focus();
        fitAddon.fit();

        // Welcome message
        term.writeln("\x1b[38;5;99m┌──────────────────────────────────────────────────────────┐\x1b[0m");
        term.writeln("\x1b[38;5;99m│\x1b[0m  \x1b[1mWelcome to Roobee Auth System Terminal\x1b[0m");
        term.writeln("\x1b[38;5;99m│\x1b[0m  Type 'help' to see available commands");
        term.writeln("\x1b[38;5;99m└──────────────────────────────────────────────────────────┘\x1b[0m");

        // Display previous session history
        if (sessionHistory.current.length > 0) {
          term.writeln("\x1b[38;5;99m┌─ Previous Session History ─┐\x1b[0m");
          sessionHistory.current.forEach((entry, index) => {
            if (entry && entry.command) {
              term.writeln(`\x1b[38;5;99m│\x1b[0m \x1b[38;5;99mCommand ${index + 1}\x1b[0m`);
              term.writeln(`\x1b[38;5;99m│\x1b[0m \x1b[38;5;39m$ ${entry.command}\x1b[0m`);
              if (entry.output && Array.isArray(entry.output)) {
                entry.output.forEach(line => {
                  if (line && typeof line === 'string' && line.trim()) {
                    term.writeln(`\x1b[38;5;99m│\x1b[0m \x1b[38;5;245m${line}\x1b[0m`);
                  }
                });
              }
            }
          });
          term.writeln("\x1b[38;5;99m└──────────────────────────┘\x1b[0m");
        }

        writePrompt(term);

        // Handle input
        term.onKey(({ key, domEvent }) => {
          const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

          if (domEvent.keyCode === 13) { // Enter
            const command = commandBuffer.current.trim();
            term.write("\r\n");

            if (command) {
              const outputLines: string[] = [];
              const originalWrite = term.write.bind(term);
              const originalWriteln = term.writeln.bind(term);

              term.write = (data: string) => {
                if (typeof data === 'string') {
                  outputLines.push(data);
                }
                return originalWrite(data);
              };

              term.writeln = (data: string) => {
                if (typeof data === 'string') {
                  outputLines.push(data);
                }
                return originalWriteln(data);
              };

              const parts = command.split(" ");
              const cmd = parts[0].toLowerCase();
              const args = parts.slice(1);

              const commandHandler = commands[cmd];
              if (commandHandler) {
                currentCommand.current = cmd;
                // Don't save clear command to history
                if (cmd !== 'clear') {
                  const result = commandHandler.execute(args, term);
                  if (result instanceof Promise) {
                    result.then(output => {
                      if (output && output.length > 0) {
                        saveCommandHistory(command, output);
                      }
                    });
                  } else if (result && result.length > 0) {
                    saveCommandHistory(command, result);
                  }
                } else {
                  commandHandler.execute(args, term);
                }
              } else {
                term.writeln(`\x1b[38;5;196mCommand not found: ${cmd}\x1b[0m`);
                term.writeln("\x1b[38;5;245mType 'help' to see available commands\x1b[0m");
                if (outputLines.length > 0) {
                  saveCommandHistory(command, outputLines.filter(line => line && typeof line === 'string'));
                }
              }

              term.write = originalWrite;
              term.writeln = originalWriteln;
            }

            writePrompt(term);
            commandBuffer.current = "";
            historyIndex.current = -1;
          } else if (domEvent.keyCode === 8) { // Backspace
            if (commandBuffer.current.length > 0) {
              commandBuffer.current = commandBuffer.current.slice(0, -1);
              term.write("\b \b");
            }
          } else if (domEvent.keyCode === 38) { // Up arrow
            if (historyIndex.current < commandHistory.current.length - 1) {
              historyIndex.current++;
              const historyCommand = commandHistory.current[historyIndex.current];
              term.write("\r\x1b[K");
              commandBuffer.current = historyCommand;
              writePrompt(term);
              term.write(historyCommand);
            }
          } else if (domEvent.keyCode === 40) { // Down arrow
            if (historyIndex.current > 0) {
              historyIndex.current--;
              const historyCommand = commandHistory.current[historyIndex.current];
              term.write("\r\x1b[K");
              commandBuffer.current = historyCommand;
              writePrompt(term);
              term.write(historyCommand);
            } else if (historyIndex.current === 0) {
              historyIndex.current = -1;
              term.write("\r\x1b[K");
              commandBuffer.current = "";
              writePrompt(term);
            }
          } else if (printable) {
            commandBuffer.current += key;
            term.write(key);
          }
        });

        // Handle command history navigation
        term.attachCustomKeyEventHandler((e) => {
          if (e.key === "ArrowUp" && e.ctrlKey) {
            e.preventDefault();
            if (historyIndex.current < commandHistory.current.length - 1) {
              historyIndex.current++;
              const command = commandHistory.current[historyIndex.current];
              commandBuffer.current = command;
              term.write("\r\x1b[K");
              writePrompt(term);
              term.write(command);
            }
          } else if (e.key === "ArrowDown" && e.ctrlKey) {
            e.preventDefault();
            if (historyIndex.current > 0) {
              historyIndex.current--;
              const command = commandHistory.current[historyIndex.current];
              commandBuffer.current = command;
              term.write("\r\x1b[K");
              writePrompt(term);
              term.write(command);
            } else if (historyIndex.current === 0) {
              historyIndex.current = -1;
              commandBuffer.current = "";
              term.write("\r\x1b[K");
              writePrompt(term);
            }
          }
          return true;
        });

        const handleResize = () => {
          if (terminalRef.current) {
            fitAddon.fit();
          }
        };

        handleResize();
        const resizeObserver = new ResizeObserver(handleResize);
        if (terminalRef.current) {
          resizeObserver.observe(terminalRef.current);
        }

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          resizeObserver.disconnect();
          term.dispose();
        };
      } catch (error) {
        console.error("Failed to initialize terminal:", error);
      }
    };

    const cleanup = initTerminal();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [isReady]);

  return (
    <div
      ref={terminalRef}
      className="absolute inset-0"
    />
  );
} 