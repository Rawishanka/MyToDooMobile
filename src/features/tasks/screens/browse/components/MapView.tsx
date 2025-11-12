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
    const tasksWithCoordinates = tasks.filter((task) => {
      const coords = task.location.coordinates;
      return (
        coords &&
        typeof coords === 'object' &&
        'coordinates' in coords &&
        Array.isArray(coords.coordinates) &&
        coords.coordinates.length === 2
      );
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
            background-color: #007bff;
            border: 2px solid white;
            border-radius: 50%;
      width: 60px;
      height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
    .my-custom-marker {
      width: 60px !important;
      height: 60px !important;
    }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([-25.2744, 133.7751], 4);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20
        }).addTo(map);

        const markers = ${JSON.stringify(markers)};
        
        const markerIconUrl = ${JSON.stringify(iconUrl || '')};
        const customIcon = markerIconUrl
          ? L.icon({
              iconUrl: markerIconUrl,
              iconSize: [60, 60],
              iconAnchor: [30, 60],
              popupAnchor: [0, -60],
              className: 'my-custom-marker'
            })
          : L.divIcon({
              html: '<div class="marker-icon"></div>',
              className: 'custom-div-icon',
              iconSize: [60, 60],
              iconAnchor: [30, 60],
              popupAnchor: [0, -60]
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
            map.setView([focusedMarker.lat, focusedMarker.lng], 14);
        } else if (markers.length > 0) {
            const group = new L.featureGroup(map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    return layer;
                }
            }));
            
            if (markers.length === 1) {
                map.setView([markers[0].lat, markers[0].lng], 12);
            } else {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [20, 20] });
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
