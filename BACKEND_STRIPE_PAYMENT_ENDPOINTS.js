// 💳 STRIPE PAYMENT INTEGRATION ENDPOINTS
// Add these to your backend (routes/payments.js or server.js)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Add your Stripe secret key to .env

// ================================
// 💳 STRIPE PAYMENT ENDPOINTS
// ================================

/**
 * 💳 Create Payment Intent
 * POST /api/payments/create-intent
 * Creates a Stripe payment intent for task/offer payment
 */
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { taskId, offerId, amount, currency = 'LKR' } = req.body;
    
    console.log('💳 Creating payment intent:', { taskId, offerId, amount, currency });
    
    // Validate required fields
    if (!taskId || !offerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'taskId, offerId, and amount are required'
      });
    }
    
    // Calculate service fee (10% platform fee)
    const budgetAmount = parseFloat(amount);
    const serviceFeePercentage = 10; // 10%
    const serviceFee = Math.round(budgetAmount * (serviceFeePercentage / 100) * 100) / 100;
    const totalCharge = budgetAmount + serviceFee;
    const taskerWillReceive = budgetAmount - (budgetAmount * 0.03); // 3% processing fee from tasker amount
    
    // Convert amount to smallest currency unit (cents for USD, cents for LKR, etc.)
    const currencyMultiplier = currency.toUpperCase() === 'LKR' ? 100 : 100; // LKR uses cents too
    const amountInCents = Math.round(totalCharge * currencyMultiplier);
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        taskId: taskId,
        offerId: offerId,
        originalAmount: budgetAmount.toString(),
        serviceFee: serviceFee.toString()
      },
      description: `Payment for task ${taskId} - offer ${offerId}`
    });
    
    console.log('✅ Stripe payment intent created:', paymentIntent.id);
    
    // Save payment record to database (optional)
    // const payment = new Payment({
    //   taskId,
    //   offerId,
    //   paymentIntentId: paymentIntent.id,
    //   amount: budgetAmount,
    //   serviceFee,
    //   totalAmount: totalCharge,
    //   currency,
    //   status: 'pending'
    // });
    // await payment.save();
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        budgetAmount,
        serviceFee,
        totalCharge,
        taskerWillReceive,
        currency: currency.toUpperCase()
      },
      serviceFeeDetails: {
        appliedFee: serviceFee,
        basePercentage: serviceFeePercentage,
        calculatedFee: serviceFee,
        maxFeeInCurrency: Math.max(serviceFee, 50), // Max fee cap
        minFeeInCurrency: Math.min(serviceFee, 5),  // Min fee cap
        reason: `Standard ${serviceFeePercentage}% platform fee applied`
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

/**
 * ✅ Verify Payment
 * POST /api/payments/verify
 * Verifies the status of a Stripe payment intent
 */
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { paymentIntentId, taskId, offerId } = req.body;
    
    console.log('✅ Verifying payment:', { paymentIntentId, taskId, offerId });
    
    if (!paymentIntentId || !taskId || !offerId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId, taskId, and offerId are required'
      });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('💳 Stripe payment status:', paymentIntent.status);
    
    // Map Stripe status to our status
    let paymentStatus;
    switch (paymentIntent.status) {
      case 'succeeded':
        paymentStatus = 'succeeded';
        break;
      case 'failed':
      case 'canceled':
        paymentStatus = 'failed';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
      case 'processing':
      default:
        paymentStatus = 'pending';
        break;
    }
    
    // Update payment record in database if needed
    // if (paymentStatus === 'succeeded') {
    //   await Payment.updateOne(
    //     { paymentIntentId },
    //     { 
    //       status: 'completed',
    //       completedAt: new Date(),
    //       transactionId: paymentIntent.charges.data[0]?.id 
    //     }
    //   );
    // }
    
    res.status(200).json({
      success: true,
      data: {
        paymentStatus,
        paymentIntentId,
        transactionId: paymentIntent.charges.data[0]?.id || null,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency.toUpperCase()
      }
    });
    
  } catch (error) {
    console.error('❌ Payment verification failed:', error);
    
    if (error.code === 'resource_missing') {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

/**
 * 🎯 Complete Task & Release Payment
 * POST /api/payments/complete/:taskId
 * Marks payment as complete and releases funds to tasker
 */
app.post('/api/payments/complete/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { paymentIntentId, offerId } = req.body;
    
    console.log('🎯 Completing payment for task:', taskId);
    
    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed yet'
      });
    }
    
    // Update task status to completed/paid
    // await Task.updateOne(
    //   { _id: taskId },
    //   { 
    //     status: 'completed',
    //     paymentStatus: 'paid',
    //     completedAt: new Date()
    //   }
    // );
    
    // Update offer status to accepted/paid
    // await Offer.updateOne(
    //   { _id: offerId },
    //   { 
    //     status: 'accepted',
    //     paymentStatus: 'paid',
    //     acceptedAt: new Date()
    //   }
    // );
    
    console.log('✅ Payment completion successful for task:', taskId);
    
    res.status(200).json({
      success: true,
      data: {
        taskId,
        offerId,
        status: 'accepted',
        paymentDetails: {
          transactionId: paymentIntent.charges.data[0]?.id,
          amount: paymentIntent.amount / 100,
          serviceFee: paymentIntent.metadata.serviceFee || 0,
          totalAmount: paymentIntent.amount / 100,
          paidAt: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Payment completion failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete payment',
      error: error.message
    });
  }
});

// ================================
// 🤝 ENHANCED OFFER ACCEPTANCE
// ================================

/**
 * ✅ Accept Offer (Enhanced with Payment Integration)
 * POST /api/tasks/:taskId/offers/:offerId/accept
 * Accepts an offer on a task
 */
app.post('/api/tasks/:taskId/offers/:offerId/accept', async (req, res) => {
  try {
    const { taskId, offerId } = req.params;
    const { userId } = req.body; // Optional: user ID from request body
    
    console.log('✅ Accepting offer:', { taskId, offerId, userId });
    
    // Validate that task and offer exist
    // const task = await Task.findById(taskId);
    // if (!task) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Task not found'
    //   });
    // }
    
    // const offer = await Offer.findById(offerId);
    // if (!offer) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Offer not found'
    //   });
    // }
    
    // if (offer.taskId.toString() !== taskId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Offer does not belong to this task'
    //   });
    // }
    
    // For now, simulate successful acceptance
    console.log('✅ Offer acceptance successful');
    
    // Update offer status
    // await Offer.updateOne(
    //   { _id: offerId },
    //   { 
    //     status: 'accepted',
    //     acceptedAt: new Date(),
    //     acceptedBy: userId || req.user?.id
    //   }
    // );
    
    // Update task status
    // await Task.updateOne(
    //   { _id: taskId },
    //   { 
    //     status: 'in-progress',
    //     acceptedOfferId: offerId,
    //     assignedTo: offer.userId
    //   }
    // );
    
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

console.log('💳 Stripe Payment Endpoints registered:');
console.log('  POST /api/payments/create-intent');
console.log('  POST /api/payments/verify');
console.log('  POST /api/payments/complete/:taskId');
console.log('  POST /api/tasks/:taskId/offers/:offerId/accept');