import React from 'react';
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
    coordinates: {} | { type: string; coordinates: [number, number] };
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
  const generateMapHTML = () => {
    console.log('🗺️ MapView Debug:', {
      totalTasks: tasks.length,
      tasksWithLocationData: tasks.filter(t => t.location).length,
      tasksWithCoordinatesData: tasks.filter(t => t.location?.coordinates).length,
      sampleTask: tasks[0] ? {
        id: tasks[0]._id,
        location: tasks[0].location,
        coordinates: tasks[0].location?.coordinates
      } : 'No tasks'
    });

    const tasksWithCoordinates = tasks.filter((task) => {
      const coords = task.location?.coordinates;
      const hasCoords = coords &&
        typeof coords === 'object' &&
        'coordinates' in coords &&
        Array.isArray(coords.coordinates) &&
        coords.coordinates.length === 2 &&
        !isNaN(coords.coordinates[0]) &&
        !isNaN(coords.coordinates[1]);
      
      if (!hasCoords && task.location?.coordinates) {
        console.log('🚫 Task filtered out:', {
          taskId: task._id,
          coordinates: task.location.coordinates
        });
      }
      
      return hasCoords;
    });

    const markers = tasksWithCoordinates.map((task) => {
      const coords = task.location.coordinates as {
        type: string;
        coordinates: [number, number];
      };
      return {
        id: task._id,
        lat: coords.coordinates[1],
        lng: coords.coordinates[0],
        title: task.title,
        price: task.formattedBudget || `${task.currency} ${task.budget}`,
        location: task.location.address,
        status: task.status,
        offers: task.offerCount || 0,
      };
    });

    console.log('🗺️ Map Markers Created:', {
      totalMarkers: markers.length,
      markers: markers.map(m => ({
        id: m.id,
        lat: m.lat,
        lng: m.lng,
        title: m.title
      }))
    });

    // If no real markers, add some demo markers for Australia to test the system
    if (markers.length === 0 && tasks.length > 0) {
      const demoCoordinates = [
        { lat: -33.8688, lng: 151.2093, city: 'Sydney' },
        { lat: -37.8136, lng: 144.9631, city: 'Melbourne' },
        { lat: -27.4698, lng: 153.0251, city: 'Brisbane' },
        { lat: -31.9505, lng: 115.8605, city: 'Perth' },
        { lat: -34.9285, lng: 138.6007, city: 'Adelaide' }
      ];
      
      tasks.slice(0, Math.min(5, tasks.length)).forEach((task, index) => {
        if (demoCoordinates[index]) {
          markers.push({
            id: task._id,
            lat: demoCoordinates[index].lat,
            lng: demoCoordinates[index].lng,
            title: task.title,
            price: task.formattedBudget || `${task.currency} ${task.budget}`,
            location: demoCoordinates[index].city + ', Australia',
            status: task.status,
            offers: task.offerCount || 0,
          });
        }
      });
      
      console.log('🗺️ Added demo markers for testing:', markers.length);
    }

    const focusedMarker = focusTaskId
      ? markers.find((m) => m.id === focusTaskId)
      : null;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Task Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        #map {
            height: 100vh;
            width: 100vw;
        }
        .custom-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .popup-price {
            font-weight: bold;
            color: #007bff;
            font-size: 16px;
            margin-bottom: 4px;
        }
        .popup-location {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        .popup-status {
            font-size: 12px;
            color: #333;
        }
        .marker-icon {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            position: relative;
        }
        .marker-icon::before {
            content: '$';
            transform: rotate(45deg);
            font-size: 16px;
            font-weight: bold;
        }
    .airtasker-marker {
      width: 50px !important;
      height: 50px !important;
    }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map', {
            minZoom: 6,
            maxZoom: 18,
            zoomControl: true
        }).setView([-25.2744, 133.7751], 6);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 18
        }).addTo(map);

        const markers = ${JSON.stringify(markers)};
        
        const markerIconUrl = ${JSON.stringify(iconUrl || '')};
        const customIcon = markerIconUrl
          ? L.icon({
              iconUrl: markerIconUrl,
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50],
              className: 'airtasker-marker'
            })
          : L.divIcon({
              html: '<div class="marker-icon"></div>',
              className: 'custom-div-icon',
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40]
            });
        
        const focusedTaskId = ${JSON.stringify(focusTaskId)};
        const focusedMarker = ${JSON.stringify(focusedMarker)};
        
        markers.forEach(marker => {
            const popupContent = \`
                <div class="custom-popup">
                    <div class="popup-title">\${marker.title}</div>
                    <div class="popup-price">\${marker.price}</div>
                    <div class="popup-location">\${marker.location}</div>
                    <div class="popup-status">\${marker.status} • \${marker.offers} offer\${marker.offers !== 1 ? 's' : ''}</div>
                </div>
            \`;
            
            const markerInstance = L.marker([marker.lat, marker.lng], { icon: customIcon })
                .bindPopup(popupContent)
                .addTo(map);
            
            if (focusedTaskId && marker.id === focusedTaskId) {
                markerInstance.openPopup();
            }
        });
        
        if (focusedMarker) {
            map.setView([focusedMarker.lat, focusedMarker.lng], 12);
        } else if (markers.length > 0) {
            if (markers.length === 1) {
                map.setView([markers[0].lat, markers[0].lng], 10);
            } else {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { 
                    padding: [20, 20],
                    maxZoom: 10  // Prevent zooming out too much
                });
            }
        }
    </script>
</body>
</html>
    `;
  };

  return (
    <WebView
      source={{ html: generateMapHTML() }}
      style={styles.webView}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
});
