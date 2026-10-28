const nodemailer = require('nodemailer');

// Build transporter if credentials exist
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"JobConnect Notifications" <no-reply@jobconnect.com>';

    if (!transporter) {
      console.log(
        `\n[EmailService - Dev Simulation]\n  To: ${to}\n  Subject: ${subject}\n  Note: SMTP credentials not set in server/.env. Notification logged safely.\n`
      );
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    });

    console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.warn(`[EmailService Warning] Failed to send email to ${to}:`, error.message);
    // Do not crash the application if email delivery fails
    return { success: false, error: error.message };
  }
};

/**
 * Send confirmation email to candidate upon submitting application
 */
const sendApplicationSubmittedCandidateEmail = async ({ candidate, job }) => {
  const subject = `Application Received: ${job.title} at ${job.company}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 12px;">JobConnect</h2>
      <p style="font-size: 16px;">Hi <strong>${candidate.name}</strong>,</p>
      <p>Thank you for applying for the <strong>${job.title}</strong> role at <strong>${job.company}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0284c7;">
        <p style="margin: 4px 0;"><strong>Job:</strong> ${job.title}</p>
        <p style="margin: 4px 0;"><strong>Company:</strong> ${job.company}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${job.location}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Pending Review</p>
      </div>
      <p>The hiring team at ${job.company} has received your resume and application materials. You can track your application status anytime from your Candidate Dashboard.</p>
      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Best regards,<br/>The JobConnect Team</p>
    </div>
  `;
  return await sendEmail({ to: candidate.email, subject, html });
};

/**
 * Send alert email to employer upon receiving a new candidate application
 */
const sendNewApplicationEmployerEmail = async ({ employer, candidate, job }) => {
  const subject = `New Applicant: ${candidate.name} for ${job.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-bottom: 12px;">JobConnect Employer Portal</h2>
      <p style="font-size: 16px;">Hi <strong>${employer.name}</strong>,</p>
      <p>A new candidate has submitted an application for your job posting: <strong>${job.title}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 4px 0;"><strong>Applicant Name:</strong> ${candidate.name}</p>
        <p style="margin: 4px 0;"><strong>Applicant Email:</strong> ${candidate.email}</p>
        <p style="margin: 4px 0;"><strong>Position:</strong> ${job.title}</p>
      </div>
      <p>Please log in to your Employer Dashboard to review their resume, cover letter, and update their application status.</p>
      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Best regards,<br/>The JobConnect Team</p>
    </div>
  `;
  return await sendEmail({ to: employer.email, subject, html });
};

/**
 * Send status update email to candidate when employer changes status
 */
const sendStatusUpdateEmail = async ({ candidate, job, status, notes }) => {
  const subject = `Update on your application: ${job.title} at ${job.company}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 12px;">JobConnect</h2>
      <p style="font-size: 16px;">Hi <strong>${candidate.name}</strong>,</p>
      <p>There is an update on your application for <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p style="margin: 4px 0;"><strong>New Application Status:</strong> <span style="font-weight: 600; color: #0f172a;">${status}</span></p>
        ${notes ? `<p style="margin: 4px 0;"><strong>Employer Note:</strong> ${notes}</p>` : ''}
      </div>
      <p>Log in to your JobConnect account to view the details and keep discovering top career opportunities.</p>
      <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Best regards,<br/>The JobConnect Team</p>
    </div>
  `;
  return await sendEmail({ to: candidate.email, subject, html });
};

module.exports = {
  sendEmail,
  sendApplicationSubmittedCandidateEmail,
  sendNewApplicationEmployerEmail,
  sendStatusUpdateEmail,
};
