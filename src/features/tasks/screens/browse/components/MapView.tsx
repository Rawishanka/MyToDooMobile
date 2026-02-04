import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface Task {
  _id: string;
  title: string;
  budget: number;
  currency: string;
  formattedBudget?: string;
  location: {
    address: string;
    coordinates: object | { type: string; coordinates: [number, number] };
  };
  status: string;
  offerCount?: number;
}

interface MapViewProps {
  tasks: Task[];
  iconUrl?: string;
  focusTaskId?: string | null;
  onMapAction?: (action: string, taskId: string) => void;
}

export default function MapView({ tasks, iconUrl, focusTaskId, onMapAction }: MapViewProps) {
  console.log('🗺️ MapView Props Received:', {
    tasksCount: tasks.length,
    focusTaskId: focusTaskId,
    hasOnMapAction: !!onMapAction,
    taskIds: tasks.map(t => ({ id: t._id, title: t.title })).slice(0, 3)
  });

  const generateMapHTML = () => {
    console.log('🗺️ MapView Debug - Detailed Task Analysis:', {
      totalTasks: tasks.length,
      tasksWithLocationData: tasks.filter(t => t.location).length,
      tasksWithCoordinatesData: tasks.filter(t => t.location?.coordinates).length,
      focusTaskId: focusTaskId,
      sampleTasks: tasks.slice(0, 5).map(t => ({
        id: t._id,
        title: t.title,
        hasLocation: !!t.location,
        locationData: t.location,
        hasCoordinates: !!t.location?.coordinates,
        coordinatesData: t.location?.coordinates,
        coordinatesType: typeof t.location?.coordinates,
        coordinatesIsEmpty: t.location?.coordinates && Object.keys(t.location.coordinates).length === 0,
        address: t.location?.address
      }))
    });

    // Add comprehensive API data logging
    if (tasks.length > 0) {
      console.log('🔍 First task detailed analysis:', {
        task: tasks[0],
        locationStructure: {
          hasLocation: !!tasks[0].location,
          address: tasks[0].location?.address,
          coordinates: tasks[0].location?.coordinates,
          coordinatesType: typeof tasks[0].location?.coordinates,
          coordinatesKeys: tasks[0].location?.coordinates ? Object.keys(tasks[0].location.coordinates) : 'No coordinates',
          coordinatesContent: JSON.stringify(tasks[0].location?.coordinates, null, 2)
        }
      });
    }

    const markers: {
      id: string;
      lat: number;
      lng: number;
      title: string;
      price: string;
      location: string;
      status: string;
      offers: number;
    }[] = [];

    // Process tasks - convert addresses to coordinates
    tasks.forEach((task, index) => {
      if (!task.location) {
        console.log(`🚫 Task ${index + 1} has no location:`, { id: task._id, title: task.title });
        return;
      }

      let lat: number | null = null;
      let lng: number | null = null;

      // Try to get coordinates from existing task data first
      const coords = task.location.coordinates;
      
      console.log(`📍 Processing task ${index + 1} - ${task.title}:`, {
        id: task._id,
        address: task.location.address,
        hasCoordinates: !!coords,
        coordinatesType: coords ? typeof coords : 'undefined',
        coordinatesValue: coords ? JSON.stringify(coords) : 'none'
      });

      if (coords && Object.keys(coords).length > 0) {
        // Handle different coordinate formats from the API
        
        // Format 1: GeoJSON format { type: "Point", coordinates: [lng, lat] }
        if (typeof coords === 'object' && 'coordinates' in coords && Array.isArray(coords.coordinates)) {
          if (coords.coordinates.length === 2) {
            lng = typeof coords.coordinates[0] === 'number' ? coords.coordinates[0] : parseFloat(coords.coordinates[0]);
            lat = typeof coords.coordinates[1] === 'number' ? coords.coordinates[1] : parseFloat(coords.coordinates[1]);
            console.log(`✅ Extracted GeoJSON coordinates for ${task.title}:`, { lat, lng, source: 'GeoJSON API' });
          }
        }
        // Format 2: Object format { lat: number, lng: number }
        else if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
          const coordsObj = coords as any;
          lat = typeof coordsObj.lat === 'number' ? coordsObj.lat : parseFloat(coordsObj.lat);
          lng = typeof coordsObj.lng === 'number' ? coordsObj.lng : parseFloat(coordsObj.lng);
          console.log(`✅ Extracted object coordinates for ${task.title}:`, { lat, lng, source: 'Object API' });
        }
        // Format 3: Alternative object format { latitude: number, longitude: number }
        else if (typeof coords === 'object' && 'latitude' in coords && 'longitude' in coords) {
          const coordsObj = coords as any;
          lat = typeof coordsObj.latitude === 'number' ? coordsObj.latitude : parseFloat(coordsObj.latitude);
          lng = typeof coordsObj.longitude === 'number' ? coordsObj.longitude : parseFloat(coordsObj.longitude);
          console.log(`✅ Extracted lat/lng coordinates for ${task.title}:`, { lat, lng, source: 'LatLng API' });
        }
        // Format 4: Direct array format [lng, lat]
        else if (Array.isArray(coords) && coords.length === 2) {
          lng = typeof coords[0] === 'number' ? coords[0] : parseFloat(coords[0]);
          lat = typeof coords[1] === 'number' ? coords[1] : parseFloat(coords[1]);
          console.log(`✅ Extracted array coordinates for ${task.title}:`, { lat, lng, source: 'Array API' });
        }
        else {
          console.log(`⚠️ Unknown coordinate format for ${task.title}:`, { coords, type: typeof coords, keys: Object.keys(coords) });
        }
      }

      // ⚠️ CRITICAL FIX for Australia/NZ: ALWAYS try geocoding if we have an address
      // This ensures all tasks show up on map with accurate locations
      // Database coordinates should take priority, but we MUST have fallback for all countries
      const needsGeocoding = (lat === null || lng === null || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0));
      
      if (needsGeocoding && task.location.address) {
        console.log(`🔍 No valid API coordinates found (lat: ${lat}, lng: ${lng}), geocoding address for ${task.title}:`, task.location.address);
        const geocodedCoords = geocodeAddressSync(task.location.address);
        if (geocodedCoords) {
          lat = geocodedCoords.lat;
          lng = geocodedCoords.lng;
          console.log(`✅ Geocoded ${task.location.address} to:`, { lat, lng, source: 'Geocoded' });
        } else {
          console.log(`❌ Could not geocode ${task.location.address} - task will NOT appear on map`);
        }
      } else if (!needsGeocoding) {
        console.log(`✅ Using exact coordinates from database for ${task.title}:`, { lat, lng, address: task.location.address });
      }

      // Add marker if we have valid coordinates
      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        // Validate coordinates are reasonable and NOT (0, 0) which indicates missing data
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0)) {
          const coordinateSource = task.location.coordinates && Object.keys(task.location.coordinates).length > 0 ? 'API' : 'Geocoded';
          
          markers.push({
            id: task._id,
            lat: lat,
            lng: lng,
            title: task.title,
            price: task.formattedBudget || `${task.currency} ${task.budget}`,
            location: task.location.address || 'Location not specified',
            status: task.status,
            offers: task.offerCount || 0,
          });
          
          console.log(`🎯 Added marker ${markers.length} for task (${coordinateSource} coordinates):`, {
            id: task._id,
            title: task.title,
            lat: lat,
            lng: lng,
            address: task.location.address,
            source: coordinateSource
          });
        } else {
          console.log('⚠️ Invalid coordinates range for task:', { 
            taskId: task._id, 
            title: task.title,
            lat, 
            lng, 
            address: task.location.address 
          });
        }
      } else {
        console.log('🚫 No valid coordinates found for task:', {
          taskId: task._id,
          title: task.title,
          address: task.location.address,
          hasCoords: !!coords,
          coordsEmpty: coords && Object.keys(coords).length === 0,
          lat: lat,
          lng: lng,
          reason: 'Missing or invalid coordinate data'
        });
      }
    });

    console.log(`🗺️ Final map data summary:`, {
      totalTasksFromAPI: tasks.length,
      totalMarkersCreated: markers.length,
      tasksWithoutValidCoords: tasks.length - markers.length,
      focusTaskId: focusTaskId,
      sampleMarkers: markers.slice(0, 3).map(m => ({ 
        id: m.id, 
        title: m.title, 
        lat: m.lat, 
        lng: m.lng,
        address: m.location
      })),
      tasksWithoutMarkers: tasks.filter(t => 
        !markers.find(m => m.id === t._id)
      ).map(t => ({
        id: t._id,
        title: t.title,
        address: t.location?.address,
        hasCoords: !!t.location?.coordinates,
        coordsEmpty: t.location?.coordinates && Object.keys(t.location.coordinates).length === 0
      }))
    });
    
    return generateHTMLContent(markers);
  };

  // Enhanced synchronous geocoding function with better address patterns
  const geocodeAddressSync = (address: string): { lat: number; lng: number } | null => {
    if (!address) return null;

    const addressLower = address.toLowerCase();
    const locationMap = getLocationCoordinatesMap();
    
    // Parse address components - prioritize the first part (most specific location)
    // Format: "Ja-Ela, Gampaha, Sri Lanka" or "Sydney, NSW, Australia"
    const addressParts = address.split(',').map(part => part.trim().toLowerCase());
    
    console.log('🔍 Parsing address components:', { 
      fullAddress: address, 
      parts: addressParts,
      partsCount: addressParts.length 
    });
    
    // Check the first part (most specific location) with highest priority
    if (addressParts.length > 0) {
      const primaryLocation = addressParts[0];
      for (const [location, coords] of locationMap) {
        const locationLower = location.toLowerCase();
        // Exact match or very close match for the primary location
        if (primaryLocation === locationLower || 
            primaryLocation.includes(locationLower) ||
            locationLower.includes(primaryLocation)) {
          console.log(`✅ Found coordinates for primary location "${primaryLocation}" -> ${location}: ${coords.lat}, ${coords.lng}`);
          return coords;
        }
      }
    }
    
    // If no match in primary location, check all address parts in order
    for (const addressPart of addressParts) {
      for (const [location, coords] of locationMap) {
        const locationLower = location.toLowerCase();
        if (addressPart.includes(locationLower) || locationLower.includes(addressPart)) {
          console.log(`📍 Found coordinates for address part "${addressPart}" -> ${location}: ${coords.lat}, ${coords.lng}`);
          return coords;
        }
      }
    }
    
    // Fallback: Check for exact matches in full address (original behavior)
    for (const [location, coords] of locationMap) {
      if (addressLower.includes(location.toLowerCase())) {
        console.log(`📍 Found coordinates for ${address}: ${location} -> ${coords.lat}, ${coords.lng}`);
        return coords;
      }
    }

    // Enhanced pattern matching for Australian addresses
    if (addressLower.includes('langhorne creek') || addressLower.includes('kangaroo road')) {
      console.log(`📍 Found coordinates for ${address}: Langhorne Creek area`);
      return { lat: -35.3100, lng: 139.0500 };
    }

    // New: Enhanced suburb/street patterns
    if (addressLower.includes('adelaide') || addressLower.includes('sa ') || addressLower.includes('south australia')) {
      console.log(`📍 Found coordinates for ${address}: Adelaide area`);
      return { lat: -34.9285, lng: 138.6007 };
    }

    if (addressLower.includes('sydney') || addressLower.includes('nsw') || addressLower.includes('new south wales')) {
      console.log(`📍 Found coordinates for ${address}: Sydney area`);
      return { lat: -33.8688, lng: 151.2093 };
    }

    if (addressLower.includes('melbourne') || addressLower.includes('vic') || addressLower.includes('victoria')) {
      console.log(`📍 Found coordinates for ${address}: Melbourne area`);
      return { lat: -37.8136, lng: 144.9631 };
    }

    if (addressLower.includes('brisbane') || addressLower.includes('qld') || addressLower.includes('queensland')) {
      console.log(`📍 Found coordinates for ${address}: Brisbane area`);
      return { lat: -27.4698, lng: 153.0251 };
    }

    if (addressLower.includes('perth') || addressLower.includes('wa') || addressLower.includes('western australia')) {
      console.log(`📍 Found coordinates for ${address}: Perth area`);
      return { lat: -31.9505, lng: 115.8613 };
    }

    // Sri Lankan patterns
    if (addressLower.includes('colombo') || addressLower.includes('sri lanka') || addressLower.includes('lanka')) {
      console.log(`📍 Found coordinates for ${address}: Colombo area`);
      return { lat: 6.9271, lng: 79.8612 };
    }

    // New Zealand patterns  
    if (addressLower.includes('auckland') || addressLower.includes('new zealand') || addressLower.includes('nz')) {
      console.log(`📍 Found coordinates for ${address}: Auckland area`);
      return { lat: -36.8485, lng: 174.7633 };
    }

    // Fallback: Use address as search pattern in our location database
    for (const [location, coords] of locationMap) {
      if (address.toLowerCase().includes(location.toLowerCase()) || 
          location.toLowerCase().includes(addressLower.split(' ')[0]) ||
          location.toLowerCase().includes(addressLower.split(',')[0])) {
        console.log(`📍 Found fuzzy match for ${address}: ${location} -> ${coords.lat}, ${coords.lng}`);
        return coords;
      }
    }
    
    console.log(`❌ No coordinates found for address: ${address}`);
    return null;
  };

  // Enhanced location coordinates database for better geocoding coverage
  const getLocationCoordinatesMap = (): Map<string, { lat: number; lng: number }> => {
    return new Map([
      // ==================================================
      // AUSTRALIA - COMPREHENSIVE LOCATION DATABASE
      // ==================================================
      
      // Australian Capital Territory
      ['canberra', { lat: -35.2809, lng: 149.1300 }],
      ['belconnen', { lat: -35.2381, lng: 149.0661 }],
      ['tuggeranong', { lat: -35.4244, lng: 149.0669 }],
      ['woden', { lat: -35.3444, lng: 149.0856 }],
      ['gungahlin', { lat: -35.1847, lng: 149.1328 }],
      
      // South Australia - Regional & Suburbs
      ['langhorne creek', { lat: -35.3100, lng: 139.0500 }],
      ['kangaroo road', { lat: -35.3100, lng: 139.0500 }],
      ['strathalbyn', { lat: -35.2606, lng: 138.8906 }],
      ['mount barker', { lat: -35.0706, lng: 138.8606 }],
      ['murray bridge', { lat: -35.1197, lng: 139.2756 }],
      ['victor harbor', { lat: -35.5528, lng: 138.6156 }],
      ['goolwa', { lat: -35.5067, lng: 138.7847 }],
      ['norwood', { lat: -34.9219, lng: 138.6264 }],
      ['unley', { lat: -34.9504, lng: 138.6063 }],
      ['glenelg', { lat: -35.0067, lng: 138.5144 }],
      ['port adelaide', { lat: -34.8467, lng: 138.5089 }],
      ['elizabeth', { lat: -34.7183, lng: 138.6744 }],
      ['salisbury', { lat: -34.7606, lng: 138.6428 }],
      ['modbury', { lat: -34.8333, lng: 138.6833 }],
      
      // Western Australia
      ['australind', { lat: -33.2839, lng: 115.7289 }],
      ['bunbury', { lat: -33.3267, lng: 115.6378 }],
      ['mandurah', { lat: -32.5269, lng: 115.7214 }],
      ['fremantle', { lat: -32.0569, lng: 115.7439 }],
      ['joondalup', { lat: -31.7500, lng: 115.7667 }],
      ['rockingham', { lat: -32.2794, lng: 115.7328 }],
      
      // Victoria
      ['melbourne', { lat: -37.8136, lng: 144.9631 }],
      ['geelong', { lat: -38.1499, lng: 144.3617 }],
      ['ballarat', { lat: -37.5622, lng: 143.8503 }],
      ['bendigo', { lat: -36.7570, lng: 144.2794 }],
      ['shepparton', { lat: -36.3806, lng: 145.3986 }],
      ['mildura', { lat: -34.1850, lng: 142.1617 }],
      ['warrnambool', { lat: -38.3828, lng: 142.4856 }],
      ['frankston', { lat: -38.1432, lng: 145.1286 }],
      ['dandenong', { lat: -37.9881, lng: 145.2169 }],
      // New South Wales
      ['sydney', { lat: -33.8688, lng: 151.2093 }],
      ['parramatta', { lat: -33.8153, lng: 151.0000 }],
      ['penrith', { lat: -33.7508, lng: 150.6944 }],
      ['liverpool', { lat: -33.9267, lng: 150.9233 }],
      ['blacktown', { lat: -33.7689, lng: 150.9064 }],
      ['bankstown', { lat: -33.9181, lng: 151.0350 }],
      ['campbelltown', { lat: -34.0653, lng: 150.8126 }],
      ['sutherland', { lat: -34.0311, lng: 151.0569 }],
      ['hornsby', { lat: -33.7047, lng: 151.0989 }],
      ['ryde', { lat: -33.8156, lng: 151.1021 }],
      ['chatswood', { lat: -33.7969, lng: 151.1831 }],
      ['bondi', { lat: -33.8908, lng: 151.2743 }],
      ['manly', { lat: -33.7969, lng: 151.2897 }],
      ['cronulla', { lat: -34.0581, lng: 151.1517 }],
      ['maroubra', { lat: -33.9500, lng: 151.2500 }],
      ['newcastle', { lat: -32.9283, lng: 151.7817 }],
      ['wollongong', { lat: -34.4278, lng: 150.8931 }],
      ['central coast', { lat: -33.4269, lng: 151.3428 }],
      ['gosford', { lat: -33.4250, lng: 151.3417 }],
      ['albury', { lat: -36.0804, lng: 146.9158 }],
      ['wagga wagga', { lat: -35.1082, lng: 147.3598 }],
      ['orange', { lat: -33.2839, lng: 149.0992 }],
      ['dubbo', { lat: -32.2569, lng: 148.6011 }],
      ['tamworth', { lat: -31.0906, lng: 150.9297 }],
      ['port macquarie', { lat: -31.4311, lng: 152.9083 }],
      ['bathurst', { lat: -33.4172, lng: 149.5806 }],
      ['nowra', { lat: -34.8833, lng: 150.6000 }],
      
      // Victoria
      ['melbourne', { lat: -37.8136, lng: 144.9631 }],
      ['geelong', { lat: -38.1499, lng: 144.3617 }],
      ['ballarat', { lat: -37.5622, lng: 143.8503 }],
      ['bendigo', { lat: -36.7570, lng: 144.2794 }],
      ['shepparton', { lat: -36.3806, lng: 145.3986 }],
      ['mildura', { lat: -34.1850, lng: 142.1617 }],
      ['warrnambool', { lat: -38.3828, lng: 142.4856 }],
      ['frankston', { lat: -38.1432, lng: 145.1286 }],
      ['dandenong', { lat: -37.9881, lng: 145.2169 }],
      ['box hill', { lat: -37.8167, lng: 145.1233 }],
      ['richmond', { lat: -37.8264, lng: 144.9881 }],
      ['st kilda', { lat: -37.8667, lng: 144.9833 }],
      ['preston', { lat: -37.7500, lng: 145.0000 }],
      ['footscray', { lat: -37.7992, lng: 144.9014 }],
      
      // Queensland
      ['brisbane', { lat: -27.4698, lng: 153.0251 }],
      ['gold coast', { lat: -28.0167, lng: 153.4000 }],
      ['sunshine coast', { lat: -26.6500, lng: 153.0667 }],
      ['townsville', { lat: -19.2590, lng: 146.8169 }],
      ['cairns', { lat: -16.9186, lng: 145.7781 }],
      ['toowoomba', { lat: -27.5598, lng: 151.9507 }],
      ['ipswich', { lat: -27.6167, lng: 152.7667 }],
      ['logan', { lat: -27.6394, lng: 153.1094 }],
      ['mackay', { lat: -21.1428, lng: 149.1861 }],
      ['rockhampton', { lat: -23.3803, lng: 150.5111 }],
      ['bundaberg', { lat: -24.8661, lng: 152.3489 }],
      ['hervey bay', { lat: -25.2990, lng: 152.8224 }],
      ['mount isa', { lat: -20.7256, lng: 139.4927 }],
      ['redcliffe', { lat: -27.2311, lng: 153.1097 }],
      ['southport', { lat: -27.9667, lng: 153.4000 }],
      
      // South Australia
      ['adelaide', { lat: -34.9285, lng: 138.6007 }],
      ['mount gambier', { lat: -37.8289, lng: 140.7825 }],
      ['whyalla', { lat: -33.0333, lng: 137.5167 }],
      ['murray bridge', { lat: -35.1197, lng: 139.2756 }],
      ['port augusta', { lat: -32.4928, lng: 137.7656 }],
      ['victor harbor', { lat: -35.5528, lng: 138.6156 }],
      ['goolwa', { lat: -35.5067, lng: 138.7847 }],
      ['norwood', { lat: -34.9219, lng: 138.6264 }],
      ['unley', { lat: -34.9504, lng: 138.6063 }],
      ['glenelg', { lat: -35.0067, lng: 138.5144 }],
      ['port adelaide', { lat: -34.8467, lng: 138.5089 }],
      ['elizabeth', { lat: -34.7183, lng: 138.6744 }],
      ['salisbury', { lat: -34.7606, lng: 138.6428 }],
      ['modbury', { lat: -34.8333, lng: 138.6833 }],
      ['mount barker', { lat: -35.0706, lng: 138.8606 }],
      ['langhorne creek', { lat: -35.3100, lng: 139.0500 }],
      ['strathalbyn', { lat: -35.2606, lng: 138.8906 }],
      
      // Western Australia
      ['perth', { lat: -31.9505, lng: 115.8613 }],
      ['fremantle', { lat: -32.0569, lng: 115.7439 }],
      ['mandurah', { lat: -32.5269, lng: 115.7214 }],
      ['bunbury', { lat: -33.3267, lng: 115.6378 }],
      ['geraldton', { lat: -28.7774, lng: 114.6147 }],
      ['kalgoorlie', { lat: -30.7489, lng: 121.4656 }],
      ['albany', { lat: -35.0269, lng: 117.8842 }],
      ['rockingham', { lat: -32.2794, lng: 115.7328 }],
      ['joondalup', { lat: -31.7500, lng: 115.7667 }],
      ['armadale', { lat: -32.1500, lng: 116.0167 }],
      ['australind', { lat: -33.2839, lng: 115.7289 }],
      
      // Tasmania
      ['hobart', { lat: -42.8821, lng: 147.3272 }],
      ['launceston', { lat: -41.4332, lng: 147.1441 }],
      ['devonport', { lat: -41.1789, lng: 146.3503 }],
      ['burnie', { lat: -41.0556, lng: 145.9025 }],
      
      // Northern Territory
      ['darwin', { lat: -12.4634, lng: 130.8456 }],
      ['alice springs', { lat: -23.6980, lng: 133.8807 }],
      ['palmerston', { lat: -12.4897, lng: 130.9833 }],
      
      // ==================================================
      // SRI LANKA - COMPREHENSIVE LOCATION DATABASE
      // ==================================================
      
      // Colombo District (most specific suburbs first)
      ['dehiwala', { lat: 6.8569, lng: 79.8658 }],
      ['mount lavinia', { lat: 6.8373, lng: 79.8636 }],
      ['moratuwa', { lat: 6.7731, lng: 79.8828 }],
      ['ratmalana', { lat: 6.8214, lng: 79.8864 }],
      ['wellawatte', { lat: 6.8747, lng: 79.8589 }],
      ['bambalapitiya', { lat: 6.8935, lng: 79.8501 }],
      ['kollupitiya', { lat: 6.9149, lng: 79.8486 }],
      ['fort', { lat: 6.9335, lng: 79.8459 }],
      ['pettah', { lat: 6.9393, lng: 79.8535 }],
      ['maradana', { lat: 6.9295, lng: 79.8607 }],
      ['borella', { lat: 6.9145, lng: 79.8797 }],
      ['slave island', { lat: 6.9261, lng: 79.8470 }],
      ['cinnamon gardens', { lat: 6.9090, lng: 79.8618 }],
      ['havelock town', { lat: 6.8964, lng: 79.8736 }],
      ['narahenpita', { lat: 6.9042, lng: 79.8840 }],
      ['nugegoda', { lat: 6.8649, lng: 79.8997 }],
      ['maharagama', { lat: 6.8482, lng: 79.9266 }],
      ['kotte', { lat: 6.8905, lng: 79.9075 }],
      ['sri jayawardenepura kotte', { lat: 6.8905, lng: 79.9075 }],
      ['rajagiriya', { lat: 6.9084, lng: 79.8973 }],
      ['battaramulla', { lat: 6.8978, lng: 79.9189 }],
      ['malabe', { lat: 6.9042, lng: 79.9536 }],
      ['kotahena', { lat: 6.9508, lng: 79.8531 }],
      ['grandpass', { lat: 6.9464, lng: 79.8568 }],
      ['dematagoda', { lat: 6.9348, lng: 79.8739 }],
      ['peliyagoda', { lat: 6.9683, lng: 79.8836 }],
      ['kelaniya', { lat: 6.9553, lng: 79.9219 }],
      ['kiribathgoda', { lat: 6.9786, lng: 79.9294 }],
      ['kadawatha', { lat: 7.0022, lng: 79.9531 }],
      ['ragama', { lat: 7.0272, lng: 79.9217 }],
      ['wattala', { lat: 6.9889, lng: 79.8917 }],
      ['ja-ela', { lat: 7.0747, lng: 79.8919 }],
      ['ja ela', { lat: 7.0747, lng: 79.8919 }],
      ['jaela', { lat: 7.0747, lng: 79.8919 }],
      ['seeduwa', { lat: 7.1172, lng: 79.8847 }],
      ['katunayake', { lat: 7.1697, lng: 79.8842 }],
      ['katunayaka', { lat: 7.1697, lng: 79.8842 }],
      ['colombo', { lat: 6.9271, lng: 79.8612 }],
      
      // Gampaha District
      ['gampaha', { lat: 7.0917, lng: 80.0000 }],
      ['negombo', { lat: 7.2083, lng: 79.8358 }],
      ['mirigama', { lat: 7.2417, lng: 80.1283 }],
      ['veyangoda', { lat: 7.1564, lng: 80.0769 }],
      ['divulapitiya', { lat: 7.2231, lng: 80.0092 }],
      ['minuwangoda', { lat: 7.1697, lng: 79.9517 }],
      ['nittambuwa', { lat: 7.1422, lng: 80.0892 }],
      ['attanagalla', { lat: 7.1083, lng: 80.1467 }],
      ['ganemulla', { lat: 7.0658, lng: 80.0200 }],
      ['biyagama', { lat: 6.9539, lng: 79.9778 }],
      
      // Kalutara District
      ['kalutara', { lat: 6.5854, lng: 79.9607 }],
      ['panadura', { lat: 6.7133, lng: 79.9025 }],
      ['horana', { lat: 6.7156, lng: 80.0631 }],
      ['beruwala', { lat: 6.4789, lng: 79.9828 }],
      ['aluthgama', { lat: 6.4308, lng: 80.0014 }],
      ['bentota', { lat: 6.4258, lng: 79.9956 }],
      ['wadduwa', { lat: 6.6639, lng: 79.9314 }],
      ['matugama', { lat: 6.5311, lng: 80.1553 }],
      ['bandaragama', { lat: 6.7181, lng: 79.9878 }],
      
      // Kandy District
      ['kandy', { lat: 7.2906, lng: 80.6337 }],
      ['peradeniya', { lat: 7.2675, lng: 80.5958 }],
      ['gampola', { lat: 7.1648, lng: 80.5769 }],
      ['kadugannawa', { lat: 7.2533, lng: 80.5222 }],
      ['katugastota', { lat: 7.3181, lng: 80.6328 }],
      ['gelioya', { lat: 7.1817, lng: 80.5511 }],
      ['pilimatalawa', { lat: 7.3142, lng: 80.5483 }],
      ['akurana', { lat: 7.3656, lng: 80.6181 }],
      
      // Matale District
      ['matale', { lat: 7.4675, lng: 80.6234 }],
      ['dambulla', { lat: 7.8608, lng: 80.6517 }],
      ['sigiriya', { lat: 7.9569, lng: 80.7603 }],
      
      // Nuwara Eliya District
      ['nuwara eliya', { lat: 6.9497, lng: 80.7891 }],
      ['hatton', { lat: 6.8919, lng: 80.5964 }],
      ['talawakelle', { lat: 6.9394, lng: 80.6556 }],
      ['nanu oya', { lat: 6.9392, lng: 80.7650 }],
      
      // Galle District
      ['galle', { lat: 6.0535, lng: 80.2210 }],
      ['hikkaduwa', { lat: 6.1406, lng: 80.1033 }],
      ['ambalangoda', { lat: 6.2361, lng: 80.0539 }],
      ['karapitiya', { lat: 6.0536, lng: 80.2342 }],
      ['unawatuna', { lat: 6.0108, lng: 80.2503 }],
      ['habaraduwa', { lat: 6.0006, lng: 80.2800 }],
      
      // Matara District
      ['matara', { lat: 5.9549, lng: 80.5550 }],
      ['weligama', { lat: 5.9734, lng: 80.4297 }],
      ['mirissa', { lat: 5.9467, lng: 80.4614 }],
      ['dikwella', { lat: 5.9667, lng: 80.6833 }],
      ['akuressa', { lat: 6.0994, lng: 80.4822 }],
      
      // Hambantota District
      ['hambantota', { lat: 6.1429, lng: 81.1212 }],
      ['tangalle', { lat: 6.0244, lng: 80.7969 }],
      ['tissamaharama', { lat: 6.2833, lng: 81.2833 }],
      ['ambalantota', { lat: 6.1214, lng: 81.0272 }],
      
      // Ratnapura District
      ['ratnapura', { lat: 6.6828, lng: 80.3992 }],
      ['embilipitiya', { lat: 6.3428, lng: 80.8503 }],
      ['balangoda', { lat: 6.6522, lng: 80.6975 }],
      
      // Badulla District
      ['badulla', { lat: 6.9934, lng: 81.0550 }],
      ['bandarawela', { lat: 6.8328, lng: 80.9850 }],
      ['ella', { lat: 6.8667, lng: 81.0467 }],
      ['haputale', { lat: 6.7714, lng: 80.9589 }],
      ['mahiyanganaya', { lat: 7.3311, lng: 81.0028 }],
      
      // Monaragala District
      ['monaragala', { lat: 6.8722, lng: 81.3506 }],
      ['wellawaya', { lat: 6.7333, lng: 81.1000 }],
      
      // Kurunegala District
      ['kurunegala', { lat: 7.4863, lng: 80.3647 }],
      ['kuliyapitiya', { lat: 7.4703, lng: 80.0403 }],
      ['polgahawela', { lat: 7.3333, lng: 80.3000 }],
      ['wariyapola', { lat: 7.5000, lng: 80.2167 }],
      ['maho', { lat: 7.8833, lng: 80.2500 }],
      
      // Puttalam District
      ['puttalam', { lat: 8.0364, lng: 79.8286 }],
      ['chilaw', { lat: 7.5761, lng: 79.7953 }],
      ['wennappuwa', { lat: 7.3500, lng: 79.8500 }],
      
      // Anuradhapura District
      ['anuradhapura', { lat: 8.3114, lng: 80.4037 }],
      ['medawachchiya', { lat: 9.0167, lng: 80.4833 }],
      ['mihintale', { lat: 8.3517, lng: 80.5058 }],
      ['kekirawa', { lat: 8.0333, lng: 80.6000 }],
      
      // Polonnaruwa District
      ['polonnaruwa', { lat: 7.9403, lng: 81.0003 }],
      ['hingurakgoda', { lat: 8.0500, lng: 80.9667 }],
      
      // Trincomalee District
      ['trincomalee', { lat: 8.5874, lng: 81.2152 }],
      ['kinniya', { lat: 8.5167, lng: 81.1833 }],
      
      // Batticaloa District
      ['batticaloa', { lat: 7.7102, lng: 81.7088 }],
      ['kattankudy', { lat: 7.6833, lng: 81.7333 }],
      
      // Ampara District
      ['ampara', { lat: 7.2967, lng: 81.6728 }],
      ['kalmunai', { lat: 7.4092, lng: 81.8356 }],
      ['akkaraipattu', { lat: 7.2167, lng: 81.8500 }],
      
      // Jaffna District
      ['jaffna', { lat: 9.6615, lng: 80.0255 }],
      ['nallur', { lat: 9.6833, lng: 80.0333 }],
      ['chavakachcheri', { lat: 9.6667, lng: 80.1667 }],
      
      // Vavuniya District
      ['vavuniya', { lat: 8.7514, lng: 80.4981 }],
      
      // Mannar District
      ['mannar', { lat: 8.9814, lng: 79.9044 }],
      
      // Kilinochchi District
      ['kilinochchi', { lat: 9.3833, lng: 80.4000 }],
      
      // Mullaitivu District
      ['mullaitivu', { lat: 9.2667, lng: 80.8142 }],
      
      // ==================================================
      // NEW ZEALAND - COMPREHENSIVE LOCATION DATABASE
      // ==================================================
      
      // North Island
      ['auckland', { lat: -36.8485, lng: 174.7633 }],
      ['manukau', { lat: -37.0000, lng: 174.8833 }],
      ['north shore', { lat: -36.8000, lng: 174.7500 }],
      ['waitakere', { lat: -36.8500, lng: 174.5500 }],
      ['hamilton', { lat: -37.7870, lng: 175.2793 }],
      ['tauranga', { lat: -37.6878, lng: 176.1651 }],
      ['rotorua', { lat: -38.1368, lng: 176.2497 }],
      ['napier', { lat: -39.4928, lng: 176.9120 }],
      ['hastings', { lat: -39.6381, lng: 176.8419 }],
      ['palmerston north', { lat: -40.3523, lng: 175.6082 }],
      ['wellington', { lat: -41.2865, lng: 174.7762 }],
      ['lower hutt', { lat: -41.2092, lng: 174.9042 }],
      ['upper hutt', { lat: -41.1244, lng: 175.0514 }],
      ['porirua', { lat: -41.1344, lng: 174.8397 }],
      ['whangarei', { lat: -35.7247, lng: 174.3236 }],
      ['new plymouth', { lat: -39.0667, lng: 174.0833 }],
      ['gisborne', { lat: -38.6625, lng: 178.0175 }],
      ['whanganui', { lat: -39.9306, lng: 175.0478 }],
      ['kapiti coast', { lat: -40.9167, lng: 175.0000 }],
      
      // South Island
      ['christchurch', { lat: -43.5321, lng: 172.6362 }],
      ['dunedin', { lat: -45.8788, lng: 170.5028 }],
      ['nelson', { lat: -41.2706, lng: 173.2840 }],
      ['queenstown', { lat: -45.0311, lng: 168.6626 }],
      ['invercargill', { lat: -46.4132, lng: 168.3538 }],
      ['timaru', { lat: -44.3936, lng: 171.2372 }],
      ['blenheim', { lat: -41.5139, lng: 173.9550 }],
      ['ashburton', { lat: -43.8989, lng: 171.7519 }],
      ['greymouth', { lat: -42.4500, lng: 171.2106 }],
    ]);
  };

  const generateHTMLContent = (markers: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    price: string;
    location: string;
    status: string;
    offers: number;
  }[]) => {
    console.log('🗺️ Final Map Markers:', {
      totalMarkers: markers.length,
      markers: markers.slice(0, 3).map(m => ({
        id: m.id,
        title: m.title,
        lat: m.lat,
        lng: m.lng
      }))
    });

    // Calculate center based on focus task or markers
    let centerLat = -34.9285; // Adelaide default
    let centerLng = 138.6007;
    
    // If focusing on a specific task, use its coordinates as center
    if (focusTaskId) {
      const focusMarker = markers.find(m => m.id === focusTaskId);
      if (focusMarker) {
        centerLat = focusMarker.lat;
        centerLng = focusMarker.lng;
        console.log('🎯 Using focus task coordinates as center:', { lat: centerLat, lng: centerLng, taskId: focusTaskId });
      } else {
        console.log('⚠️ Focus task not found in markers, using calculated center');
        if (markers.length > 0) {
          centerLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
          centerLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
        }
      }
    } else if (markers.length > 0) {
      centerLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
      centerLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
      console.log('📍 Using calculated center from all markers:', { lat: centerLat, lng: centerLng });
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Tasks Map</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }
        #map { 
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          height: 100vh; 
          width: 100vw;
          background-color: #f5f5f5;
        }
        .leaflet-container {
          background-color: #f5f5f5 !important;
          height: 100% !important;
          width: 100% !important;
        }
        .marker-popup {
          max-width: 250px;
          font-size: 14px;
        }
        .marker-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          font-size: 16px;
        }
        .marker-price {
          color: #007BFF;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .marker-location {
          color: #666;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .marker-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 4px;
        }
        .marker-actions {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #eee;
        }
        .action-btn {
          background: #007BFF;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          margin-right: 6px;
        }
        .action-btn:hover {
          background: #0056b3;
        }
        .leaflet-tile-pane {
          filter: grayscale(20%) brightness(95%) !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          border: 1px solid #ddd !important;
          color: #666 !important;
          font-size: 16px !important;
          line-height: 26px !important;
          text-align: center !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f8f9fa !important;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize the map with appropriate zoom level and constraints
        // When no tasks: show Australia-focused view (zoom 5), not world view
        const initialZoom = ${focusTaskId ? '14' : markers.length > 0 ? '6' : '5'};
        const map = L.map('map', {
          center: [${centerLat}, ${centerLng}],
          zoom: initialZoom,
          minZoom: 3,
          maxZoom: 18,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0
        });
        console.log('🗺️ Map initialized with center:', [${centerLat}, ${centerLng}], 'zoom:', initialZoom);
        
        // Add OpenStreetMap tiles with zoom constraints
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          minZoom: 3,
          maxZoom: 18,
        }).addTo(map);

        // Prevent zoom out beyond world bounds
        map.on('zoomend', function() {
          const zoom = map.getZoom();
          if (zoom < 3) {
            map.setZoom(3);
          }
        });

        // Custom airtasker marker icon using the SVG - LARGER SIZE for better visibility
        const airtaskerIcon = L.divIcon({
          className: 'airtasker-marker-icon',
          html: \`
            <div style="
              position: relative;
              width: 50px;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 938 938" style="filter: drop-shadow(0 3px 12px rgba(0,0,0,0.5));">
                <path d="M0 0 C4.36581165 3.64336636 8.60293638 7.38221093 12.73828125 11.28515625 C13.48722656 11.96964844 14.23617187 12.65414062 15.0078125 13.359375 C33.30378594 30.69408889 44.54197269 55.68090101 48.73828125 80.28515625 C49.01285156 81.84943359 49.01285156 81.84943359 49.29296875 83.4453125 C51.08702963 98.91515321 50.59697339 114.45822344 45.73828125 129.28515625 C45.48046875 130.08888672 45.22265625 130.89261719 44.95703125 131.72070312 C34.46979986 163.78929726 18.00457301 194.17291561 0.28369141 222.78613281 C-1.33334483 225.40098004 -2.93233085 228.02638507 -4.53125 230.65234375 C-18.71500301 253.78880679 -34.02211452 276.33020905 -49.87402344 298.35595703 C-51.4491356 300.54570655 -53.01534363 302.74171601 -54.58203125 304.9375 C-70.97830844 327.85735281 -70.97830844 327.85735281 -75.26171875 329.28515625 C-83.55957241 318.10970169 -91.75315431 306.87422428 -99.72998047 295.46728516 C-101.29532587 293.23727922 -102.87303146 291.01645067 -104.453125 288.796875 C-114.79265946 274.22325721 -124.55983409 259.28720589 -134.26171875 244.28515625 C-134.85259277 243.37314453 -135.4434668 242.46113281 -136.05224609 241.52148438 C-206.90299744 131.85345079 -206.90299744 131.85345079 -195.63671875 74.66015625 C-191.09916251 54.05149029 -181.77754541 35.43656911 -168.26171875 19.28515625 C-167.63265625 18.51558594 -167.00359375 17.74601562 -166.35546875 16.953125 C-126.39997213 -30.53943121 -48.64910081 -38.37946654 0 0 Z M-128.2265625 47.6484375 C-140.15798116 63.10660947 -143.81151279 81.18820561 -142.26171875 100.28515625 C-139.90068289 117.48755965 -130.74276717 133.20180485 -117.69921875 144.47265625 C-107.90133799 151.87820842 -96.39089738 157.27215614 -84.26171875 159.28515625 C-83.39675781 159.43726563 -82.53179687 159.589375 -81.640625 159.74609375 C-62.77353051 162.26918217 -44.58343562 155.5264439 -29.60546875 144.29296875 C-19.43385967 135.72244628 -12.51685316 124.83363107 -8.26171875 112.28515625 C-7.94332031 111.37765625 -7.62492188 110.47015625 -7.296875 109.53515625 C-2.26551904 92.84125629 -4.73261281 74.5224463 -12.01171875 58.91015625 C-20.35818715 43.49005588 -34.27774001 30.50328213 -51.09375 24.93359375 C-54.47013575 23.95072963 -57.83222789 23.06040514 -61.26171875 22.28515625 C-62.07898438 22.094375 -62.89625 21.90359375 -63.73828125 21.70703125 C-88.48877621 17.5691776 -112.21589368 29.20934272 -128.2265625 47.6484375 Z " fill="#FDC901" transform="translate(542.26171875,316.71484375)"/>
                <path d="M0 0 C6.29893152 5.53416059 9.8657249 11.48313936 10.53125 19.98046875 C10.78049411 28.17436895 9.83931735 35.16804617 4.875 41.875 C-4.09841526 51.37886345 -17.09365354 53.08029951 -29.5 53.5 C-40.68213443 53.24821684 -52.99313809 51.80746358 -61.6875 44.1875 C-67.71205895 37.26807978 -70.17925918 29.93787787 -69.9296875 20.80078125 C-69.13330802 12.20758973 -66.2372633 5.89042522 -59.6875 0.1875 C-44.80216312 -10.51031354 -15.12907149 -10.54793209 0 0 Z M-43.6875 15.375 C-45.45962626 20.35910511 -45.56676403 25.10503256 -43.5 30 C-40.16108166 34.02972904 -37.55590552 36.29560736 -32.3125 37.0625 C-27.2622603 37.38075723 -23.08461015 37.01184931 -18.921875 33.84375 C-15.58095605 30.53405459 -14.26901895 27.84645045 -14.0625 23.125 C-14.37948556 18.48996664 -15.41864508 15.62398851 -18.6875 12.1875 C-27.39226776 7.1655186 -36.81077282 7.85357964 -43.6875 15.375 Z " fill="#C1FF72" transform="translate(498.6875,347.8125)"/>
                <path d="M0 0 C22.44 0 44.88 0 68 0 C68 4.95 68 9.9 68 15 C60.74 15 53.48 15 46 15 C46 28.86 46 42.72 46 57 C38.08 57 30.16 57 22 57 C22 43.14 22 29.28 22 15 C14.74 15 7.48 15 0 15 C0 10.05 0 5.1 0 0 Z " fill="#FF914D" transform="translate(435,404)"/>
              </svg>
            </div>
          \`,
          iconSize: [50, 50],
          iconAnchor: [25, 45],
          popupAnchor: [0, -45],
        });

        // Add markers for each task
        const markers = [${markers.map(marker => `
          {
            id: '${marker.id}',
            lat: ${marker.lat},
            lng: ${marker.lng},
            title: '${marker.title.replace(/'/g, "\\'")}',
            price: '${marker.price}',
            location: '${marker.location.replace(/'/g, "\\'")}',
            status: '${marker.status}',
            offers: ${marker.offers}
          }`).join(',')}
        ];

        // Helper function to apply offset to overlapping markers
        function applyMarkerOffset(markers) {
          const grouped = {};
          const offsetDistance = 0.0008; // Small offset in degrees (~90 meters)
          
          // Group markers by location
          markers.forEach(function(marker, index) {
            const key = marker.lat.toFixed(6) + ',' + marker.lng.toFixed(6);
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push({ marker: marker, originalIndex: index });
          });
          
          // Apply circular offset to overlapping markers
          Object.keys(grouped).forEach(function(key) {
            const group = grouped[key];
            if (group.length > 1) {
              // Spread markers in a circle
              group.forEach(function(item, index) {
                const angle = (360 / group.length) * index;
                const angleRad = angle * (Math.PI / 180);
                const offsetLat = Math.sin(angleRad) * offsetDistance;
                const offsetLng = Math.cos(angleRad) * offsetDistance;
                
                item.marker.lat = item.marker.lat + offsetLat;
                item.marker.lng = item.marker.lng + offsetLng;
              });
            }
          });
          
          return markers;
        }
        
        // Apply offset to markers at same location
        const offsetMarkers = applyMarkerOffset(markers);

        // Keep track of created markers for focus functionality
        const leafletMarkers = [];
        
        offsetMarkers.forEach(function(markerData) {
          const marker = L.marker([markerData.lat, markerData.lng], { icon: airtaskerIcon })
            .addTo(map);
          
          // Store reference to the leaflet marker
          leafletMarkers.push({ data: markerData, marker: marker });
          
          const popupContent = \`
            <div class="marker-popup">
              <div class="marker-title">\${markerData.title}</div>
              <div class="marker-price">\${markerData.price}</div>
              <div class="marker-location">\${markerData.location}</div>
              <div class="marker-meta">
                <span>Status: \${markerData.status}</span>
                <span>Offers: \${markerData.offers}</span>
              </div>
              <div class="marker-actions">
                <button class="action-btn" onclick="handleAction('viewDetails', '\${markerData.id}')">
                  View Details
                </button>
                <button class="action-btn" onclick="handleAction('openInMaps', '\${markerData.id}')">
                  Open in Maps
                </button>
              </div>
            </div>
          \`;
          
          marker.bindPopup(popupContent);
        });

        // Auto-fit map view based on markers
        ${focusTaskId ? `
        console.log('🎯 Focusing on task:', '${focusTaskId}');
        const focusMarker = offsetMarkers.find(m => m.id === '${focusTaskId}');
        if (focusMarker) {
          console.log('✅ Found focus marker:', focusMarker);
          
          // Find the corresponding leaflet marker and open its popup
          const leafletMarker = leafletMarkers.find(lm => lm.data.id === '${focusTaskId}');
          if (leafletMarker) {
            console.log('🎯 Opening popup for focus marker');
            map.setView([focusMarker.lat, focusMarker.lng], 16);
            
            // Open the popup after a short delay to ensure map is ready
            setTimeout(() => {
              leafletMarker.marker.openPopup();
            }, 500);
          } else {
            console.log('❌ Leaflet marker not found for focus task');
          }
        } else {
          console.log('❌ Focus marker not found for ID: ${focusTaskId}');
          // Still show all markers even if focus task not found
          if (offsetMarkers.length > 0) {
            if (offsetMarkers.length === 1) {
              map.setView([offsetMarkers[0].lat, offsetMarkers[0].lng], 12);
            } else {
              const group = new L.featureGroup(leafletMarkers.map(lm => lm.marker));
              map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 14 });
            }
          }
        }
        ` : `
        // Fit map to show all markers nicely - auto zoom to fit all points
        if (offsetMarkers.length > 0) {
          if (offsetMarkers.length === 1) {
            // Single marker: center on it with city-level zoom
            map.setView([offsetMarkers[0].lat, offsetMarkers[0].lng], 12);
          } else {
            // Multiple markers: auto-fit bounds to show all markers
            const group = new L.featureGroup(leafletMarkers.map(lm => lm.marker));
            map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 14 });
          }
        }
        // If no markers, keep default center/zoom from initialization (zoom 12)
        `}

        // Handle action buttons
        function handleAction(action, taskId) {
          console.log('Map action:', action, taskId);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: action,
              taskId: taskId
            }));
          }
        }

        console.log('🗺️ Map initialized with', markers.length, 'markers');
      </script>
    </body>
    </html>`;
  };

  return (
    <WebView
      style={styles.webView}
      source={{ html: generateMapHTML() }}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (onMapAction) {
            onMapAction(data.action, data.taskId);
          }
        } catch (error) {
          console.error('Error parsing map message:', error);
        }
      }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
