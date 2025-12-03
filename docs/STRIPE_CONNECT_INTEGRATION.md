# Stripe Connect Payout Account Integration

## Overview
Integrated Stripe Connect payout account management system with 5 API endpoints for taskers to receive payments from completed tasks.

## Implementation Date
January 2025

## API Endpoints Integrated

### 1. GET /stripe/connect/status
- **Purpose**: Check current payout account status
- **Response**: Account status (pending/active/restricted/disabled), capabilities, requirements
- **Error Handling**: 404 if no account exists

### 2. POST /stripe/connect/account
- **Purpose**: Create new Stripe Connect account
- **Response**: Account ID and initial status
- **Error Handling**: 400 if account already exists

### 3. POST /stripe/connect/account-link
- **Purpose**: Get Stripe onboarding URL for account setup
- **Parameters**: 
  - `returnUrl`: mytodoo://stripe-onboarding/return
  - `refreshUrl`: mytodoo://stripe-onboarding/refresh
- **Response**: Onboarding URL string
- **Usage**: Opens in WebView for user to complete bank details

### 4. GET /stripe/connect/payouts?limit=10
- **Purpose**: Retrieve payout history
- **Response**: List of payouts with amount, status, dates, metadata
- **Error Handling**: 404 if no account exists

### 5. DELETE /stripe/connect/account
- **Purpose**: Deactivate payout account
- **Response**: Success confirmation
- **Note**: Account data retained for compliance

## Files Created

### 1. src/api/stripe-connect-api.ts
**Purpose**: Stripe Connect API client service

**Key Components**:
- `StripeConnectAPIService` class with 5 methods
- TypeScript interfaces for all request/response types
- Error handling for 404, 400, 401, 500 status codes
- AsyncStorage integration for auth tokens

**Methods**:
```typescript
getAccountStatus(): Promise<StripeAccountStatus>
createAccount(): Promise<StripeAccountCreateResponse>
getAccountLink(returnUrl: string, refreshUrl: string): Promise<string>
getPayoutHistory(limit?: number): Promise<StripePayoutHistoryResponse>
deleteAccount(): Promise<void>
```

### 2. src/shared/hooks/useStripeConnectApi.ts
**Purpose**: React Query hooks for Stripe Connect API

**Hooks**:
- `useGetStripeAccountStatus(enabled)` - Query hook with 404 retry handling
- `useCreateStripeAccount()` - Mutation hook for creating account
- `useGetStripeAccountLink()` - Mutation hook for getting onboarding URL
- `useGetPayoutHistory(limit, enabled)` - Query hook for payout list
- `useDeleteStripeAccount()` - Mutation hook for account deletion

**Features**:
- Automatic cache invalidation after mutations
- 404 error handling (don't retry)
- Stale time configuration (2-5 minutes)

### 3. src/features/profile/screens/payout-account-screen.tsx
**Purpose**: Main payout account management screen

**Features**:
- **Account Status Check**: Displays current account status on mount
- **Create Account Flow**: 
  1. User clicks "Add Payout Account"
  2. Creates Stripe Connect account
  3. Gets onboarding link
  4. Opens WebView for bank details
- **WebView Integration**: 
  - Uses react-native-webview for Stripe onboarding
  - Handles return/refresh URLs via deep linking
  - Auto-closes on completion
- **Status Display**: Shows account capabilities (charges, payouts, details)
- **Action Buttons**: 
  - Continue Setup (if incomplete)
  - Refresh Status
  - Delete Account

**States**:
- No account (404): Shows "Add Payout Account" button
- Pending: Shows verification in progress
- Active: Shows all enabled features
- Restricted: Shows warning to complete onboarding

### 4. src/features/profile/screens/payout-history-screen.tsx
**Purpose**: Display payout transaction history

**Features**:
- **Payout List**: Scrollable list of all payouts
- **Payout Details**:
  - Amount and currency
  - Status badge (paid/pending/in_transit/failed/canceled)
  - Creation date
  - Arrival date
  - Description (task info)
- **Empty States**:
  - No account: Link to payout account setup
  - No payouts: Informational message
- **Pull to Refresh**: Manual refresh capability
- **Pagination Info**: Shows count of visible payouts

### 5. src/features/profile/screens/paymentscreens.jsx (Modified)
**Purpose**: Updated payment options navigation

**Changes**:
- Added "Setup Payout Account" menu item → navigates to `payoutAccount`
- Added "View Payout History" menu item → navigates to `payoutHistory`
- Imported PayoutAccountScreen and PayoutHistoryScreen
- Added new cases in renderScreen() switch statement

## User Flow

### First Time Setup
1. User navigates to Profile → Account Settings → Payment Options
2. Clicks "Setup Payout Account"
3. System checks account status (gets 404)
4. Shows "Add Payout Account" button with info about bank details needed
5. User clicks button
6. Creates Stripe Connect account (POST /stripe/connect/account)
7. Gets onboarding URL (POST /stripe/connect/account-link)
8. Opens WebView with Stripe onboarding
9. User enters:
   - Personal details
   - Business details (if applicable)
   - Bank account (BSB + Account Number for Australia)
   - Identity verification
10. On completion, returns to app (mytodoo://stripe-onboarding/return)
11. Auto-refreshes status
12. Shows "Success" alert
13. Displays active account status

### Viewing Payout History
1. User navigates to Payment Options → View Payout History
2. System loads payouts (GET /stripe/connect/payouts?limit=20)
3. Displays list with:
   - Amount (formatted as $XX.XX AUD)
   - Status badge (color-coded)
   - Date created
   - Expected arrival date
   - Task description
4. User can pull to refresh
5. Shows total count at bottom

### Deleting Account
1. User navigates to payout account screen
2. Clicks "Delete Account" button
3. Confirmation alert appears
4. User confirms deletion
5. Account deactivated (DELETE /stripe/connect/account)
6. Success message shown
7. Status refreshed (now shows 404)

## Australian Banking Requirements
- **BSB**: 6-digit bank-state-branch number
- **Account Number**: Up to 9 digits
- **Payout Timeline**: 3-5 business days
- **Currency**: AUD (Australian Dollars)

## Error Handling

### 404 Not Found
- **Meaning**: No payout account exists
- **Action**: Show "Add Account" button
- **Don't Retry**: Prevents infinite loading

### 400 Bad Request
- **Meaning**: Account already exists (on create)
- **Action**: Alert user, refresh status
- **Recovery**: Automatic status check

### 401 Unauthorized
- **Meaning**: Invalid or expired auth token
- **Action**: Alert user, may require re-login
- **Recovery**: User must re-authenticate

### 500 Server Error
- **Meaning**: Backend processing error
- **Action**: Alert user to try again later
- **Recovery**: Retry button available

## Deep Linking Setup

### Return URL
- **URL**: `mytodoo://stripe-onboarding/return`
- **Purpose**: User completed onboarding successfully
- **Action**: Close WebView, refresh status, show success alert

### Refresh URL
- **URL**: `mytodoo://stripe-onboarding/refresh`
- **Purpose**: User needs to refresh onboarding link (expired)
- **Action**: Get new link, reopen WebView

**Note**: Deep linking configuration already exists in app.config.ts with scheme "mytodoo"

## Dependencies Used

### Already Installed
- `react-native-webview`: ^13.15.0 (for Stripe onboarding)
- `@tanstack/react-query`: (for API state management)
- `@react-native-async-storage/async-storage`: (for auth tokens)
- `@expo/vector-icons`: (for icons)

### No Additional Installations Required
All necessary packages already in package.json

## Security Considerations

1. **Auth Tokens**: Retrieved from AsyncStorage for each API call
2. **HTTPS Only**: All API calls use BASE_URL (production https)
3. **WebView Security**: Stripe handles sensitive banking data, not stored in app
4. **Token Refresh**: User may need to re-login if token expires (401 error)
5. **Account Deletion**: Soft delete - data retained for compliance

## Testing Checklist

### Account Creation
- [ ] No account shows "Add Account" button
- [ ] Create account button works
- [ ] WebView opens with Stripe onboarding
- [ ] Can enter bank details in WebView
- [ ] Return URL closes WebView and refreshes status
- [ ] Success alert appears after completion

### Account Status
- [ ] Pending status shows yellow badge
- [ ] Active status shows green badge
- [ ] Restricted status shows red warning
- [ ] Account ID displayed correctly
- [ ] Capabilities shown (charges, payouts, details)
- [ ] Refresh button updates status

### Payout History
- [ ] Empty state shows when no payouts
- [ ] No account state links to setup
- [ ] Payouts display with correct formatting
- [ ] Status badges color-coded correctly
- [ ] Dates formatted as Australian locale
- [ ] Pull to refresh works
- [ ] Pagination info accurate

### Error Handling
- [ ] 404 shows "Add Account" option
- [ ] 400 on duplicate account handled
- [ ] 401 shows auth error message
- [ ] 500 shows retry option
- [ ] Network errors handled gracefully

### Navigation
- [ ] Payment Options → Setup Payout Account works
- [ ] Payment Options → View Payout History works
- [ ] Back buttons return to Payment Options
- [ ] WebView close button works
- [ ] Deep link returns work

## Known Limitations

1. **Pagination**: Currently shows first 20 payouts, no "load more" functionality
2. **Filtering**: No date range or status filtering in payout history
3. **Notifications**: No push notifications when payout arrives
4. **Offline Support**: Requires network connection, no offline caching
5. **Multiple Accounts**: Only supports one payout account per user

## Future Enhancements

1. **Push Notifications**: Notify when payout status changes
2. **Payout Analytics**: Charts showing earnings over time
3. **Tax Documents**: Download 1099/tax forms
4. **Instant Payouts**: Option for faster payouts (fees apply)
5. **Multiple Bank Accounts**: Switch between accounts
6. **Export History**: CSV/PDF export of payout history

## Support & Documentation

### User-Facing Help
- Payout timeline info displayed in UI: "3-5 business days for AU"
- Empty states provide context and next steps
- Error messages actionable and clear

### Developer Documentation
- All code commented with purpose and usage
- TypeScript interfaces provide type safety
- API error responses logged to console for debugging

## Compliance Notes

- **PCI Compliance**: Banking data handled by Stripe (PCI-DSS Level 1)
- **Data Retention**: Account data retained even after deletion (financial regulations)
- **Privacy**: User can request data deletion through support
- **Terms**: Users must agree to Stripe's Connected Account Agreement

## Integration Complete ✅

All 5 Stripe Connect endpoints successfully integrated with full UI implementation, error handling, and user flows. Ready for testing and deployment.
