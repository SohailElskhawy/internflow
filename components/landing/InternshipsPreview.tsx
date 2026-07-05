"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Building, ArrowRight, Sparkles } from "lucide-react";

interface InternshipItem {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  company: {
    name: string;
  };
}

export function InternshipsPreview() {
  const [internships, setInternships] = useState<InternshipItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/internships")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setInternships(res.data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-muted/30 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Latest Opportunities</span>
            </div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
              Featured Internship Roles
            </h2>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Explore open internships posted by leading organizations.
            </p>
          </div>
          <Link
            href="/internships"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All Internships <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-xl bg-card border border-border/60 animate-pulse p-6" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border/60">
            <p className="text-muted-foreground">No internships available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {internships.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium mb-3">
                    {item.type}
                  </span>
                  <h3 className="font-bold text-foreground text-lg line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.company?.name || "Company"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <Link
                  href={`/internships/${item.id}`}
                  className="mt-4 pt-4 border-t border-border/40 inline-flex items-center justify-between text-xs font-semibold text-primary hover:text-primary/80"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
