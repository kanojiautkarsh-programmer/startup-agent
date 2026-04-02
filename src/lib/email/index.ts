import mailjet from 'node-mailjet';

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY || '',
  process.env.MAILJET_API_SECRET || ''
);

const FROM_EMAIL = process.env.EMAIL_FROM || 'TaskLyne <noreply@tasklyne.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await mailjetClient.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: FROM_EMAIL.split(' ')[0],
            Name: FROM_EMAIL.includes('<') ? FROM_EMAIL.split('<')[0].trim() : 'TaskLyne',
          },
          To: [
            {
              Email: options.to,
            },
          ],
          Subject: options.subject,
          HTMLPart: options.html,
          TextPart: options.text,
        },
      ],
    });

    const response = result.body as { Messages?: Array<{ Status?: string }> };
    if (response?.Messages?.[0]?.Status === 'success') {
      console.log('Email sent via Mailjet');
      return { success: true };
    }

    console.log('Mailjet response:', result.body);
    return { success: true };
  } catch (err: unknown) {
    console.error('Email send failed:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hi ${name}` : 'Hi there';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D211B; margin: 0;">TaskLyne</h1>
      </div>
      
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #2D211B;">${greeting}, welcome to TaskLyne!</h2>
        
        <p>We're excited to have you on board. TaskLyne is your AI-powered startup memory that never forgets.</p>
        
        <p style="margin-bottom: 20px;">Here's what you can do:</p>
        
        <ul style="margin-bottom: 20px;">
          <li>Chat with AI that remembers everything about your startup</li>
          <li>Build persistent memory from your conversations</li>
          <li>Track goals and commitments</li>
          <li>Enterprise-grade security and encryption</li>
        </ul>
        
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: #2D211B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Get Started
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; text-align: center;">
        If you have any questions, just reply to this email. We're here to help!
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to TaskLyne!',
    html,
    text: `${greeting}, welcome to TaskLyne! Get started at ${APP_URL}/dashboard`,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D211B; margin: 0;">TaskLyne</h1>
      </div>
      
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #2D211B;">Reset Your Password</h2>
        
        <p>You requested a password reset for your TaskLyne account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <a href="${resetUrl}" style="display: inline-block; background: #2D211B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
          Reset Password
        </a>
        
        <p style="font-size: 14px; color: #666;">This link expires in 1 hour.</p>
        
        <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your TaskLyne Password',
    html,
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D211B; margin: 0;">TaskLyne</h1>
      </div>
      
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #2D211B;">Your Magic Sign-In Link</h2>
        
        <p>Click the button below to sign in to your account:</p>
        
        <a href="${magicLink}" style="display: inline-block; background: #2D211B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
          Sign In to TaskLyne
        </a>
        
        <p style="font-size: 14px; color: #666;">This link expires in 1 hour.</p>
        
        <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your TaskLyne Sign-In Link',
    html,
    text: `Sign in: ${magicLink}`,
  });
}

export async function sendDataExportEmail(email: string, exportUrl: string): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D211B; margin: 0;">TaskLyne</h1>
      </div>
      
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #2D211B;">Your Data Export is Ready</h2>
        
        <p>You requested a download of all your data. Click the button below to download:</p>
        
        <a href="${exportUrl}" style="display: inline-block; background: #2D211B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
          Download Your Data
        </a>
        
        <p style="font-size: 14px; color: #666;">This link expires in 24 hours.</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your TaskLyne Data Export',
    html,
    text: `Download your data: ${exportUrl}`,
  });
}

export async function sendSecurityAlert(email: string, alertType: string, details: string): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D211B; margin: 0;">TaskLyne</h1>
      </div>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #dc2626;">Security Alert</h2>
        
        <p><strong>Alert Type:</strong> ${alertType}</p>
        <p><strong>Details:</strong> ${details}</p>
        
        <p style="margin-top: 20px;">If this wasn't you, please secure your account immediately:</p>
        
        <a href="${APP_URL}/settings/security" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Secure Account
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} TaskLyne Inc. All rights reserved.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Security Alert: ${alertType}`,
    html,
    text: `Security Alert: ${alertType} - ${details}`,
  });
}
