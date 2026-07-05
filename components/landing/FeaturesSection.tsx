import { Search, FileText, CheckCircle2, Building2, UserCheck, ShieldCheck } from "lucide-react";

export function FeaturesSection() {
  const studentFeatures = [
    {
      title: "Discover Top Opportunities",
      description: "Filter roles by industry, location, or work model (Remote, On-site, Hybrid).",
      icon: Search,
    },
    {
      title: "One-Click Application",
      description: "Apply instantly using your verified student profile and digital CV.",
      icon: FileText,
    },
    {
      title: "Real-Time Tracking",
      description: "Monitor your application status from Pending to Accepted live in your dashboard.",
      icon: CheckCircle2,
    },
  ];

  const companyFeatures = [
    {
      title: "Targeted Talent Reach",
      description: "Post internship listings to connect directly with university students and recent grads.",
      icon: Building2,
    },
    {
      title: "Streamlined Applicant Review",
      description: "Screen candidates, view profiles, and manage application statuses effortlessly.",
      icon: UserCheck,
    },
    {
      title: "Verified Hiring",
      description: "Build company credibility with verified profiles and structured candidate feedback.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Designed for Students & Employers
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Everything you need to launch your career or hire early-career talent efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For Students */}
          <div className="p-8 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                For Students
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Launch Your Career Faster</h3>
              <div className="space-y-6">
                {studentFeatures.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* For Companies */}
          <div id="employers" className="p-8 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 text-purple-600 text-xs font-bold uppercase tracking-wider mb-6">
                For Employers
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Hire Top Emerging Talent</h3>
              <div className="space-y-6">
                {companyFeatures.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
