# Mapbox Integration Setup Guide

## Getting Your Mapbox Access Token

To use the location autocomplete feature in your app, you'll need to obtain a Mapbox access token.

### Steps to Get Mapbox Access Token:

1. **Sign up for Mapbox Account**
   - Go to [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)
   - Create a free account (includes 100,000 free geocoding requests per month)

2. **Access Your Tokens**
   - After signing up, go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - You'll see a default public token already created

3. **Copy Your Access Token**
   - Copy the default public token (starts with `pk.`)
   - This token is safe to use in your React Native app

4. **Configure the Token in Your App**
   - Open `components/LocationAutocomplete.tsx`
   - Find the line: `const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';`
   - Replace `'YOUR_MAPBOX_ACCESS_TOKEN_HERE'` with your actual token

### Example Configuration:

```typescript
// Replace this line in components/LocationAutocomplete.tsx
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrOXh4eHh4eDAyeHgzZXBjOXh4eHh4eHgifQ.xxxxxxxxxxxxxxxxxxxxxxxxxx';
```

### Security Notes:

- The public token (pk.) is safe to use in client-side applications
- It's designed to be included in your app bundle
- For production apps, consider using environment variables
- You can restrict token usage by domain/bundle ID in Mapbox dashboard

### API Limits:

- Free tier: 100,000 geocoding requests per month
- If you exceed limits, consider upgrading to a paid plan

### Features Enabled:

- Location search for Australia, New Zealand, and Sri Lanka
- Autocomplete suggestions for addresses, places, postcodes
- Coordinate extraction for precise location mapping
- Real-time search as user types

Once you've configured your token, the location autocomplete will work in your location screen!