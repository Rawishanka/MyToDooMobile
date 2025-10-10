// Add this to your backend auth routes (usually routes/auth.js)

// OTP Verification endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if OTP matches (this depends on how you store the OTP)
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Check if OTP is expired (optional)
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear the OTP
    user.otpExpiry = undefined;
    await user.save();
    
    res.status(200).json({ 
      message: 'Account verified successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alternative endpoint name (if you prefer)
app.post('/api/auth/verify', async (req, res) => {
  // Same code as above
});