import { getInternshipById } from "@/lib/services/internship.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { ApplyButton } from "@/components/student/ApplyButton";
import { prisma } from "@/lib/db";

export default async function InternshipDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const internship = await getInternshipById(id);

  if (!internship) {
    notFound();
  }

  const user = await getCurrentUser();
  const isStudent = user?.role === "STUDENT";
  let hasApplied = false;

  if (isStudent && user?.studentId) {
    const existingApp = await prisma.application.findFirst({
      where: {
        studentId: user.studentId,
        internshipId: id,
      },
    });
    hasApplied = Boolean(existingApp);
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/internships">&larr; Back to Listings</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight mb-2">
                {internship.title}
              </CardTitle>
              <CardDescription className="text-xl text-primary font-medium">
                {internship.company.name}
              </CardDescription>
            </div>

            <ApplyButton
              internshipId={internship.id}
              isStudent={isStudent}
              hasApplied={hasApplied}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">LOCATION</p>
              <p className="font-medium">{internship.location}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">TYPE</p>
              <p className="font-medium">{internship.type}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">POSTED ON</p>
              <p className="font-medium">{new Date(internship.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">About the Role</h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
                {internship.description}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-xl font-semibold mb-3">About {internship.company.name}</h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-foreground/90 leading-relaxed">
                {internship.company.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
