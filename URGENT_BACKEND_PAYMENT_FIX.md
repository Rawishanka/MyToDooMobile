# 🚨 URGENT: Backend Payment Integration Fix

## 🔧 IMMEDIATE PROBLEMS TO FIX:

### 1. 401 Authentication Error on Accept Offer
**Current Issue:** 
- Accept offer endpoint returns `{"success":false,"error":"Not authorized"}`
- This breaks the payment flow when users try to accept offers

**Required Fix:**
```javascript
// In your backend routes/tasks.js or wherever offer acceptance is handled
app.post('/api/tasks/:taskId/offers/:offerId/accept', authenticateToken, async (req, res) => {
  try {
    const { taskId, offerId } = req.params;
    const { userId } = req.body; // Optional parameter from frontend
    
    console.log('✅ Accepting offer:', { taskId, offerId, userId, user: req.user });
    
    // Your existing validation logic here...
    // Make sure req.user is properly set from authenticateToken middleware
    
    // Update offer status
    await Offer.updateOne(
      { _id: offerId },
      { 
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: userId || req.user.id
      }
    );
    
    // Update task status  
    await Task.updateOne(
      { _id: taskId },
      { 
        status: 'in-progress',
        acceptedOfferId: offerId
      }
    );
    
    res.status(200).json({
      success: true,
      data: {
        taskId,
        offerId, 
        status: 'accepted',
        message: 'Offer accepted successfully',
        acceptedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Offer acceptance failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept offer',
      error: error.message
    });
  }
});
```

### 2. Missing Stripe Payment Endpoints
**Required Endpoints:** Add these to your backend:

```javascript
// Add to your backend - REQUIRED FOR PAYMENT TO WORK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// CREATE PAYMENT INTENT
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { taskId, offerId, amount, currency = 'LKR' } = req.body;
    
    if (!taskId || !offerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'taskId, offerId, and amount are required'
      });
    }
    
    const budgetAmount = parseFloat(amount);
    const serviceFeePercentage = 10; // 10%
    const serviceFee = Math.round(budgetAmount * (serviceFeePercentage / 100) * 100) / 100;
    const totalCharge = budgetAmount + serviceFee;
    const amountInCents = Math.round(totalCharge * 100);
    
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
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        budgetAmount,
        serviceFee,
        totalCharge,
        taskerWillReceive: budgetAmount - (budgetAmount * 0.03),
        currency: currency.toUpperCase()
      },
      paymentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// VERIFY PAYMENT
app.post('/api/payments/verify', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, taskId, offerId } = req.body;
    
    if (!paymentIntentId || !taskId || !offerId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId, taskId, and offerId are required'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    let paymentStatus;
    switch (paymentIntent.status) {
      case 'succeeded':
        paymentStatus = 'succeeded';
        break;
      case 'failed':
      case 'canceled':
        paymentStatus = 'failed';
        break;
      default:
        paymentStatus = 'pending';
        break;
    }
    
    res.status(200).json({
      success: true,
      data: {
        paymentStatus,
        paymentIntentId,
        transactionId: paymentIntent.charges.data[0]?.id || null,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase()
      }
    });
    
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});
```

### 3. Environment Variables Required
Add to your backend `.env` file:
```
STRIPE_SECRET_KEY=sk_test_51Rqt0MEi85Ido0TbAp1zcHlDj1OceIfWqqkvRPs1dPznTTFFTmZpLsc6OsJAwIxKlPRa8Hqq8JOrdZ1rzdAmcYxP00h9zkmofm
```

### 4. Install Stripe Package
Run in your backend directory:
```bash
npm install stripe
```

## 🧪 TESTING THE FIXES:

### Test Accept Offer Endpoint:
```bash
curl -X POST http://192.168.1.168:5001/api/tasks/6912123b62a067fc3f73b73e/offers/6912ddb7f068b102bfc4b59c/accept \
  -H "Authorization: Bearer dev-token-1762873704" \
  -H "Content-Type: application/json" \
  -d '{"userId": "68bba9aa738031d9bcf0bdf3"}'
```

### Test Payment Intent Creation:
```bash
curl -X POST http://192.168.1.168:5001/api/payments/create-intent \
  -H "Authorization: Bearer dev-token-1762873704" \
  -H "Content-Type: application/json" \
  -d '{"taskId": "6912123b62a067fc3f73b73e", "offerId": "6912ddb7f068b102bfc4b59c", "amount": 6000}'
```

## 🎯 PRIORITY:
1. **FIRST:** Fix the accept offer 401 authentication issue 
2. **SECOND:** Add the missing Stripe payment endpoints
3. **THIRD:** Test the complete payment flow

**Once these are implemented, the mobile app payment functionality will work correctly.**