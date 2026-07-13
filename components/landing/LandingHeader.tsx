"use client";

import Link from "next/link";
import { Briefcase, User, Sparkles, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationCenter } from "@/components/notification/NotificationCenter";

export function LandingHeader() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        if (res.success && res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <span>Intern<span className="text-primary font-extrabold">Flow</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/internships" className="hover:text-primary transition-colors">Browse Internships</Link>
          <Link href="/#employers" className="hover:text-primary transition-colors">For Employers</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationCenter />
              <Link
                href={user.role === "COMPANY" ? "/company/dashboard" : "/dashboard"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                Dashboard ({user.name.split(" ")[0]})
              </Link>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/auth/logout", { method: "POST" });
                    if (res.ok) {
                      window.location.href = "/";
                    }
                  } catch (err) {
                    console.error("Failed to log out", err);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
