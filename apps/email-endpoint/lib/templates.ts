// ─── Email Templates ─────────────────────────────────────────────────
// All HTML email templates for StarkDCA.

/** Shared footer for all email templates */
function emailFooter(): string {
  return `
    <div style="text-align: center; margin-top: 20px; padding-top: 15px;">
      <p style="margin: 0 0 8px 0;">
        <a href="https://x.com/StarkDCA_" style="color: #1F3878; text-decoration: none; font-size: 13px; margin: 0 6px;">Twitter</a>
        &nbsp;&middot;&nbsp;
        <a href="https://github.com/RabbitDaCoder/StarkDCA" style="color: #1F3878; text-decoration: none; font-size: 13px; margin: 0 6px;">GitHub</a>
      </p>
      <p style="color: #aaa; font-size: 12px; margin: 4px 0 0 0;">
        <a href="https://www.starkdca.xyz" style="color: #1F3878; text-decoration: none;">www.starkdca.xyz</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:support@starkdca.xyz" style="color: #888; text-decoration: none;">support@starkdca.xyz</a>
      </p>
    </div>`;
}

/** Common HTML wrapper for consistent layout */
function emailWrapper(
  title: string,
  headerBg: string,
  headerContent: string,
  bodyContent: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F4F4;">
  <div style="background: ${headerBg}; padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    ${headerContent}
  </div>

  <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    ${bodyContent}
    <p style="color: #888; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-bottom: 0;">
      Best regards,<br>The StarkDCA Team
    </p>
    ${emailFooter()}
  </div>
</body>
</html>`;
}

// ─── OTP Verification ────────────────────────────────────────────────

export function getOtpEmailTemplate(name: string, otp: string): { html: string; text: string } {
  const html = emailWrapper(
    'Verify Your Email',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">Email Verification</h1>
     <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">Confirm your StarkDCA account</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Please use the verification code below to confirm your email address:</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: #F4F4F4; border: 2px dashed #CDA41B; border-radius: 12px; padding: 20px 40px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1F3878; font-family: 'Poppins', monospace;">${otp}</span>
      </div>
    </div>

    <p style="color: #888; font-size: 14px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">If you did not create a StarkDCA account, you can safely ignore this email.</p>
    </div>`,
  );

  const text = `Hello ${name}, your verification code is: ${otp}. It expires in 10 minutes.`;

  return { html, text };
}

// ─── Waitlist Welcome ────────────────────────────────────────────────

export function getWaitlistWelcomeTemplate(name: string): { html: string; text: string } {
  const html = emailWrapper(
    'Welcome to the StarkDCA Waitlist',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Poppins', sans-serif;">Welcome to the Waitlist</h1>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Thank you for your interest in <strong>StarkDCA</strong>. You have been added to our waitlist and will receive early access to our automated Bitcoin DCA platform built on Starknet.</p>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1F3878; font-size: 15px;">What to expect:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Automated Dollar-Cost Averaging into BTC</li>
        <li>Non-custodial, fully on-chain execution</li>
        <li>Low gas fees powered by Starknet</li>
        <li>Flexible scheduling &mdash; daily, weekly, or monthly</li>
      </ul>
    </div>

    <p style="color: #555; font-size: 14px;">We will notify you as soon as the platform launches. In the meantime, follow us on Twitter for updates.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://x.com/StarkDCA_" style="background: #1F3878; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Follow @StarkDCA_</a>
    </div>`,
  );

  const text = `Hello ${name}, thank you for joining the StarkDCA waitlist. You will receive early access when the platform launches.`;

  return { html, text };
}

// ─── Signup Welcome ──────────────────────────────────────────────────

export function getSignupWelcomeTemplate(
  name: string,
  frontendUrl: string,
): { html: string; text: string } {
  const html = emailWrapper(
    'Welcome to StarkDCA',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Poppins', sans-serif;">Welcome to StarkDCA</h1>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Your StarkDCA account has been created successfully. You are now ready to start automating your Bitcoin investments on Starknet.</p>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1F3878; font-size: 15px;">Getting started:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Connect your Starknet wallet</li>
        <li>Create your first DCA plan</li>
        <li>Fund your wallet and let automation handle the rest</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; font-family: 'Poppins', sans-serif;">Go to Dashboard</a>
    </div>`,
  );

  const text = `Hello ${name}, welcome to StarkDCA. Your account has been created. Visit your dashboard to get started: ${frontendUrl}/dashboard`;

  return { html, text };
}

// ─── Waitlist Confirmation (after OTP verified) ──────────────────────

export function getWaitlistConfirmationTemplate(
  name: string,
  position: number,
): { html: string; text: string } {
  const html = emailWrapper(
    'Waitlist Confirmed',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Poppins', sans-serif;">You're on the Waitlist</h1>
     <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0; font-size: 14px;">Your email has been verified</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Your email has been verified and you are now confirmed on the StarkDCA waitlist.</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #FFF8F0, #FEF3E0); border: 2px solid #CDA41B; border-radius: 16px; padding: 25px 40px;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px;">Your Position</p>
        <span style="font-size: 48px; font-weight: 700; color: #CDA41B; font-family: 'Poppins', sans-serif;">#${position}</span>
      </div>
    </div>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1F3878; font-size: 15px;">What happens next?</h3>
      <p style="margin: 0; color: #555; font-size: 14px;">
        We are finalizing the smart contract and dashboard. As a confirmed waitlist member, you will be among the first to receive access when StarkDCA launches.
      </p>
      <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
        We will send you a launch notification as soon as the platform is ready.
      </p>
    </div>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h4 style="margin: 0 0 8px 0; color: #FE6606; font-size: 14px;">Platform features:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li>Automated Dollar-Cost Averaging into BTC</li>
        <li>Non-custodial, fully on-chain execution on Starknet</li>
        <li>Low gas fees and flexible scheduling</li>
        <li>Priority access for waitlist members</li>
      </ul>
    </div>

    <p style="color: #555; font-size: 14px;">Follow us on Twitter for the latest updates.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://x.com/StarkDCA_" style="background: #1F3878; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-family: 'Poppins', sans-serif;">Follow @StarkDCA_</a>
    </div>`,
  );

  const text = `Hello ${name}, your email has been verified and you are #${position} on the StarkDCA waitlist. We will notify you when the platform launches.`;

  return { html, text };
}

// ─── Password Reset ──────────────────────────────────────────────────

export function getPasswordResetTemplate(
  name: string,
  resetUrl: string,
): { html: string; text: string } {
  const html = emailWrapper(
    'Reset Your Password',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">Password Reset</h1>
     <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">Secure your StarkDCA account</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">We received a request to reset the password associated with your StarkDCA account. Click the button below to set a new password:</p>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.4);">Reset Password</a>
    </div>

    <p style="color: #888; font-size: 14px; text-align: center;">This link expires in <strong>1 hour</strong>.</p>

    <p style="color: #888; font-size: 13px; text-align: center; word-break: break-all;">
      If the button does not work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #1F3878;">${resetUrl}</a>
    </p>

    <div style="background: #FFF8F0; border-left: 4px solid #FE6606; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 13px; color: #666;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>`,
  );

  const text = `Hello ${name}, we received a request to reset your StarkDCA password. Visit this link to set a new password: ${resetUrl} — This link expires in 1 hour. If you did not request this, please ignore this email.`;

  return { html, text };
}

// ─── Launch Notification ─────────────────────────────────────────────

export function getLaunchEmailTemplate(
  name: string,
  frontendUrl: string,
): { html: string; text: string } {
  const html = emailWrapper(
    'StarkDCA is Live',
    'linear-gradient(135deg, #FE6606 0%, #CDA41B 100%)',
    `<h1 style="color: white; margin: 0; font-size: 32px; font-family: 'Poppins', sans-serif;">StarkDCA is Live</h1>
     <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your dashboard is now available</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="font-size: 16px; color: #333;">We are pleased to announce that <strong>StarkDCA is now live</strong>. Your dashboard has been unlocked and is ready to use.</p>

    <p style="color: #555;">As a waitlist member, you have priority access to all platform features:</p>

    <div style="background: #F8F9FF; border-left: 4px solid #1F3878; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
        <li style="margin-bottom: 8px;">Create automated DCA plans</li>
        <li style="margin-bottom: 8px;">Connect your Starknet wallet</li>
        <li style="margin-bottom: 8px;">Configure daily, weekly, or monthly strategies</li>
        <li>Track your portfolio in real time</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.4);">Go to Dashboard</a>
    </div>`,
  );

  const text = `Hello ${name}, StarkDCA is now live. Your dashboard has been unlocked. Log in to get started: ${frontendUrl}/dashboard`;

  return { html, text };
}

// ─── DCA Plan Activated ──────────────────────────────────────────────

export function getPlanActivatedTemplate(
  name: string,
  planDetails: {
    amount: string;
    interval: string;
    totalExecutions: number;
    totalDeposit: string;
  },
  frontendUrl: string,
): { html: string; text: string } {
  const html = emailWrapper(
    'DCA Plan Activated',
    'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
    `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">DCA Plan Activated</h1>
     <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">Your Bitcoin accumulation has begun</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Your DCA plan has been created and is now active. Below are the plan details:</p>

    <div style="background: #F8F9FF; border: 1px solid #E8ECFF; border-radius: 12px; padding: 24px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px;">Amount per buy</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px;">${planDetails.amount} USDT</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Frequency</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px; border-top: 1px solid #EEE;">${planDetails.interval}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Total buys</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px; border-top: 1px solid #EEE;">${planDetails.totalExecutions}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Total deposit</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #CDA41B; font-size: 16px; border-top: 1px solid #EEE;">${planDetails.totalDeposit} USDT</td>
        </tr>
      </table>
    </div>

    <p style="color: #555; font-size: 14px;">Your first execution will run automatically according to your selected schedule. You can monitor progress from your dashboard at any time.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.3);">View Dashboard</a>
    </div>`,
  );

  const text = `Hello ${name}, your DCA plan has been activated. ${planDetails.amount} USDT per buy, ${planDetails.interval}, ${planDetails.totalExecutions} total buys, total deposit: ${planDetails.totalDeposit} USDT. Dashboard: ${frontendUrl}/dashboard`;

  return { html, text };
}

// ─── BTC Accumulated (Execution Notification) ────────────────────────

export function getBtcAccumulatedTemplate(
  name: string,
  executionDetails: {
    amountIn: string;
    amountOut: string;
    price: string;
    executionNumber: number;
    totalExecutions: number;
    planInterval: string;
    txHash: string;
  },
  frontendUrl: string,
): { html: string; text: string } {
  const progress = Math.round(
    (executionDetails.executionNumber / executionDetails.totalExecutions) * 100,
  );
  const html = emailWrapper(
    'BTC Accumulated',
    'linear-gradient(135deg, #f7931a 0%, #CDA41B 100%)',
    `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">BTC Accumulated</h1>
     <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">Your ${executionDetails.planInterval} DCA buy has been executed</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Your DCA plan has completed an execution. Here is the summary:</p>

    <div style="text-align: center; margin: 25px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #FFF8F0, #FEF3E0); border: 2px solid #CDA41B; border-radius: 16px; padding: 25px 40px;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px;">BTC Received</p>
        <span style="font-size: 32px; font-weight: 700; color: #f7931a; font-family: 'Poppins', sans-serif;">${executionDetails.amountOut}</span>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #888;">at $${executionDetails.price} / BTC</p>
      </div>
    </div>

    <div style="background: #F8F9FF; border: 1px solid #E8ECFF; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #888; font-size: 14px;">Amount spent</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px;">${executionDetails.amountIn} USDT</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Execution</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px; border-top: 1px solid #EEE;">${executionDetails.executionNumber} of ${executionDetails.totalExecutions}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Progress</td>
          <td style="padding: 6px 0; text-align: right; font-size: 14px; border-top: 1px solid #EEE;">
            <div style="display: inline-block; width: 100px; height: 8px; background: #EEE; border-radius: 4px; overflow: hidden; vertical-align: middle;">
              <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #FE6606, #f7931a); border-radius: 4px;"></div>
            </div>
            <span style="font-weight: 600; color: #1F3878; margin-left: 8px;">${progress}%</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #888; font-size: 13px; text-align: center;">
      Transaction: <a href="https://starkscan.co/tx/${executionDetails.txHash}" style="color: #1F3878;">${executionDetails.txHash.slice(0, 10)}...${executionDetails.txHash.slice(-8)}</a>
    </p>

    <div style="text-align: center; margin: 25px 0;">
      <a href="${frontendUrl}/dashboard/activity" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.3);">View Activity</a>
    </div>`,
  );

  const text = `Hello ${name}, your DCA plan executed successfully. You received ${executionDetails.amountOut} BTC for ${executionDetails.amountIn} USDT at $${executionDetails.price}/BTC. Execution ${executionDetails.executionNumber}/${executionDetails.totalExecutions}. Tx: ${executionDetails.txHash}`;

  return { html, text };
}

// ─── Plan Cancelled ──────────────────────────────────────────────────

export function getPlanCancelledTemplate(
  name: string,
  planDetails: {
    amount: string;
    interval: string;
    executionsCompleted: number;
    totalExecutions: number;
  },
  frontendUrl: string,
): { html: string; text: string } {
  const html = emailWrapper(
    'DCA Plan Cancelled',
    'linear-gradient(135deg, #4A4A6A 0%, #2d2d4a 100%)',
    `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">DCA Plan Cancelled</h1>
     <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">Your plan has been stopped</p>`,
    `<p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>

    <p style="color: #555;">Your DCA plan has been cancelled. Below is a summary:</p>

    <div style="background: #F8F9FF; border: 1px solid #E8ECFF; border-radius: 12px; padding: 24px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px;">Plan</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px;">${planDetails.amount} USDT / ${planDetails.interval}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Completed</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1F3878; font-size: 14px; border-top: 1px solid #EEE;">${planDetails.executionsCompleted} of ${planDetails.totalExecutions} buys</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #888; font-size: 14px; border-top: 1px solid #EEE;">Status</td>
          <td style="padding: 8px 0; text-align: right; font-size: 14px; border-top: 1px solid #EEE;">
            <span style="background: #FEE2E2; color: #DC2626; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 13px;">Cancelled</span>
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #555; font-size: 14px;">Any BTC already accumulated from completed executions remains in your wallet. You can create a new plan at any time from your dashboard.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/dashboard" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 12px rgba(254, 102, 6, 0.3);">Create New Plan</a>
    </div>`,
  );

  const text = `Hello ${name}, your DCA plan (${planDetails.amount} USDT / ${planDetails.interval}) has been cancelled. ${planDetails.executionsCompleted}/${planDetails.totalExecutions} buys were completed. Dashboard: ${frontendUrl}/dashboard`;

  return { html, text };
}

// ─── Custom Templates ────────────────────────────────────────────────

export function getCustomTemplate(
  templateName: string,
  variables: Record<string, string>,
  frontendUrl: string,
): { html: string } {
  const templates: Record<string, string> = {
    announcement: emailWrapper(
      'StarkDCA Announcement',
      'linear-gradient(135deg, #1F3878 0%, #2d4ea0 100%)',
      `<h1 style="color: white; margin: 0; font-size: 24px; font-family: 'Poppins', sans-serif;">{{title}}</h1>`,
      `<p style="font-size: 16px; margin-top: 0;">Hello {{name}},</p>
       <p style="color: #555;">{{content}}</p>`,
    ),
    launch: emailWrapper(
      'StarkDCA is Live',
      'linear-gradient(135deg, #FE6606 0%, #CDA41B 100%)',
      `<h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Poppins', sans-serif;">StarkDCA is Live</h1>`,
      `<p style="font-size: 16px; margin-top: 0;">Hello {{name}},</p>
       <p style="color: #555;">StarkDCA is now live and you have early access as a waitlist member.</p>
       <p style="color: #555;">{{content}}</p>
       <div style="text-align: center; margin: 30px 0;">
         <a href="${frontendUrl}/signup" style="background: linear-gradient(135deg, #FE6606, #e55a05); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block;">Create Your Account</a>
       </div>`,
    ),
  };

  let html = templates[templateName] || templates.announcement;

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return { html };
}
