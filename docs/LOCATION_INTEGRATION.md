# 🌍 Mapbox Location Search Integration

## Environment Setup (React Native vs Web)

### React Native (Current Mobile App)
```bash
# In your .env file
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### React Web (Your existing web app)
```bash
# In your .env file
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## Features Implemented

✅ **Multi-country Support**: Australia, New Zealand, Sri Lanka  
✅ **Location Types**: address, place, postcode, region  
✅ **Autocomplete**: Real-time suggestions as you type  
✅ **Limit**: 5 results (matching web version)  
✅ **Fallback**: Manual entry when Mapbox unavailable  

## API Configuration

Both implementations use the same Mapbox API:
- **Endpoint**: `https://api.mapbox.com/geocoding/v5/mapbox.places/`
- **Countries**: `AU,NZ,LK`
- **Types**: `address,place,postcode,region`
- **Language**: `en`
- **Autocomplete**: `true`
- **Limit**: `5`

## Usage

### Mobile (React Native)
```tsx
<LocationAutocomplete
  onSelect={handleLocationSelect}
  placeholder="Search for suburb, city or address..."
/>
```

### Web (React)
```jsx
// Your existing web implementation
```

## Differences

| Feature | Web | Mobile |
|---------|-----|--------|
| Environment Variable | `VITE_MAPBOX_ACCESS_TOKEN` | `EXPO_PUBLIC_MAPBOX_TOKEN` |
| Import | `import.meta.env` | `process.env` |
| Framework | Vite/React | Expo/React Native |
| UI Components | HTML elements | React Native components |

The core Mapbox API integration is identical between both platforms!