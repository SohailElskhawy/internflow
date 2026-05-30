import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllInternships } from "@/lib/services/internship.service";

export default async function InternshipsPage() {
    const internships = await getAllInternships();

    return (
        <div className="container mx-auto p-4 max-w-6xl mt-10">
            <h1 className="text-4xl font-bold mb-8 tracking-tight">Latest Internships</h1>
            
            {internships.length === 0 ? (
                <div className="text-center p-12 bg-muted/50 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">No internships found</h2>
                    <p className="text-muted-foreground">Check back later for new opportunities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {internships.map((internship) => (
                        <Card key={internship.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{internship.title}</CardTitle>
                                <CardDescription className="text-primary font-medium">
                                    {internship.company.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grow">
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center text-muted-foreground">
                                        <span className="font-semibold mr-2">Location:</span> 
                                        {internship.location}
                                    </div>
                                    <div className="flex items-center text-muted-foreground">
                                        <span className="font-semibold mr-2">Type:</span> 
                                        {internship.type}
                                    </div>
                                </div>
                                <p className="text-sm line-clamp-3">
                                    {internship.description}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-sm border-t pt-4">
                                <span className="text-muted-foreground">
                                    {new Date(internship.createdAt).toLocaleDateString()}
                                </span>
                                <Button asChild variant="outline">
                                    <Link href={`/internships/${internship.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
