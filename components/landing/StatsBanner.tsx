import { Users, Building, CheckCircle, TrendingUp } from "lucide-react";

export function StatsBanner() {
  const stats = [
    { label: "Active Internships", value: "500+", icon: CheckCircle },
    { label: "Partner Companies", value: "150+", icon: Building },
    { label: "Students Registered", value: "3,500+", icon: Users },
    { label: "Successful Placement", value: "94%", icon: TrendingUp },
  ];

  return (
    <section className="py-12 bg-card border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
