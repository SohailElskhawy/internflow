"use client";

import Link from "next/link";
import { Briefcase, User, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingHeader() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
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
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/internships" className="hover:text-primary transition-colors">Browse Internships</Link>
          <Link href="#employers" className="hover:text-primary transition-colors">For Employers</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={user.role === "COMPANY" ? "/company/dashboard" : "/dashboard"}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              <User className="w-4 h-4" />
              Dashboard ({user.name.split(" ")[0]})
            </Link>
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
