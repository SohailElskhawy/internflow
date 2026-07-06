import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateInternshipForm } from "@/components/company/create-internship-form";
import { CreateCompanyProfileForm } from "@/components/company/create-company-profile-form";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { getCompanyDashboardStats } from "@/lib/services/company-dashboard.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Users, Clock, CheckCircle2, XCircle, ArrowRight, Eye, PlusCircle } from "lucide-react";

import { CompanyAiInsightsWidget } from "@/components/ai/CompanyAiInsightsWidget";

export default async function CompanyDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || decoded.role !== "COMPANY") {
        redirect("/login");
    }

    // Fetch company profile
    const company = await getCompanyByUserId(decoded.id);

    if (!company) {
        return (
            <div className="container mx-auto p-4 max-w-4xl mt-10 flex justify-center">
                <CreateCompanyProfileForm />
            </div>
        );
    }

    const stats = await getCompanyDashboardStats(company.id);

    return (
        <div className="container mx-auto p-4 max-w-6xl mt-6 space-y-8">
            {/* Dashboard Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Company Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Welcome back, <span className="font-semibold text-primary">{company.name}</span>
                    </p>
                </div>
            </div>

            {/* AI Recruitment Insights Widget */}
            <CompanyAiInsightsWidget />

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-primary" /> Internships
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {stats.internshipCount}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-linear-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" /> Applications
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {stats.totalApplications}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-linear-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-600">
                            {stats.pendingCount}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-linear-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-emerald-600">
                            {stats.acceptedCount}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="bg-linear-to-br from-rose-500/5 to-rose-500/10 border-rose-500/20">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold text-rose-600">
                            {stats.rejectedCount}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Internships List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary" /> Active Internships
                        </h2>
                    </div>

                    {stats.internships.length === 0 ? (
                        <Card className="p-8 text-center border-dashed">
                            <CardContent className="space-y-3 pt-6">
                                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
                                <h3 className="text-lg font-semibold">No internships posted yet</h3>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Create your first internship posting to start receiving student applications.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {stats.internships.map((internship) => (
                                <Card key={internship.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-xl font-bold">
                                                    {internship.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    {internship.location} &bull; {internship.type}
                                                </CardDescription>
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 self-start sm:self-center">
                                                <Users className="w-3.5 h-3.5" /> {internship.applicationCount} Applicants
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {internship.description}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-2">
                                            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                                                <Link href={`/company/internships/${internship.id}`}>
                                                    <Eye className="w-3.5 h-3.5" /> Details
                                                </Link>
                                            </Button>

                                            <Button size="sm" asChild className="gap-1.5 text-xs font-semibold">
                                                <Link href={`/company/applicants/${internship.id}`}>
                                                    Manage Applicants <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Internship Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight">Post New Internship</h2>
                    </div>
                    <Card className="shadow-sm">
                        <CardContent className="pt-6">
                            <CreateInternshipForm companyId={company.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
