import { env } from "@/src/config/env";

const RESEND_API_KEY = env.RESEND_API_KEY;

export class EmailService {
  /**
   * Send an HTML email via Resend API, or fall back to logging in development
   */
  public static async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!RESEND_API_KEY || RESEND_API_KEY.trim() === "" || RESEND_API_KEY === "undefined") {
      console.log("\n📬 =========================================");
      console.log(`[Email Service (FALLBACK MOCK LOGGER)]`);
      console.log(`To:      ${params.to}`);
      console.log(`Subject: ${params.subject}`);
      console.log(`Body:`);
      console.log(params.html);
      console.log("📬 =========================================\n");
      return { success: true, message: "Logged to console" };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "InternFlow <onboarding@internflow.app.com>",
          to: params.to,
          subject: params.subject,
          html: params.html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resend API Error details:", errorText);
        return { success: false, error: errorText };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error("Failed to send email via EmailService:", error);
      return { success: false, error };
    }
  }

  // --- Templates ---

  /**
   * Layout wrapper for email templates to provide a cohesive visual style
   */
  private static emailLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>InternFlow</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
              color: #111827;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid #e5e7eb;
            }
            .header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              padding: 30px 40px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.025em;
            }
            .header h1 span {
              color: #38bdf8;
            }
            .content {
              padding: 40px;
              line-height: 1.6;
              font-size: 16px;
            }
            .footer {
              background-color: #f3f4f6;
              padding: 20px 40px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #0f172a;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 20px;
              text-align: center;
            }
            .highlight-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .status-accepted {
              background-color: #d1fae5;
              color: #065f46;
            }
            .status-rejected {
              background-color: #fee2e2;
              color: #991b1b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Intern<span>Flow</span></h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>&copy; 2026 InternFlow. All rights reserved.</p>
              <p>You received this email because you opted in for notifications on InternFlow.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  public static getWelcomeEmailHtml(name: string): string {
    return this.emailLayout(`
      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Welcome to InternFlow, ${name}!</h2>
      <p>We are absolutely thrilled to have you join our platform. InternFlow helps streamline matching students with top companies for high-quality internship placements.</p>
      
      <div class="highlight-box">
        <h3 style="margin-top: 0; font-size: 16px;">Next steps to get started:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Complete your Profile with your university, major, and key skills.</li>
          <li style="margin-bottom: 8px;">Upload your CV to enable AI-powered matching and cover letter generator.</li>
          <li style="margin-bottom: 8px;">Browse active internships and apply in a single click.</li>
        </ul>
      </div>

      <p>If you have any questions, our support team is always here to help.</p>
      <a href="http://localhost:3000/login" class="button">Log In to Your Account</a>
    `);
  }

  public static getApplicationAcceptedEmailHtml(params: {
    studentName: string;
    internshipTitle: string;
    companyName: string;
  }): string {
    return this.emailLayout(`
      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700; color: #047857;">🎉 Congratulations, ${params.studentName}!</h2>
      <p>We have exciting news about your internship application.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 15px;">Your application for the position of <strong>${params.internshipTitle}</strong> at <strong>${params.companyName}</strong> has been:</p>
        <div style="margin-top: 12px;">
          <span class="status-badge status-accepted">Accepted</span>
        </div>
      </div>

      <p>The company representative will contact you shortly with information regarding onboarding, interview schedules, or offer details. Be sure to check your inbox regularly!</p>
      
      <a href="http://localhost:3000/dashboard/applications" class="button">View Applications</a>
    `);
  }

  public static getApplicationRejectedEmailHtml(params: {
    studentName: string;
    internshipTitle: string;
    companyName: string;
  }): string {
    return this.emailLayout(`
      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Update on your application</h2>
      <p>Hi ${params.studentName},</p>
      <p>Thank you for taking the time to apply for the <strong>${params.internshipTitle}</strong> internship at <strong>${params.companyName}</strong>. We appreciate your interest in our team.</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 15px;">Status of your application:</p>
        <div style="margin-top: 12px;">
          <span class="status-badge status-rejected">Declined</span>
        </div>
      </div>

      <p>After reviewing all candidates, the company has decided to move forward with other applicants whose experience matches their current requirements more closely.</p>
      <p>We encourage you to continue applying for other exciting opportunities on InternFlow. New internships are posted daily!</p>

      <a href="http://localhost:3000/internships" class="button">Browse Other Internships</a>
    `);
  }

  public static getNewInternshipEmailHtml(params: {
    studentName: string;
    internshipTitle: string;
    companyName: string;
    location: string;
    type: string;
  }): string {
    return this.emailLayout(`
      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">New Internship Match! 🚀</h2>
      <p>Hi ${params.studentName},</p>
      <p>A new internship matching your profile was posted on InternFlow:</p>

      <div class="highlight-box">
        <h3 style="margin-top: 0; font-size: 18px; color: #0f172a;">${params.internshipTitle}</h3>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b5563;">Company: <strong>${params.companyName}</strong></p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #4b5563;">Location: ${params.location} &bull; Type: ${params.type}</p>
      </div>

      <p>We recommend applying soon, as popular postings receive applicant matches quickly.</p>
      <a href="http://localhost:3000/internships" class="button">View Listing & Apply</a>
    `);
  }
}
