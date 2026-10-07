const nodemailer = require('nodemailer');
const { query } = require('../database/connection');
const config = require('../config');

let transporter = null;

// Initialize Nodemailer transporter if host and credentials configured
if (config.mail.host && config.mail.user && config.mail.pass) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure, // true for 465, false for other ports (587)
    auth: {
      user: config.mail.user,
      pass: config.mail.pass
    },
    tls: {
      rejectUnauthorized: config.app.isProduction
    }
  });
}

/**
 * Generic email dispatcher with database notification audit record
 */
const sendEmail = async ({ to, subject, html, text, userId = null }) => {
  const from = `"${config.mail.fromName}" <${config.mail.fromEmail}>`;

  let status = 'sent';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      if (!config.app.isProduction) {
        console.log(`[Email Sent via SMTP] To: ${to} | Subject: ${subject}`);
      }
    } catch (err) {
      console.error('[Email Error] SMTP dispatch failed:', err.message);
      status = 'failed';
    }
  } else {
    // If SMTP is not yet configured, log or fallback depending on config
    if (config.mail.fallbackToLog) {
      console.log(`\n================== [EMAIL DISPATCH (MOCK/DEV LOG)] ==================`);
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body Snippet: ${(text || html.replace(/<[^>]*>?/gm, '')).substring(0, 120)}...`);
      console.log(`======================================================================\n`);
    } else {
      console.warn('[Email Warning] No SMTP transport configured and fallback logging is disabled.');
      status = 'failed';
    }
  }

  // Save notification in database if userId exists
  if (userId) {
    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, status, metadata)
         VALUES (?, ?, ?, 'email', ?, ?)`,
        [
          userId,
          subject,
          text || subject,
          status,
          JSON.stringify({ to, timestamp: new Date().toISOString() })
        ]
      );
    } catch (dbErr) {
      console.error('[Notification DB Error]:', dbErr.message);
    }
  }

  return { success: status === 'sent', status };
};

/**
 * Send Email Verification link/token
 */
const sendVerificationEmail = async ({ user, verificationToken }) => {
  const verifyUrl = `${config.app.frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

  const subject = `Verify your email address - ${config.app.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;">Welcome to ${config.app.name}</h2>
      <p>Hello <strong>${user.first_name} ${user.last_name}</strong>,</p>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <div style="margin: 25px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #666; font-size: 13px;">Or copy and paste this link in your browser: <br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">Verification Token: <code>${verificationToken}</code></p>
    </div>
  `;
  const text = `Hello ${user.first_name}, please verify your email by clicking: ${verifyUrl} (Token: ${verificationToken})`;

  return sendEmail({ to: user.email, subject, html, text, userId: user.id });
};

/**
 * Send Password Reset link/token
 */
const sendPasswordResetEmail = async ({ user, resetToken }) => {
  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  const subject = `Password Reset Request - ${config.app.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #dc2626;">Password Reset Request</h2>
      <p>Hello <strong>${user.first_name}</strong>,</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 13px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      <p style="color: #888; font-size: 12px; margin-top: 30px;">Reset Token: <code>${resetToken}</code></p>
    </div>
  `;
  const text = `Hello ${user.first_name}, reset your password using this link: ${resetUrl} (Token: ${resetToken})`;

  return sendEmail({ to: user.email, subject, html, text, userId: user.id });
};

/**
 * Send Supplier Account Status update notification
 */
const sendSupplierStatusEmail = async ({ user, status, reason = null }) => {
  const subject = `Supplier Application Update: ${status.toUpperCase()} - ${config.app.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2>Supplier Application Status: <span style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'};">${status.toUpperCase()}</span></h2>
      <p>Hello <strong>${user.first_name}</strong>,</p>
      <p>Your supplier account status has been updated to <strong>${status}</strong> by our operations team.</p>
      ${reason ? `<p><strong>Notes:</strong> ${reason}</p>` : ''}
      <p>Thank you,<br/>${config.app.name} Operations Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html, text: `Status: ${status}. ${reason || ''}`, userId: user.id });
};

/**
 * Send OTP Verification Email
 */
const sendOtpEmail = async ({ user, code, purpose = 'Verification' }) => {
  const subject = `${code} is your ${purpose} OTP - ${config.app.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;">${config.app.name} Account Verification</h2>
      <p>Hello <strong>${user.first_name || 'Customer'}</strong>,</p>
      <p>Thank you for registering. Use the one-time verification code below to verify your email address:</p>
      <div style="margin: 25px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; background: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #94a3b8; display: inline-block;">
          ${code}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This code will expire in ${config.sms.otpExpiryMinutes} minutes. If you did not initiate this request, please disregard this email.</p>
    </div>
  `;
  const text = `Hello ${user.first_name || 'Customer'}, your verification code is: ${code}. It expires in ${config.sms.otpExpiryMinutes} minutes.`;

  return sendEmail({ to: user.email, subject, html, text, userId: user.id });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  sendSupplierStatusEmail
};

