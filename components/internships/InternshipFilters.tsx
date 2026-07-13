"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, MapPin, ArrowDownAZ } from "lucide-react";
import { Input } from "@/components/ui/input";

export function InternshipFilters({
  initialSearch = "",
  initialType = "ALL",
  initialLocation = "",
  initialSort = "newest",
  isStudent = false,
}: {
  initialSearch?: string;
  initialType?: string;
  initialLocation?: string;
  initialSort?: string;
  isStudent?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [sort, setSort] = useState(initialSort);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setType(searchParams.get("type") || "ALL");
    setLocation(searchParams.get("location") || "");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const updateFilters = (
    newSearch: string,
    newType: string,
    newLocation: string,
    newSort: string
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newType && newType !== "ALL") params.set("type", newType);
    if (newLocation) params.set("location", newLocation);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    // Reset page to 1 on any filter change
    params.set("page", "1");

    startTransition(() => {
      router.push(`/internships?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, type, location, sort);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    updateFilters(search, newType, location, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateFilters(search, type, location, newSort);
  };

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    setLocation("");
    setSort("newest");
    router.push("/internships");
  };

  const hasFilters = search !== "" || type !== "ALL" || location !== "" || sort !== "newest";

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-6">
      <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, company, or skills (e.g. React, Node, AI)..."
            className="pl-10 h-12 bg-background border-border/60 focus-visible:ring-primary text-base"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateFilters("", type, location, sort);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Search */}
        <div className="relative lg:w-72">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by city, country..."
            className="pl-10 h-12 bg-background border-border/60 focus-visible:ring-primary text-base"
          />
          {location && (
            <button
              type="button"
              onClick={() => {
                setLocation("");
                updateFilters(search, type, "", sort);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/95 active:scale-98 transition-all shadow-md hover:shadow-lg cursor-pointer text-base"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border/40 pt-5">
        {/* Work Mode Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Work Mode:
          </span>
          {["ALL", "Remote", "Hybrid", "Onsite"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                type.toLowerCase() === t.toLowerCase()
                  ? "bg-primary/10 text-primary border-primary/20 shadow-xs"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
              }`}
            >
              {t === "ALL" ? "All Modes" : t}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown & Clear Filters */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ArrowDownAZ className="w-3.5 h-3.5" />
            Sort By:
          </span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="h-10 px-3 pr-8 py-1 bg-background border border-border/60 hover:border-primary/50 text-sm font-semibold text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-xs"
          >
            <option value="newest">Newest Posted</option>
            <option value="oldest">Oldest Posted</option>
            <option value="most_applicants">Most Applicants</option>
            {isStudent && <option value="best_match">Best Match (AI)</option>}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              type="button"
              className="ml-2 text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="text-xs text-primary/70 animate-pulse font-medium">Updating listings...</div>
      )}
    </div>
  );
}
