// ─── Email Templates ─────────────────────────────────────────────────
// All HTML email templates for StarkDCA, migrated from the backend.

export function getOtpEmailTemplate(name: string, otp: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F4F4;">
  <div style="background: linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">Verify Your Email</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">One step closer to your StarkDCA account</p>
  </div>

  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>

    <p style="color: #555;">Use the verification code below to confirm your email address:</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: #F4F4F4; border: 2px dashed #CDA41B; border-radius: 12px; padding: 20px 40px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1F3878; font-family: 'Poppins', monospace;">${otp}</span>
      </div>
    </div>

    <p style="color: #888; font-size: 14px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">If you didn't create a StarkDCA account, you can safely ignore this email.</p>
    </div>

    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, your verification code is: ${otp}. It expires in 10 minutes.`;

  return { html, text };
}

export function getWaitlistWelcomeTemplate(name: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StarkDCA Waitlist</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're on the List!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
    
    <p>Thank you for joining the <strong>StarkDCA</strong> waitlist! You're now secured a spot for early access to our revolutionary Bitcoin DCA platform built on Starknet.</p>
    
    <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #667eea;">What's Coming:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #4a4a6a;">
        <li>Automated Dollar-Cost Averaging into BTC</li>
        <li>Non-custodial &amp; fully on-chain execution</li>
        <li>Low gas fees powered by Starknet</li>
        <li>Smart scheduling: daily, weekly, or monthly</li>
      </ul>
    </div>
    
    <p>We'll notify you as soon as we launch. In the meantime, follow us on Twitter for updates!</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://x.com/DcaStark23076" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Follow @DcaStark23076</a>
    </div>
    
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Building the future of Bitcoin investment on Starknet</em>
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, thank you for joining the StarkDCA waitlist! You're now on the list for early access to our Bitcoin DCA platform on Starknet.`;

  return { html, text };
}

export function getSignupWelcomeTemplate(
  name: string,
  frontendUrl: string,
): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to StarkDCA</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">₿ Welcome to StarkDCA!</h1>
  </div>
  
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
    
    <p>Your StarkDCA account has been created successfully! You're now ready to start automating your Bitcoin investments.</p>
    
    <div style="background: #fff8f0; border-left: 4px solid #f7931a; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #f7931a;">Getting Started:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #4a4a6a;">
        <li>Connect your Starknet wallet</li>
        <li>Create your first DCA plan</li>
        <li>Fund your wallet and watch the automation work</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
    </div>
    
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Stack sats. Stay sovereign.</em>
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, welcome to StarkDCA! Your account has been created successfully.`;

  return { html, text };
}

export function getWaitlistConfirmationTemplate(
  name: string,
  position: number,
): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the Waitlist!</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F4F4;">
  <div style="background: linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Poppins', sans-serif;">🎉 You're on the Waitlist!</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0;">Your email has been verified successfully</p>
  </div>

  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>

    <p>Congratulations! Your email has been verified and you're officially on the StarkDCA waitlist.</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #FFF8F0, #FEF3E0); border: 2px solid #CDA41B; border-radius: 16px; padding: 25px 40px;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px;">Your Position</p>
        <span style="font-size: 48px; font-weight: 700; color: #CDA41B; font-family: 'Poppins', sans-serif;">#${position}</span>
      </div>
    </div>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1F3878; font-family: 'Poppins', sans-serif;">What's Next?</h3>
      <p style="margin: 0; color: #555; font-size: 14px;">
        We are currently finalizing our smart contract and dashboard system.
        You are officially on our waitlist and will be among the first to access StarkDCA when we launch.
      </p>
      <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
        We will send you an official launch email as soon as we're ready. Stay tuned!
      </p>
    </div>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 8px 0; color: #FE6606;">What to Expect:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Automated Dollar-Cost Averaging into BTC</li>
        <li>Non-custodial &amp; fully on-chain execution on Starknet</li>
        <li>Low gas fees &amp; smart scheduling</li>
        <li>Priority access for waitlist members</li>
      </ul>
    </div>

    <p>In the meantime, follow us on Twitter for the latest updates!</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://x.com/DcaStark23076" style="background: #1F3878; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-family: 'Poppins', sans-serif;">Follow @DcaStark23076</a>
    </div>

    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Building the future of Bitcoin investment on Starknet</em>
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, your email has been verified and you're #${position} on our waitlist! We'll notify you as soon as we launch.`;

  return { html, text };
}

export function getPasswordResetTemplate(
  name: string,
  resetUrl: string,
): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F4F4;">
  <div style="background: linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">Reset Your Password</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">Secure your StarkDCA account</p>
  </div>

  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>

    <p style="color: #555;">We received a request to reset the password for your StarkDCA account. Click the button below to set a new password:</p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.4);">Reset Password</a>
    </div>

    <p style="color: #888; font-size: 14px; text-align: center;">This link expires in <strong>1 hour</strong>.</p>

    <p style="color: #888; font-size: 13px; text-align: center; word-break: break-all;">
      If the button doesn't work, copy and paste this link:<br>
      <a href="${resetUrl}" style="color: #1F3878;">${resetUrl}</a>
    </p>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>

    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, we received a request to reset your StarkDCA password. Visit this link to set a new password: ${resetUrl} — This link expires in 1 hour. If you didn't request this, ignore this email.`;

  return { html, text };
}

export function getLaunchEmailTemplate(
  name: string,
  frontendUrl: string,
): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StarkDCA is Live!</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F4F4;">
  <div style="background: linear-gradient(135deg, #FE6606 0%, #CDA41B 100%); padding: 50px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px; font-family: 'Poppins', sans-serif;">🚀 We're Live!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your dashboard is now unlocked</p>
  </div>

  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-top: 0;">Hi <strong>${name}</strong>,</p>

    <p style="font-size: 16px;">The wait is over! <strong>StarkDCA is officially live</strong> and your dashboard is now unlocked.</p>

    <p style="color: #555;">As a waitlist member, you have priority access to all features:</p>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;">✅ Create automated DCA plans</li>
        <li style="margin-bottom: 8px;">✅ Connect your Starknet wallet</li>
        <li style="margin-bottom: 8px;">✅ Set up daily, weekly, or monthly strategies</li>
        <li>✅ Track your portfolio in real-time</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.4);">Go to Dashboard →</a>
    </div>

    <p style="color: #888; font-size: 14px; text-align: center;">Welcome to the future of Bitcoin investment on Starknet.</p>

    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team<br>
      <em>Stack sats. Stay sovereign.</em>
    </p>
  </div>
</body>
</html>`;

  const text = `Hi ${name}, great news! StarkDCA is officially live. Your dashboard is now unlocked. Log in and start building your Bitcoin wealth: ${frontendUrl}/dashboard`;

  return { html, text };
}

export function getCustomTemplate(
  templateName: string,
  variables: Record<string, string>,
  frontendUrl: string,
): { html: string } {
  const templates: Record<string, string> = {
    announcement: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{title}}</h1>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p>Hi {{name}},</p>
    <p>{{content}}</p>
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`,
    launch: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f8;">
  <div style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 We're Live!</h1>
  </div>
  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p>Hi {{name}},</p>
    <p>Great news! StarkDCA is now live and you have early access as a waitlist member!</p>
    <p>{{content}}</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/signup" style="background: linear-gradient(135deg, #f7931a 0%, #ffb347 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Create Your Account</a>
    </div>
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      – The StarkDCA Team
    </p>
  </div>
</body>
</html>`,
  };

  let html = templates[templateName] || templates.announcement;

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return { html };
}
