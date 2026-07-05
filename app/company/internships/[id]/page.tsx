import { getInternshipById } from "@/lib/services/internship.service";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ArrowLeft, Users, Calendar, MapPin, Briefcase } from "lucide-react";

export default async function CompanyInternshipDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== "COMPANY") {
        redirect("/login");
    }

    const company = await getCompanyByUserId(decoded.id);
    if (!company) {
        redirect("/login");
    }

    const internship = await getInternshipById(id);

    if (!internship) {
        notFound();
    }

    // Authorization check: Make sure this internship belongs to the logged in company
    if (internship.companyId !== company.id) {
        return (
            <div className="container mx-auto p-8 max-w-xl text-center mt-10">
                <h1 className="text-2xl font-bold text-rose-600 mb-4">403 Forbidden</h1>
                <p className="text-muted-foreground mb-6">You do not have permission to view this internship.</p>
                <Button asChild>
                    <Link href="/company/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl mt-6 space-y-6">
            <Button variant="ghost" asChild className="gap-2">
                <Link href="/company/dashboard">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </Button>

            <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/10 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-3xl font-bold tracking-tight text-foreground mb-1">
                                {internship.title}
                            </CardTitle>
                            <CardDescription className="text-base text-primary font-medium">
                                {company.name}
                            </CardDescription>
                        </div>
                        <Button asChild size="lg" className="gap-2">
                            <Link href={`/company/applicants/${internship.id}`}>
                                <Users className="w-4 h-4" /> Manage Applicants ({internship._count.applications})
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl border">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                            </p>
                            <p className="font-medium text-foreground">{internship.location}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-primary" /> Type
                            </p>
                            <p className="font-medium text-foreground">{internship.type}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-primary" /> Applicants
                            </p>
                            <p className="font-bold text-foreground text-lg">{internship._count.applications}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-primary" /> Created
                            </p>
                            <p className="font-medium text-foreground">
                                {new Date(internship.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric"
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">Role Description</h3>
                        <p className="whitespace-pre-line text-foreground/90 leading-relaxed bg-background p-4 rounded-lg border">
                            {internship.description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
