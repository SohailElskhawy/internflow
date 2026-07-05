import Link from "next/link";
import { Briefcase } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 pb-12 border-b border-border/40">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
              <span>Intern<span className="text-primary font-extrabold">Flow</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connecting high-potential university students with top-tier internships. Secure, verified, and streamlined.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/internships" className="hover:text-primary transition-colors">Browse Internships</Link></li>
              <li><Link href="/register?role=STUDENT" className="hover:text-primary transition-colors">For Students</Link></li>
              <li><Link href="/register?role=COMPANY" className="hover:text-primary transition-colors">For Employers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary transition-colors">Log In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} InternFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
