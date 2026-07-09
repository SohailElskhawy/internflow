"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function InternshipFilters({
  initialSearch = "",
  initialType = "ALL",
}: {
  initialSearch?: string;
  initialType?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setType(searchParams.get("type") || "ALL");
  }, [searchParams]);

  const updateFilters = (newSearch: string, newType: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newType && newType !== "ALL") params.set("type", newType);

    startTransition(() => {
      router.push(`/internships?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, type);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateFilters(search, newType);
  };

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    router.push("/internships");
  };

  const hasFilters = search !== "" || type !== "ALL";

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-xs space-y-6">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title, description, company, or location..."
            className="pl-10 h-11 bg-background border-border/60 focus-visible:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateFilters("", type);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="h-11 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter by Type:
        </span>
        {["ALL", "Full-time", "Part-time", "Remote", "Hybrid"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              type.toLowerCase() === t.toLowerCase()
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
            }`}
          >
            {t === "ALL" ? "All Types" : t}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={clearFilters}
            type="button"
            className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
      {isPending && (
        <div className="text-xs text-muted-foreground animate-pulse">Updating listings...</div>
      )}
    </div>
  );
}
