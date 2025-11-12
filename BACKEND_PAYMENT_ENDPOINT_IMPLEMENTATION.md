# 🚨 BACKEND STRIPE PAYMENT ENDPOINT - EXACT IMPLEMENTATION NEEDED

## 📋 REQUIRED API ENDPOINT:

### POST /api/payments/create-intent

**Request Body:**
```json
{
  "taskId": "6912123b62a067fc3f73b73e",
  "offerId": "6912ddb7f068b102bfc4b59c", 
  "amount": 6000,
  "currency": "LKR"
}
```

**Expected Response (EXACT FORMAT):**
```json
{
  "success": true,
  "clientSecret": "pi_3ABC123xyz_secret_DEF456uvw",
  "breakdown": {
    "budgetAmount": 6000,
    "serviceFee": 600,
    "totalCharge": 6600,
    "taskerWillReceive": 5820,
    "currency": "LKR"
  },
  "serviceFeeDetails": {
    "reason": "Standard 10% platform fee applied",
    "percentage": 0.1,
    "minFee": 50,
    "maxFee": 1000
  },
  "paymentId": "pi_3ABC123xyz"
}
```

## 🔧 BACKEND IMPLEMENTATION:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { taskId, offerId, amount, currency = 'LKR' } = req.body;
    
    // Validate required parameters
    if (!taskId || !offerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'taskId, offerId, and amount are required'
      });
    }
    
    console.log('💳 Creating payment intent:', { taskId, offerId, amount, currency });
    
    // Calculate fees
    const budgetAmount = parseFloat(amount);
    const serviceFeePercentage = 0.1; // 10%
    const serviceFee = Math.round(budgetAmount * serviceFeePercentage);
    const totalCharge = budgetAmount + serviceFee;
    const taskerWillReceive = budgetAmount - Math.round(budgetAmount * 0.03); // 3% processing fee
    
    // Convert to cents for Stripe (LKR uses cents)
    const amountInCents = Math.round(totalCharge * 100);
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        taskId: taskId,
        offerId: offerId,
        originalAmount: budgetAmount.toString(),
        serviceFee: serviceFee.toString()
      },
      description: \`Payment for task \${taskId} - offer \${offerId}\`
    });
    
    console.log('✅ Stripe payment intent created:', paymentIntent.id);
    
    // Return EXACT format expected by mobile app
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        budgetAmount: budgetAmount,
        serviceFee: serviceFee,
        totalCharge: totalCharge,
        taskerWillReceive: taskerWillReceive,
        currency: currency.toUpperCase()
      },
      serviceFeeDetails: {
        reason: "Standard 10% platform fee applied",
        percentage: serviceFeePercentage,
        minFee: 50,
        maxFee: 1000
      },
      paymentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment information provided'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});
```

## 📦 REQUIRED PACKAGES:

```bash
npm install stripe
```

## 🔑 ENVIRONMENT VARIABLES:

Add to your `.env` file:
```
STRIPE_SECRET_KEY=sk_test_51Rqt0MEi85Ido0TbAp1zcHlDj1OceIfWqqkvRPs1dPznTTFFTmZpLsc6OsJAwIxKlPRa8Hqq8JOrdZ1rzdAmcYxP00h9zkmofm
```

## 🧪 TEST THE ENDPOINT:

### PowerShell Test:
```powershell
Invoke-RestMethod -Uri "http://192.168.1.168:5001/api/payments/create-intent" -Method POST -Headers @{ "Authorization" = "Bearer dev-token-1762873704"; "Content-Type" = "application/json" } -Body '{"taskId": "6912123b62a067fc3f73b73e", "offerId": "6912ddb7f068b102bfc4b59c", "amount": 6000, "currency": "LKR"}'
```

### Expected Success Response:
```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_abcdefg",
  "breakdown": {
    "budgetAmount": 6000,
    "serviceFee": 600,
    "totalCharge": 6600,
    "taskerWillReceive": 5820,
    "currency": "LKR"
  },
  "serviceFeeDetails": {
    "reason": "Standard 10% platform fee applied",
    "percentage": 0.1,
    "minFee": 50,
    "maxFee": 1000
  },
  "paymentId": "pi_1234567890"
}
```

## 🎯 CRITICAL POINTS:

1. **Response format must match EXACTLY** - mobile app expects this structure
2. **Authentication must work** with `Bearer dev-token-1762873704`
3. **Amount calculation**:
   - Original amount: 6000 LKR
   - Service fee (10%): 600 LKR  
   - Total charge: 6600 LKR
   - Tasker receives: 5820 LKR (6000 - 3% processing fee)
4. **Stripe amount**: 660000 cents (6600 LKR * 100)

**Once this endpoint is implemented, the mobile Stripe payment form will load correctly when users click "Accept Offer".**