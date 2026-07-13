import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllInternships } from "@/lib/services/internship.service";
import { InternshipFilters } from "@/components/internships/InternshipFilters";
import { Briefcase, MapPin, Calendar, Users, Building } from "lucide-react";

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const { search, type } = await searchParams;
  const internships = await getAllInternships(search, type);

  return (
    <div className="container mx-auto p-6 max-w-6xl mt-6 space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Explore Internships
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Discover opportunities to kickstart your career with top-tier organizations.
          </p>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{internships.length}</span> positions
        </div>
      </div>

      <InternshipFilters initialSearch={search} initialType={type} />

      {internships.length === 0 ? (
        <div className="text-center p-16 bg-muted/20 border border-dashed rounded-2xl max-w-2xl mx-auto space-y-4">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold tracking-tight">No internships found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn&apos;t find any opportunities matching your criteria. Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => {
            const applicantsCount = internship._count?.applications || 0;
            return (
              <Card key={internship.id} className="flex flex-col group hover:shadow-lg hover:border-primary/40 transition-all duration-300 rounded-xl bg-card border border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      internship.type.toLowerCase() === "remote" 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : internship.type.toLowerCase() === "hybrid"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                    }`}>
                      {internship.type}
                    </span>
                    {applicantsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/60 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5" />
                        {applicantsCount} {applicantsCount === 1 ? 'applicant' : 'applicants'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {internship.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    {internship.company.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow pb-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/75" /> 
                    <span>{internship.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed">
                    {internship.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs border-t border-border/40 pt-4 bg-muted/5 rounded-b-xl">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(internship.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Button asChild variant="outline" size="sm" className="font-semibold shadow-2xs hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50 transition-colors cursor-pointer">
                    <Link href={`/internships/${internship.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
