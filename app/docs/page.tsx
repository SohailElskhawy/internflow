"use client";

import { useEffect, useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function DocsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Inject link for Swagger UI CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";
    document.head.appendChild(link);

    // 2. Inject script for Swagger UI Bundle
    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
            // @ts-ignore
            window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: "BaseLayout",
        });
        setLoading(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up injected elements
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      <main className="flex-1 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-card rounded-2xl border border-border shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">API Reference</h1>
              <p className="text-zinc-500 mt-1">
                Explore the InternFlow REST API specifications and endpoints dynamically.
              </p>
            </div>
            <a
              href="/openapi.json"
              download="openapi.json"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all text-center self-start sm:self-center"
            >
              Download OpenAPI Spec
            </a>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="text-muted-foreground text-sm font-medium animate-pulse">
                Loading interactive documentation...
              </p>
            </div>
          )}

          <div className={loading ? "hidden" : "block"}>
            {/* Custom styling override to clean up Swagger defaults and integrate with layout */}
            <style dangerouslySetInnerHTML={{ __html: `
              .swagger-ui {
                font-family: inherit !important;
              }
              .swagger-ui .info {
                margin: 20px 0 !important;
              }
              .swagger-ui .info .title {
                color: #18181b !important;
              }
              .swagger-ui .scheme-container {
                background: #f4f4f5 !important;
                border-radius: 12px !important;
                padding: 15px !important;
                box-shadow: none !important;
              }
              .swagger-ui .opblock {
                border-radius: 12px !important;
              }
            `}} />
            <div id="swagger-ui" />
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
