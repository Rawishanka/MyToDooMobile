# Stripe + Google Pay + Apple Pay Integration Guide
## MyToDoo — Mobile (React Native/Expo) + Web

---

## 📱 1. Mobile App — How It's Currently Integrated

### Overview

The mobile app uses **`@stripe/stripe-react-native`** library.  
Stripe's **Payment Sheet** (a pre-built UI) automatically shows:
- **Apple Pay** button on iOS (native builds only)
- **Google Pay** button on Android (native builds / APK only)
- **Credit/Debit card** form as fallback on both platforms

---

### 1.1 Package Used

```bash
@stripe/stripe-react-native
```

---

### 1.2 iOS — Apple Pay Setup

#### Step 1: `app.config.ts` — Merchant Entitlement
```ts
ios: {
  bundleIdentifier: 'com.mytodoo.mytodoolive',
  entitlements: {
    'com.apple.developer.in-app-payments': ['merchant.com.mytodoo.mytodoolive'],
  },
}
```
> **Important:** The merchant ID **`merchant.com.mytodoo.mytodoolive`** must be registered in Apple Developer Portal  
> → **Certificates, Identifiers & Profiles → Merchant IDs → Create New**

#### Step 2: `StripePaymentModal.tsx` — `applePay` config in `initPaymentSheet`
```tsx
const { error: initError } = await initPaymentSheet({
  merchantDisplayName: 'MyToDoo',
  paymentIntentClientSecret: paymentResult.clientSecret,
  returnURL: 'mytodoo://payment-return',

  // ✅ Apple Pay — iOS only
  applePay: {
    merchantCountryCode: 'AU',
  },
  // ...
});
```

#### Step 3: `StripePaymentModal.tsx` — `StripeProvider` wrap
```tsx
<StripeProvider
  publishableKey={API_CONFIG.STRIPE.PUBLISHABLE_KEY || ''}
  merchantIdentifier="merchant.com.mytodoo.mytodoolive"  // ← same merchant ID
  urlScheme="mytodoo"
>
  <PaymentForm {...props} />
</StripeProvider>
```

#### ✅ Apple Pay Requirements Checklist
| Requirement | Status |
|---|---|
| Merchant ID registered in Apple Developer Portal | ✅ Done |
| `com.apple.developer.in-app-payments` entitlement in app.config.ts | ✅ Done |
| `merchantIdentifier` in `<StripeProvider>` | ✅ Done |
| `applePay.merchantCountryCode` in `initPaymentSheet` | ✅ Done |
| **Physical device** (not simulator) | Required |
| **Apple Pay card added** in Wallet app | Required by user |

---

### 1.3 Android — Google Pay Setup

#### Step 1: `AndroidManifest.xml` — Enable Google Pay API
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true"
/>
```
> Location in file: inside `<application>` tag

#### Step 2: `StripePaymentModal.tsx` — `googlePay` config in `initPaymentSheet`
```tsx
const { error: initError } = await initPaymentSheet({
  merchantDisplayName: 'MyToDoo',
  paymentIntentClientSecret: paymentResult.clientSecret,
  returnURL: 'mytodoo://payment-return',

  // ✅ Google Pay — Android only
  googlePay: {
    merchantCountryCode: 'AU',
    testEnv: (API_CONFIG.STRIPE.PUBLISHABLE_KEY || '').startsWith('pk_test_'),
    // testEnv: true  → pk_test_ key → test mode, no real money
    // testEnv: false → pk_live_ key → real money
    currencyCode: (currency || 'AUD').toUpperCase(), // MUST be UPPERCASE
    label: 'MyToDoo Payment',
  },
});
```

#### ✅ Google Pay Requirements Checklist
| Requirement | Status |
|---|---|
| `com.google.android.gms.wallet.api.enabled` in AndroidManifest.xml | ✅ Done |
| `googlePay.merchantCountryCode` in `initPaymentSheet` | ✅ Done |
| `testEnv` auto-detected from publishable key prefix | ✅ Done |
| `currencyCode` UPPERCASE | ✅ Done |
| **Physical device or emulator with Google Play Services** | Required |
| **Google Wallet app with at least one card added** | Required by user |

---

### 1.4 Full Payment Flow (Mobile)

```
User taps "Pay" button
        ↓
POST /api/payments/create-intent  ← Backend creates PaymentIntent (server-side secret key)
        ↓
clientSecret returned to app
        ↓
initPaymentSheet({ clientSecret, applePay, googlePay })
        ↓
presentPaymentSheet()  ← Stripe shows pre-built UI
  ├── iOS  → Shows Apple Pay button + card form
  └── Android → Shows Google Pay button + card form
        ↓
User selects payment method and confirms
        ↓
Stripe processes payment
        ↓
Payment Sheet closes → onSuccess() called in app
```

---

### 1.5 Key Files in Mobile App

| File | Purpose |
|---|---|
| `src/shared/components/StripePaymentModal.tsx` | Full payment UI + Apple Pay + Google Pay |
| `src/api/payment-api.ts` | `createPaymentIntent()` — calls backend |
| `src/api/config.ts` | Stripe publishable key config |
| `app.config.ts` | iOS merchant entitlement |
| `android/app/src/main/AndroidManifest.xml` | Google Pay meta-data |

---

### 1.6 Environment Keys

| Environment | Publishable Key | testEnv (Google Pay) |
|---|---|---|
| **Development (test)** | `pk_test_51Rqt0M...` | `true` → test money |
| **UAT** | `pk_live_51Rqszu...` | `false` → real money |
| **Live (Production)** | `pk_live_51Rqszu...` | `false` → real money |

> ⚠️ **IMPORTANT**: Live Publishable Key is in `.env.live` and `eas.json` under `live` and `uat` profiles.  
> Never expose the **Secret Key** (`sk_live_...`) to the frontend/app. Backend only.

---

---

## 🌐 2. Web App — How to Add Google Pay + Apple Pay

### Overview

For a web app, use **Stripe.js** + **Stripe Elements** (or **Payment Request Button**).  
The `PaymentRequestButton` Element automatically shows:
- **Apple Pay** on Safari (macOS/iOS)
- **Google Pay** on Chrome (Android/Desktop)
- **Browser-saved card** (Microsoft Pay on Edge, etc.)

---

### 2.1 Install Stripe.js

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

### 2.2 Backend — Same API Endpoint (No Change Needed)

Your existing backend endpoint is already ready:

```
POST /api/payments/create-intent
Body: { taskId, offerId, amount, currency }
Response: { clientSecret, breakdown }
```

The **same `clientSecret`** works for both mobile and web payments.  
**No backend changes required.**

---

### 2.3 Web Implementation

#### Step 1: Initialize Stripe

```tsx
// src/lib/stripe.ts (web project)
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! // or VITE_STRIPE_PUBLISHABLE_KEY
);
```

---

#### Step 2: Create Payment Request (Google Pay + Apple Pay)

```tsx
// src/components/StripePaymentButton.tsx (web)
import { useStripe, useElements, PaymentRequestButtonElement, Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';

function PaymentRequestButton({ clientSecret, amount, currency, onSuccess }) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    // Create payment request — this detects Apple Pay / Google Pay availability
    const pr = stripe.paymentRequest({
      country: 'AU',                     // Your country
      currency: currency.toLowerCase(),  // LOWERCASE for web (opposite of mobile!)
      total: {
        label: 'MyToDoo Payment',
        amount: Math.round(amount * 100), // Amount in CENTS (e.g. $25.00 → 2500)
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay / Google Pay is available on this browser/device
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
        console.log('✅ Apple Pay / Google Pay available:', result);
        // result.applePay === true → Safari / iOS
        // result.googlePay === true → Chrome with Google Wallet
      } else {
        console.log('ℹ️ Apple Pay / Google Pay not available — show card form instead');
      }
    });

    // Handle payment confirmation
    pr.on('paymentmethod', async (event) => {
      // Confirm the PaymentIntent with the paymentMethod from Apple/Google Pay
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false }
      );

      if (error) {
        // Report failure to the browser (closes the Apple/Google Pay sheet with error)
        event.complete('fail');
        console.error('❌ Payment failed:', error.message);
      } else {
        // Report success to the browser (closes the sheet with checkmark)
        event.complete('success');

        // Handle 3D Secure if required
        if (paymentIntent.status === 'requires_action') {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (actionError) {
            console.error('❌ 3D Secure failed:', actionError.message);
            return;
          }
        }

        console.log('✅ Payment succeeded!');
        onSuccess(paymentIntent);
      }
    });
  }, [stripe, clientSecret, amount, currency]);

  if (!canMakePayment) return null; // Don't render if Apple Pay / Google Pay not available

  return (
    <PaymentRequestButtonElement
      options={{ paymentRequest }}
      className="stripe-payment-request-btn"
    />
  );
}
```

---

#### Step 3: Wrap in `<Elements>` Provider

```tsx
// src/components/CheckoutPage.tsx (web)
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import PaymentRequestButton from './StripePaymentButton';

export default function CheckoutPage({ taskId, offerId, amount, currency }) {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Call your existing backend to create payment intent
    fetch('https://au-live-api.mytodoo.com/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ taskId, offerId, amount, currency }),
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {/* Google Pay / Apple Pay button */}
      <PaymentRequestButton
        clientSecret={clientSecret}
        amount={amount}
        currency={currency}
        onSuccess={(paymentIntent) => {
          console.log('✅ Web payment succeeded:', paymentIntent.id);
          // Handle success — redirect, update UI, etc.
        }}
      />

      {/* Card form fallback (shown if Apple Pay / Google Pay not available) */}
      <CardForm clientSecret={clientSecret} />
    </Elements>
  );
}
```

---

#### Step 4: Card Form Fallback (for browsers without Apple/Google Pay)

```tsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function CardForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://mytodoo.com/payment-success',
      },
      redirect: 'if_required', // Only redirect if 3DS required
    });

    if (error) {
      console.error('❌ Payment failed:', error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      console.log('✅ Card payment succeeded!');
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />  {/* Stripe's pre-built card input UI */}
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

---

### 2.4 Web — Apple Pay Domain Verification ⚠️ REQUIRED

Apple Pay on web requires domain verification. Must do this **before** Apple Pay shows on web.

#### Steps:
1. Download the domain association file from **Stripe Dashboard**:  
   → **Settings → Payment Methods → Apple Pay → Add domain**  
   → Enter: `mytodoo.com`  
   → Download the file

2. Host the file at:
   ```
   https://mytodoo.com/.well-known/apple-developer-merchantid-domain-association
   ```
   (Must be accessible publicly via HTTPS — no redirects)

3. Click **Verify** in Stripe Dashboard

> ✅ **Google Pay on web does NOT need domain verification.**

---

### 2.5 Web Environment Variables

```env
# .env (Next.js / Vite web project)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RqszuI4p0wHhJ1q...
# or
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RqszuI4p0wHhJ1q...

# ⚠️ NEVER expose secret key on frontend
# Secret key (sk_live_...) is only for your backend Node.js server
```

---

### 2.6 Web vs Mobile — Key Differences

| | **Mobile (React Native)** | **Web (React/Next.js)** |
|---|---|---|
| **Library** | `@stripe/stripe-react-native` | `@stripe/stripe-js` + `@stripe/react-stripe-js` |
| **Payment UI** | `initPaymentSheet()` + `presentPaymentSheet()` | `<PaymentRequestButtonElement>` + `<PaymentElement>` |
| **Currency case** | `UPPERCASE` (e.g. `"AUD"`) | `lowercase` (e.g. `"aud"`) |
| **Amount unit** | Dollars (e.g. `25.00`) | Cents (e.g. `2500`) |
| **Apple Pay setup** | `merchantIdentifier` + iOS entitlement | Domain verification in Stripe Dashboard |
| **Google Pay setup** | `AndroidManifest.xml` meta-data | Automatic — no config needed |
| **Backend endpoint** | `POST /api/payments/create-intent` | **Same endpoint** — no change |
| **Secret key location** | Backend only | Backend only |
| **Test mode** | `testEnv: pk_test_` prefix check | Automatic — publishable key determines test/live |

---

## 🔑 3. Stripe Keys Summary

| Key Type | Value Prefix | Used In | Secret? |
|---|---|---|---|
| Test Publishable | `pk_test_51Rqt0M...` | Frontend (safe to expose) | ❌ No |
| Live Publishable | `pk_live_51Rqszu...` | Frontend (safe to expose) | ❌ No |
| Test Secret | `sk_test_51Rqt0M...` | Backend only | ✅ YES |
| Live Secret | `sk_live_...` | Backend only | ✅ YES |

> **Current app.config**: Live Publishable Key used for UAT + Live builds  
> **Test mode**: Only for local development / Expo Go

---

## 📋 4. Complete Requirements Checklist

### Mobile (Already Done ✅)
- [x] `@stripe/stripe-react-native` installed
- [x] `<StripeProvider merchantIdentifier="merchant.com.mytodoo.mytodoolive">` 
- [x] iOS entitlement `com.apple.developer.in-app-payments` in `app.config.ts`
- [x] `applePay: { merchantCountryCode: 'AU' }` in `initPaymentSheet`
- [x] `com.google.android.gms.wallet.api.enabled` in `AndroidManifest.xml`
- [x] `googlePay: { merchantCountryCode: 'AU', testEnv: auto-detected }` in `initPaymentSheet`
- [x] Backend `POST /api/payments/create-intent` working

### Web (Todo)
- [ ] Install `@stripe/stripe-js` + `@stripe/react-stripe-js`
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env`
- [ ] Wrap app in `<Elements stripe={stripePromise}>`
- [ ] Implement `stripe.paymentRequest()` for Apple Pay / Google Pay detection
- [ ] Add `<PaymentRequestButtonElement>` for the pay button
- [ ] Add `<PaymentElement>` as card form fallback
- [ ] **Verify `mytodoo.com` domain in Stripe Dashboard** (Apple Pay web requirement)
- [ ] Host `/.well-known/apple-developer-merchantid-domain-association` file
- [ ] Use same backend endpoint (no changes needed)
