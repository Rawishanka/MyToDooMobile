# Stripe Payout Account Screens - Complete Documentation

## Overview
This document provides a comprehensive description of the Stripe Connect payout account implementation for the MyToDoo mobile app, including all API calls, flow, and code structure for replication on the web platform.

---

## Screenshots Analysis

### Screen 1: Payout Account Status Screen
**Purpose**: Display the current status of the user's Stripe Connect account and provide options to continue setup, refresh status, or delete the account.

**UI Elements**:
- Account Status badge (showing "Pending Verification" in orange)
- Account ID display
- Warning message about verification time
- Continue Setup button (purple)
- Refresh Status button (white with purple border)
- Delete Account button (white with red border)
- Payout Timeline info box (blue background)

### Screen 2: Setup Payout Account Screen (Stripe Onboarding)
**Purpose**: Embedded Stripe Connect onboarding form where users enter their bank details and personal information.

**UI Elements**:
- Test phone number option
- Email address field
- Phone number field with country selector
- Submit button
- Stripe branding and legal links at bottom

---

## Complete API Integration

### Base Configuration

**API Base URL**: `https://api.mytodoo.com/api`

**Authentication**: Bearer token stored in AsyncStorage
```typescript
const token = await AsyncStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## API Endpoints

### 1. GET Account Status
**Endpoint**: `GET /stripe/connect/status`

**Purpose**: Retrieve the current status of the user's Stripe Connect account

**Request**:
```typescript
GET https://api.mytodoo.com/api/stripe/connect/status
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
```

**Response (Success - 200)**:
```typescript
{
  "data": {
    "accountId": "acct_1Sa462EXVpzVYCu9",
    "status": "pending" | "active" | "restricted" | "disabled",
    "detailsSubmitted": boolean,
    "chargesEnabled": boolean,
    "payoutsEnabled": boolean,
    "requirements": {
      "currently_due": string[],
      "eventually_due": string[],
      "past_due": string[]
    }
  }
}
```

**Response (No Account - 404)**:
```typescript
{
  "status": 404,
  "message": "No Stripe Connect account found"
}
```

**Error Responses**:
- **401**: Authentication expired - user needs to login again
- **500**: Server error - Stripe service unavailable

---

### 2. POST Create Account
**Endpoint**: `POST /stripe/connect/account`

**Purpose**: Create a new Stripe Connect Express account for the user

**Request**:
```typescript
POST https://api.mytodoo.com/api/stripe/connect/account
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body: (empty)
```

**Response (Success - 200)**:
```typescript
{
  "data": {
    "accountId": "acct_1Sa462EXVpzVYCu9",
    "status": "pending"
  }
}
```

**Response (Account Already Exists - 400)**:
```typescript
{
  "status": 400,
  "message": "Account already exists",
  "data": {
    "accountId": "acct_1Sa462EXVpzVYCu9",
    "status": "pending"
  }
}
```

**Error Responses**:
- **400**: Account already exists (includes existing account data)
- **401**: Authentication error
- **500**: Failed to create account on Stripe

---

### 3. POST Get Onboarding Link
**Endpoint**: `POST /stripe/connect/account-link`

**Purpose**: Generate a Stripe Connect onboarding URL for account setup

**Request**:
```typescript
POST https://api.mytodoo.com/api/stripe/connect/account-link
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
{
  "returnUrl": "https://mytodoo.com/stripe-onboarding/return",
  "refreshUrl": "https://mytodoo.com/stripe-onboarding/refresh"
}
```

**Response (Success - 200)**:
```typescript
{
  "data": {
    "url": "https://connect.stripe.com/express/oauth/authorize?..."
  }
}
```

**URL Parameters Explanation**:
- `returnUrl`: Where to redirect after successful onboarding completion
- `refreshUrl`: Where to redirect if the link expires and needs refresh

**Error Responses**:
- **404**: No account found - user needs to create account first
- **401**: Authentication error
- **500**: Failed to generate Stripe link

---

### 4. GET Payout History
**Endpoint**: `GET /stripe/connect/payouts?limit={limit}`

**Purpose**: Retrieve the user's payout history

**Request**:
```typescript
GET https://api.mytodoo.com/api/stripe/connect/payouts?limit=10
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
```

**Response (Success - 200)**:
```typescript
{
  "data": {
    "payouts": [
      {
        "payoutId": "po_1234567890",
        "amount": 5000,
        "currency": "aud",
        "status": "paid" | "pending" | "in_transit" | "canceled" | "failed",
        "arrivalDate": 1639478400,
        "created": 1639392000,
        "description": "Payout for task completion",
        "metadata": {
          "taskerId": "68bba9aa738031d9bcf0bdf3",
          "taskId": "6936ec02",
          "paymentId": "pi_1234567890"
        }
      }
    ],
    "count": 1
  }
}
```

**Error Responses**:
- **404**: No account found
- **401**: Authentication error

---

### 5. DELETE Delete Account
**Endpoint**: `DELETE /stripe/connect/account`

**Purpose**: Delete/deactivate the user's Stripe Connect account

**Request**:
```typescript
DELETE https://api.mytodoo.com/api/stripe/connect/account
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
```

**Response (Success - 200)**:
```typescript
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Responses**:
- **404**: No account found
- **401**: Authentication error
- **500**: Failed to delete account

---

## Complete User Flow

### Flow 1: First Time Setup (No Account)

1. **User opens Payout Account screen**
   - App calls: `GET /stripe/connect/status`
   - Response: 404 (No account)
   - UI shows: Empty state with "Add Payout Account" button

2. **User taps "Add Payout Account"**
   - App calls: `POST /stripe/connect/account`
   - Response: Account created with ID
   - Immediately after success, app calls: `POST /stripe/connect/account-link`
   - Response: Stripe onboarding URL

3. **App opens WebView with Stripe URL**
   - WebView loads: `https://connect.stripe.com/express/oauth/authorize?...`
   - User fills out Stripe form:
     - Business/Personal information
     - Bank details (BSB, Account Number)
     - Phone number
     - Email address

4. **User completes Stripe form**
   - Stripe redirects to: `returnUrl` (https://mytodoo.com/stripe-onboarding/return)
   - App detects URL change in WebView
   - App closes WebView
   - App calls: `GET /stripe/connect/status` (refetch)
   - Response: Account with status "pending" or "active"
   - Alert shown: "Payout account setup completed!"

### Flow 2: Continue Incomplete Setup

1. **User has account but details not submitted**
   - App calls: `GET /stripe/connect/status`
   - Response: `detailsSubmitted: false`
   - UI shows: "Continue Setup" button

2. **User taps "Continue Setup"**
   - App calls: `POST /stripe/connect/account-link`
   - Response: New onboarding URL
   - Opens WebView with URL
   - Same flow as first-time setup

### Flow 3: Refresh Status (Pending Verification)

1. **Account is pending verification**
   - UI shows: Orange badge "Pending Verification"
   - Info message: "Your account is pending verification. This may take a few minutes."

2. **User taps "Refresh Status"**
   - App calls: `GET /stripe/connect/status`
   - Response: Updated status
   - UI updates to reflect new status

### Flow 4: Delete Account

1. **User taps "Delete Account"**
   - Alert shown: Confirmation dialog
   - User confirms deletion

2. **App processes deletion**
   - App calls: `DELETE /stripe/connect/account`
   - Response: Success
   - App calls: `GET /stripe/connect/status` (refetch)
   - Response: 404 (No account)
   - UI shows: Empty state

---

## Code Structure

### File Organization

```
src/
├── api/
│   ├── stripe-connect-api.ts          # API service layer
│   └── config.ts                      # API configuration
├── shared/
│   └── hooks/
│       └── useStripeConnectApi.ts     # React Query hooks
└── features/
    └── profile/
        └── screens/
            └── payout-account-screen.tsx  # Main screen component
```

### Key Technologies Used

1. **React Query** (`@tanstack/react-query`)
   - Manages API state, caching, and refetching
   - Automatically handles loading and error states

2. **React Native WebView** (`react-native-webview`)
   - Embeds Stripe Connect onboarding form
   - Monitors navigation to detect completion

3. **AsyncStorage** (`@react-native-async-storage/async-storage`)
   - Stores authentication token
   - Persists user session

### API Service Layer (`stripe-connect-api.ts`)

**Class**: `StripeConnectAPIService`

**Methods**:
```typescript
class StripeConnectAPIService {
  // Get auth headers with token
  private async getAuthHeaders()
  
  // GET account status
  async getAccountStatus(): Promise<StripeAccountStatus>
  
  // POST create account
  async createAccount(): Promise<StripeAccountCreateResponse>
  
  // POST get onboarding link
  async getAccountLink(returnUrl: string, refreshUrl: string): Promise<string>
  
  // GET payout history
  async getPayoutHistory(limit: number): Promise<StripePayoutHistoryResponse>
  
  // DELETE account
  async deleteAccount(): Promise<void>
}
```

### React Query Hooks (`useStripeConnectApi.ts`)

**Hooks**:
```typescript
// Query hook - auto-fetches and caches
useGetStripeAccountStatus(enabled?: boolean)

// Mutation hooks - manual triggers
useCreateStripeAccount()
useGetStripeAccountLink()
useGetPayoutHistory(limit?: number, enabled?: boolean)
useDeleteStripeAccount()
```

**Query Keys** (for cache management):
```typescript
STRIPE_CONNECT_QUERY_KEYS = {
  status: ['stripe-connect', 'status'],
  payouts: (limit) => ['stripe-connect', 'payouts', limit]
}
```

### Main Screen Component (`payout-account-screen.tsx`)

**State Management**:
```typescript
const [showWebView, setShowWebView] = useState(false);
const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);

const { data: accountStatus, isLoading, error, refetch } = useGetStripeAccountStatus();
const createAccount = useCreateStripeAccount();
const getAccountLink = useGetStripeAccountLink();
const deleteAccount = useDeleteStripeAccount();
```

**Handler Functions**:
```typescript
handleCreateAccount()        // Create account + get onboarding link
handleRefreshOnboarding()    // Get new onboarding link
handleDeleteAccount()        // Delete account with confirmation
handleWebViewNavigationStateChange()  // Detect completion in WebView
```

---

## Status Badge Logic

**Status Colors**:
```typescript
{
  'active': '#22c55e',      // Green
  'pending': '#f59e0b',     // Orange
  'restricted': '#ef4444',  // Red
  'disabled': '#6b7280'     // Gray
}
```

**Status Display Text**:
```typescript
{
  'active': 'Active',
  'pending': 'Pending Verification',
  'restricted': 'Restricted',
  'disabled': 'Disabled'
}
```

---

## WebView URL Monitoring

**Return URL Detection**:
```typescript
if (url.includes('stripe-onboarding/return')) {
  // User completed onboarding
  setShowWebView(false);
  refetch(); // Refresh account status
  Alert.alert('Success', 'Payout account setup completed!');
}
```

**Refresh URL Detection**:
```typescript
if (url.includes('stripe-onboarding/refresh')) {
  // Link expired, need new link
  setShowWebView(false);
  handleRefreshOnboarding();
}
```

---

## Error Handling

**Error Types and User Messages**:

| Error Code | Scenario | User Message |
|------------|----------|--------------|
| 400 | Account already exists | "You already have a payout account. Refreshing status..." |
| 401 | Authentication expired | "Your session has expired. Please log in again." |
| 404 | No account found | "No Stripe Connect account found" or "Please create a payout account first." |
| 500 | Server/Stripe error | "Unable to connect to payment service. Please try again later." |

---

## UI States

### 1. Loading State
```typescript
if (isLoading) {
  return <ActivityIndicator /> + "Loading account status..."
}
```

### 2. Empty State (No Account)
```typescript
if (accountNotFound) {
  return EmptyState with "Add Payout Account" button
}
```

### 3. Account Exists State
Shows:
- Status card with badge
- Account ID
- Checkmarks for: Details Submitted, Charges Enabled, Payouts Enabled
- Warning/info messages based on status
- Action buttons: Continue Setup, Refresh Status, Delete Account
- Payout timeline info box

### 4. WebView State (Onboarding)
```typescript
if (showWebView && onboardingUrl) {
  return <WebView source={{ uri: onboardingUrl }} />
}
```

---

## Data Types (TypeScript Interfaces)

```typescript
interface StripeAccountStatus {
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

interface StripeAccountCreateResponse {
  accountId: string;
  status: 'pending' | 'active' | 'restricted' | 'disabled';
}

interface StripeAccountLinkResponse {
  url: string;
}

interface StripePayout {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
  arrivalDate: number;
  created: number;
  description: string;
  metadata: {
    taskerId: string;
    taskId: string;
    paymentId: string;
  };
}
```

---

## Styling Guidelines

**Color Palette**:
- Primary Purple: `#6200ee`
- Success Green: `#22c55e`
- Warning Orange: `#f59e0b`
- Error Red: `#ef4444`
- Gray: `#6b7280`
- Light Gray: `#e0e0e0`
- Background: `#f5f5f5`

**Button Styles**:
```typescript
Primary Button:
  backgroundColor: '#6200ee'
  color: '#fff'
  borderRadius: 8px
  padding: 14px 24px

Secondary Button:
  backgroundColor: '#fff'
  borderColor: '#6200ee'
  borderWidth: 1px
  color: '#6200ee'

Danger Button:
  backgroundColor: '#fff'
  borderColor: '#ef4444'
  borderWidth: 1px
  color: '#ef4444'
```

---

## Implementation Checklist for Web

### Backend Requirements
- [ ] Implement Stripe Connect Express integration
- [ ] Create 5 API endpoints (status, create, link, payouts, delete)
- [ ] Set up webhook handlers for account updates
- [ ] Store Stripe account IDs in user database
- [ ] Implement proper error handling and logging

### Frontend Requirements
- [ ] Create payout account page/component
- [ ] Implement API service layer with axios/fetch
- [ ] Add state management (React Query or similar)
- [ ] Create WebView/iframe for Stripe onboarding
- [ ] Implement URL monitoring for completion detection
- [ ] Add error handling and user feedback
- [ ] Style according to brand guidelines
- [ ] Add loading states and spinners
- [ ] Implement responsive design

### Testing Checklist
- [ ] Test first-time account creation flow
- [ ] Test continue setup flow for incomplete accounts
- [ ] Test refresh status functionality
- [ ] Test delete account with confirmation
- [ ] Test WebView return URL detection
- [ ] Test WebView refresh URL detection
- [ ] Test all error scenarios (401, 404, 500)
- [ ] Test with Stripe test mode account

---

## Important Notes

1. **Return URLs**: Must be actual URLs on your domain that can handle redirects
2. **Stripe Test Mode**: Use test API keys during development
3. **Australia-specific**: The app mentions "Australian bank accounts" - ensure Stripe Connect is configured for AU
4. **Payout Timeline**: "3-5 business days" is Australia-specific
5. **Security**: Always validate tokens server-side
6. **Error Logging**: Implement comprehensive logging for debugging Stripe issues

---

## Contact Information

For questions about this implementation or Stripe Connect integration, refer to:
- Stripe Connect Documentation: https://stripe.com/docs/connect
- Stripe Express Accounts: https://stripe.com/docs/connect/express-accounts
- Stripe Account Links: https://stripe.com/docs/connect/enable-payment-acceptance-guide

---

**Document Created**: December 13, 2025  
**Mobile App Version**: React Native with Expo  
**API Base URL**: https://api.mytodoo.com/api  
**Stripe Integration**: Stripe Connect Express Accounts
