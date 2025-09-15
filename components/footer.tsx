"use client";

import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card"; // shadcn Card path — adjust if different
import { Button } from "@/components/ui/button";
import { Github, Mail, Instagram } from "lucide-react";

export default function CurvedFooter({ className = "", children = null }) {
  return (
    <footer className={`w-full ${className}`} aria-label="Site footer">
      {/* Curved card container with glassy blur effect */}
      <Card className="mx-auto max-w-6xl rounded-t-3xl overflow-hidden shadow-xl backdrop-blur-md bg-white/40 dark:bg-slate-900/40 border border-white/20">
        <CardContent className="px-6 md:px-12 py-8 md:py-12">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Brand / copy */}
            <div>
              <h3 className="text-lg font-semibold">Your Brand</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Short description or tagline. Keep it concise and useful — a single
                sentence that explains what you do.
              </p>

              <div className="flex gap-3 mt-4">
                <Button variant="ghost" size="sm" className="px-2 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="px-2 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="px-2 backdrop-blur-sm bg-white/20 dark:bg-slate-800/20">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Links */}
            <nav aria-label="Footer navigation" className="flex flex-col md:flex-row md:justify-center gap-6">
              <div>
                <h4 className="text-sm font-medium">Product</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Overview</li>
                  <li>Features</li>
                  <li>Pricing</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>About</li>
                  <li>Careers</li>
                  <li>Press</li>
                </ul>
              </div>
            </nav>

            {/* Newsletter / CTA */}
            <div>
              <h4 className="text-sm font-medium">Stay up to date</h4>
              <p className="mt-2 text-sm text-muted-foreground">Subscribe to our newsletter for product updates and tips.</p>
              <form className="mt-4 flex gap-2">
                <input
                  aria-label="Email address"
                  placeholder="you@domain.com"
                  className="flex-1 rounded-md border border-white/20 bg-white/30 dark:bg-slate-800/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 backdrop-blur-sm"
                />
                <Button type="submit" size="sm" className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/20">Subscribe</Button>
              </form>
            </div>
          </div>

          {/* bottom small print */}
          <div className="mt-8 border-t border-white/20 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} Your Brand — All rights reserved.</div>
            <div className="flex gap-4">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Contact</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </footer>
  );
}