import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateInternshipForm } from "@/components/company/create-internship-form";
import { CreateCompanyProfileForm } from "@/components/company/create-company-profile-form";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    // Fetch the company profile
    const company = await getCompanyByUserId(decoded.id);

    if (!company) {
        return (
            <div className="container mx-auto p-4 max-w-4xl mt-10 flex justify-center">
                <CreateCompanyProfileForm />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl mt-10">
            <h1 className="text-3xl font-bold mb-8 tracking-tight">Dashboard: {company.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Your Internships</h2>
                    {company.internships.length === 0 ? (
                        <p className="text-muted-foreground">No internships posted yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {company.internships.map(internship => (
                                <li key={internship.id}>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{internship.title}</CardTitle>
                                            <CardDescription>{internship.location} &bull; {internship.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-foreground">{internship.description}</p>
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Post a New Internship</h2>
                    <CreateInternshipForm companyId={company.id} />
                </div>
            </div>
        </div>
    );
}
