import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TransportOption, Stop } from '../../types';

interface LeafletMapProps {
  transport: TransportOption;
}

export function LeafletMap({ transport }: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Extract stops from the transport option
    const stops = Array.isArray(transport.stops) ? transport.stops : [];
    
    if (stops.length === 0) {
      return;
    }

    // Initialize the map
    map.current = L.map(mapContainer.current).setView([51.505, -0.09], 10);

    // Add tile layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map.current);

    // Create color based on transport mode
    const modeColors = {
      train: '#45B7D1',
      bus: '#4ECDC4',
      coach: '#FF6B35',
      taxi: '#FFD93D',
      underground: '#96CEB4'
    };

    const color = modeColors[transport.mode as keyof typeof modeColors] || '#45B7D1';

    // Add markers for each stop
    const coordinates: [number, number][] = [];
    const branchStops: Record<string, Stop[]> = {};
    const mainLineStops: Stop[] = [];

    // Organize stops by branch
    stops.forEach((stop: Stop) => {
      coordinates.push([stop.lat, stop.lon]);
      
      if (stop.branch_id) {
        if (!branchStops[stop.branch_id]) {
          branchStops[stop.branch_id] = [];
        }
        const branch = branchStops[stop.branch_id];
        if (branch) {
          branch.push(stop);
        }
      } else {
        mainLineStops.push(stop);
      }
    });

    // Add markers for each stop
    stops.forEach((stop: Stop, index: number) => {
      // Determine if this stop is the start of a branch or the overall start
      let isStartPoint = index === 0;
      let isEndPoint = index === stops.length - 1;
      
      // Check if this is the first stop in its branch
      if (stop.branch_id) {
        const branch = branchStops[stop.branch_id];
        if (branch && branch.length > 0 && branch[0] === stop) {
          isStartPoint = true;
        }
        // Check if this is the last stop in its branch
        if (branch && branch.length > 0 && branch[branch.length - 1] === stop) {
          isEndPoint = true;
        }
      }
      
      let markerHtml = `
        <div style="
          background-color: ${color};
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 3px white solid;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          font-size: 14px;
        ">
          ${isStartPoint ? '▸' : isEndPoint ? '◆' : '●'}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'leaflet-custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.lat, stop.lon], { icon: customIcon }).addTo(map.current!);

      // Create popup with stop information
      const priceInfo = stop.prices && stop.prices.length > 0 
        ? `<br><strong>Price:</strong> ${stop.currency} ${stop.prices[0]?.amount || ''}`
        : '';
      
      const popupContent = `
        <div style="font-family: Arial, sans-serif; min-width: 150px;">
          <strong style="font-size: 14px;">${stop.stop_name}</strong>
          <br/>
          <small style="color: #666;">
            ${stop.lat.toFixed(4)}, ${stop.lon.toFixed(4)}
          </small>
          ${priceInfo}
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Draw polylines only between consecutive stops with the same branch_id
    for (let i = 0; i < stops.length - 1; i++) {
      const currentStop = stops[i];
      const nextStop = stops[i + 1];

      if (!currentStop || !nextStop) continue;

      // Only draw a line if both stops have the same branch_id (including both null)
      if (currentStop.branch_id === nextStop.branch_id) {
        L.polyline(
          [[currentStop.lat, currentStop.lon], [nextStop.lat, nextStop.lon]],
          {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: transport.mode === 'train' ? '' : '5, 5'
          }
        ).addTo(map.current!);
      }
    }

    // Draw connecting lines from branch endpoints to the first convergence point (where branch_id becomes null)
    for (let i = 0; i < stops.length - 1; i++) {
      const currentStop = stops[i];
      const nextStop = stops[i + 1];

      if (!currentStop || !nextStop) continue;

      // When branch_id changes from a value to null, draw a connecting line
      if (currentStop.branch_id && currentStop.branch_id !== nextStop.branch_id && !nextStop.branch_id) {
        L.polyline(
          [[currentStop.lat, currentStop.lon], [nextStop.lat, nextStop.lon]],
          {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: transport.mode === 'train' ? '' : '5, 5'
          }
        ).addTo(map.current!);
      }
    }

    // If there are branch endpoints that connect to main line, draw connecting lines
    const mainLineStart = mainLineStops.length > 0 ? mainLineStops[0] : null;

    Object.values(branchStops).forEach((branchStopList) => {
      if (branchStopList.length > 0 && mainLineStart) {
        const lastBranchStop = branchStopList[branchStopList.length - 1];
        if (lastBranchStop && mainLineStart) {
          // Draw a line from the branch endpoint to the first stop of the main line
          L.polyline([[lastBranchStop.lat, lastBranchStop.lon], [mainLineStart.lat, mainLineStart.lon]], {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: transport.mode === 'train' ? '' : '5, 5'
          }).addTo(map.current!);
        }
      }
    });

    // Fit map to all markers
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup is handled by React
    };
  }, [transport]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
