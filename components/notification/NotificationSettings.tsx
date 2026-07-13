"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Bell, Shield, CheckCircle2, RefreshCw } from "lucide-react";

interface NotificationPreferences {
  emailApplications: boolean;
  emailInternships: boolean;
  emailMarketing: boolean;
  pushNotifications: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preferences");
        return res.json();
      })
      .then((resData) => {
        if (resData.success && resData.data) {
          setPreferences(resData.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    const updatedVal = !preferences[key];
    const newPreferences = { ...preferences, [key]: updatedVal };
    
    setPreferences(newPreferences);
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: updatedVal }),
      });

      if (!res.ok) throw new Error("Failed to update preferences");
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      // Rollback
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
        <RefreshCw className="w-5 h-5 animate-spin" />
        Loading notification settings...
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-sm font-medium">
        Failed to load notification settings. Please try again.
      </div>
    );
  }

  return (
    <Card className="shadow-xs hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you want to be notified about updates on InternFlow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-primary" /> Email Notifications
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-sm font-semibold text-foreground">Applications</span>
                <p className="text-xs text-muted-foreground">
                  Get notified when companies accept, reject, or update your application status.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailApplications}
                onChange={() => handleToggle("emailApplications")}
                disabled={isSaving}
                className="w-4 h-4 text-primary bg-muted border-border rounded-sm focus:ring-primary focus:ring-offset-2 accent-primary mt-1"
              />
            </label>

            <label className="flex items-start justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-sm font-semibold text-foreground">Internship Postings</span>
                <p className="text-xs text-muted-foreground">
                  Receive email recommendations when new internships match your skills.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailInternships}
                onChange={() => handleToggle("emailInternships")}
                disabled={isSaving}
                className="w-4 h-4 text-primary bg-muted border-border rounded-sm focus:ring-primary focus:ring-offset-2 accent-primary mt-1"
              />
            </label>

            <label className="flex items-start justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-sm font-semibold text-foreground">Marketing & Digest</span>
                <p className="text-xs text-muted-foreground">
                  Stay updated with platform features, newsletters, and general marketing digests.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailMarketing}
                onChange={() => handleToggle("emailMarketing")}
                disabled={isSaving}
                className="w-4 h-4 text-primary bg-muted border-border rounded-sm focus:ring-primary focus:ring-offset-2 accent-primary mt-1"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4 border-t pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" /> Platform Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-start justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-sm font-semibold text-foreground">In-App Push Alerts</span>
                <p className="text-xs text-muted-foreground">
                  Enable the floating notification center badge for real-time dashboard notifications.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={() => handleToggle("pushNotifications")}
                disabled={isSaving}
                className="w-4 h-4 text-primary bg-muted border-border rounded-sm focus:ring-primary focus:ring-offset-2 accent-primary mt-1"
              />
            </label>
          </div>
        </div>

        {/* Save feedback banner */}
        {saveStatus === "success" && (
          <div className="flex items-center gap-1.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully.
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-1.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
            Failed to save preferences. Please check your connection.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
