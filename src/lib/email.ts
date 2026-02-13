import nodemailer from "nodemailer";

// Create reusable transporter
// In production, use real SMTP credentials from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to CourseMaster! 🎓",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CourseMaster</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                  🎓 CourseMaster
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                  Your Learning Journey Starts Here
                </p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 24px;">
                  Welcome aboard, ${name}! 👋
                </h2>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                  We're thrilled to have you join our community of learners! Your account has been successfully created and you're all set to start your learning journey.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                  Here's what you can do next:
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                  <tr>
                    <td style="padding: 15px; background-color: #f7f8fc; border-radius: 8px; margin-bottom: 10px;">
                      <table>
                        <tr>
                          <td style="padding-right: 15px;">
                            <span style="display: inline-block; width: 40px; height: 40px; background-color: #667eea; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold;">1</span>
                          </td>
                          <td>
                            <strong style="color: #1a1a2e;">Browse Courses</strong>
                            <p style="color: #718096; margin: 5px 0 0; font-size: 14px;">Explore our catalog of expert-led courses</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 10px;"></td></tr>
                  <tr>
                    <td style="padding: 15px; background-color: #f7f8fc; border-radius: 8px; margin-bottom: 10px;">
                      <table>
                        <tr>
                          <td style="padding-right: 15px;">
                            <span style="display: inline-block; width: 40px; height: 40px; background-color: #667eea; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold;">2</span>
                          </td>
                          <td>
                            <strong style="color: #1a1a2e;">Enroll in a Course</strong>
                            <p style="color: #718096; margin: 5px 0 0; font-size: 14px;">Find a course that matches your goals</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 10px;"></td></tr>
                  <tr>
                    <td style="padding: 15px; background-color: #f7f8fc; border-radius: 8px;">
                      <table>
                        <tr>
                          <td style="padding-right: 15px;">
                            <span style="display: inline-block; width: 40px; height: 40px; background-color: #667eea; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold;">3</span>
                          </td>
                          <td>
                            <strong style="color: #1a1a2e;">Start Learning</strong>
                            <p style="color: #718096; margin: 5px 0 0; font-size: 14px;">Track your progress and earn certificates</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/courses" 
                         style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">
                        Explore Courses →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f7f8fc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #718096; font-size: 14px; margin: 0 0 10px;">
                  Need help? Contact us at 
                  <a href="mailto:support@coursemaster.com" style="color: #667eea; text-decoration: none;">support@coursemaster.com</a>
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} CourseMaster. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Welcome to CourseMaster, ${name}!

We're thrilled to have you join our community of learners. Your account has been successfully created.

Here's what you can do next:
1. Browse our catalog of expert-led courses
2. Enroll in a course that matches your goals
3. Start learning and track your progress

Visit: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/courses

Need help? Contact us at support@coursemaster.com

© ${new Date().getFullYear()} CourseMaster. All rights reserved.
    `,
  }),

  enrollmentConfirmation: (name: string, courseName: string) => ({
    subject: `You're enrolled in ${courseName}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
              <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Enrollment Confirmed!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a2e; margin: 0 0 20px;">Hi ${name},</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                  You've successfully enrolled in <strong>${courseName}</strong>. 
                  Start learning now and take the first step towards your goals!
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                  <tr>
                    <td style="text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" 
                         style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px;">
                        Go to My Courses →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Hi ${name}, You've successfully enrolled in ${courseName}. Start learning now!`,
  }),
};

// Send email function
export async function sendEmail(
  to: string,
  template: { subject: string; html: string; text: string }
): Promise<{ success: boolean; error?: string }> {
  // Skip sending in development if no SMTP configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("📧 Email would be sent to:", to);
    console.log("📧 Subject:", template.subject);
    console.log("📧 (SMTP not configured - email skipped in development)");
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"CourseMaster" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log("📧 Email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("📧 Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// Convenience functions
export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(to, emailTemplates.welcome(name));
}

export async function sendEnrollmentEmail(
  to: string,
  name: string,
  courseName: string
) {
  return sendEmail(to, emailTemplates.enrollmentConfirmation(name, courseName));
}
