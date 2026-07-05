import Link from "next/link";
import { ArrowRight, Sparkles, Building2, GraduationCap, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Internship & Talent Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Bridge the Gap Between <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">Ambition & Opportunity</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
            InternFlow connects top university talent with forward-thinking companies. Streamlined applications, real-time tracking, and verified profiles in one seamless hub.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/internships"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              <GraduationCap className="w-5 h-5" />
              Browse Internships
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/register?role=COMPANY"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border/60 rounded-xl transition-all"
            >
              <Building2 className="w-5 h-5 text-primary" />
              Post an Internship
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 pt-8 border-t border-border/40 flex items-center justify-center gap-8 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Companies
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Instant Application Tracking
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
