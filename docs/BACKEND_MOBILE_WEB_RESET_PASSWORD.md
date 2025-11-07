# Backend Update Required: Mobile vs Web Reset Password Links

## Problem
The backend is currently sending web reset links (`http://localhost:5173/reset-password`) to all users, but mobile app users need deep links (`mytodoomobile://reset-password`).

## Solution
The mobile app now sends a `platform` parameter to help the backend determine which link format to use.

---

## API Request Changes

### Forgot Password Request (FROM MOBILE APP)

**POST** `/api/auth/forgot-password`

**Old Request:**
```json
{
  "email": "user@example.com"
}
```

**New Request (from mobile):**
```json
{
  "email": "user@example.com",
  "platform": "mobile",
  "redirectUrl": "mytodoomobile://reset-password"
}
```

**Request (from web) - unchanged:**
```json
{
  "email": "user@example.com"
}
```

---

## Backend Implementation

### Update the `/auth/forgot-password` endpoint:

```javascript
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, platform, redirectUrl } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save token to database
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();
    
    // Determine reset URL based on platform
    let resetUrl;
    
    if (platform === 'mobile' && redirectUrl) {
      // Mobile app - use deep link
      resetUrl = `${redirectUrl}?token=${resetToken}&email=${email}`;
      // Example: mytodoomobile://reset-password?token=abc123&email=user@example.com
    } else {
      // Web app - use web URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${email}`;
      // Example: http://localhost:5173/reset-password?token=abc123&email=user@example.com
    }
    
    console.log(`📧 Sending ${platform || 'web'} reset link to:`, email);
    console.log(`🔗 Reset URL:`, resetUrl);
    
    // Send email with the appropriate URL
    await sendEmail({
      to: email,
      subject: 'Password Reset Request - MyToDoo',
      html: generatePasswordResetEmail(resetUrl, user.firstName)
    });
    
    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  }
});
```

---

## Email Template Function

Create a reusable email template function:

```javascript
function generatePasswordResetEmail(resetUrl, userName = 'User') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #004aad; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">MyToDoo</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #004aad; margin-top: 0;">Password Reset Request</h2>
        
        <p>Hello ${userName},</p>
        
        <p>You requested a password reset for your MyToDoo account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; 
                    padding: 14px 30px; 
                    background-color: #007BFF; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in <strong>15 minutes</strong>.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. 
          Your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <span style="color: #007BFF; word-break: break-all;">${resetUrl}</span>
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          © 2025 MyToDoo. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}
```

---

## Testing

### Test from Mobile App:
1. Open mobile app
2. Forgot Password → Enter email
3. Check email
4. Link should be: `mytodoomobile://reset-password?token=...&email=...`
5. Clicking link should open the mobile app

### Test from Web App:
1. Open web browser
2. Forgot Password → Enter email  
3. Check email
4. Link should be: `http://localhost:5173/reset-password?token=...&email=...`
5. Clicking link should open in browser

---

## Environment Variables

Make sure these are set in backend `.env`:

```env
# Email Configuration
EMAIL_USER=deshitha1030@gmail.com
EMAIL_PASS=cguw urrm umrn flwc

# Frontend URLs
FRONTEND_URL=http://localhost:5173
# For production:
# FRONTEND_URL=https://mytodoo.com
```

---

## Verification Checklist

Backend changes needed:
- [ ] Update `/auth/forgot-password` endpoint to check `platform` parameter
- [ ] Use `redirectUrl` when platform is `mobile`
- [ ] Use `FRONTEND_URL` when platform is `web` or not specified
- [ ] Update email template to be more professional
- [ ] Test from mobile app (should receive `mytodoomobile://` link)
- [ ] Test from web app (should receive `http://` link)
- [ ] Verify both links work correctly

Mobile app changes (already done):
- [x] Send `platform: 'mobile'` parameter
- [x] Send `redirectUrl: 'mytodoomobile://reset-password'`
- [x] Deep link handler configured
- [x] Set password screen ready

---

## Example Backend Logs

After implementing these changes, you should see:

```
📧 Sending mobile reset link to: user@example.com
🔗 Reset URL: mytodoomobile://reset-password?token=abc123&email=user@example.com
✅ Email sent successfully
```

Or for web:

```
📧 Sending web reset link to: user@example.com
🔗 Reset URL: http://localhost:5173/reset-password?token=abc123&email=user@example.com
✅ Email sent successfully
```

---

## Summary

**Mobile app change:** ✅ Already done - sends `platform` and `redirectUrl`  
**Backend change needed:** ⚠️ Must check `platform` parameter and use appropriate URL format  
**Result:** Mobile users get deep links, web users get web links ✅
