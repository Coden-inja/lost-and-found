import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAMPUS_ZONES, MAP_CENTER, DEFAULT_ZOOM } from '../data/zones';

// Custom DivIcons for clean rendering without missing image assets
const createCustomIcon = (color, text = '') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
        transform: translate(-50%, -50%);
      ">
        ${text}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      if (onSelectLocation) {
        // Find nearest zone or use coordinates
        const { lat, lng } = e.latlng;
        let closestZone = CAMPUS_ZONES[0];
        let minDistance = Infinity;

        CAMPUS_ZONES.forEach(zone => {
          const dist = Math.hypot(zone.lat - lat, zone.lng - lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestZone = zone;
          }
        });

        onSelectLocation({
          zone: closestZone.name,
          lat: closestZone.lat,
          lng: closestZone.lng
        });
      }
    }
  });
  return null;
}

export default function CampusMap({
  selectedZone = '',
  onSelectZone,
  reports = [],
  mode = 'display' // 'display' | 'select'
}) {
  // Aggregate report stats per zone for dashboard/browse mode
  const getZoneStats = (zoneName) => {
    const zoneReports = reports.filter(r => r.location_zone === zoneName);
    const lostCount = zoneReports.filter(r => r.report_type === 'lost' && r.status !== 'resolved').length;
    const foundCount = zoneReports.filter(r => r.report_type === 'found' && r.status !== 'resolved').length;
    const resolvedCount = zoneReports.filter(r => r.status === 'resolved').length;
    return { total: zoneReports.length, lostCount, foundCount, resolvedCount };
  };

  return (
    <div className="campus-map-wrapper" style={{ height: '360px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'select' && (
          <MapClickHandler
            onSelectLocation={({ zone, lat, lng }) => {
              if (onSelectZone) onSelectZone(zone, lat, lng);
            }}
          />
        )}

        {CAMPUS_ZONES.map(zone => {
          const isSelected = selectedZone === zone.name;
          const stats = getZoneStats(zone.name);

          // Determine marker pin color
          let pinColor = '#3b82f6'; // default blue
          let badgeText = '';

          if (mode === 'select') {
            pinColor = isSelected ? '#a855f7' : '#64748b'; // purple if selected, slate if not
          } else {
            if (stats.lostCount > 0) pinColor = '#ef4444'; // red for pending lost
            else if (stats.foundCount > 0) pinColor = '#10b981'; // green for pending found
            else if (stats.resolvedCount > 0) pinColor = '#3b82f6'; // blue for resolved
            badgeText = stats.total > 0 ? stats.total.toString() : '';
          }

          return (
            <Marker
              key={zone.name}
              position={[zone.lat, zone.lng]}
              icon={createCustomIcon(pinColor, badgeText)}
              eventHandlers={{
                click: () => {
                  if (onSelectZone) onSelectZone(zone.name, zone.lat, zone.lng);
                }
              }}
            >
              <Popup>
                <div style={{ color: '#0f172a', fontFamily: 'sans-serif' }}>
                  <strong style={{ fontSize: '14px' }}>{zone.name}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Campus Zone (HIT Kolkata)</p>
                  {mode === 'display' && (
                    <div style={{ marginTop: '6px', fontSize: '11px', lineHeight: '1.4' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Lost: {stats.lostCount}</span> | {' '}
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Found: {stats.foundCount}</span> | {' '}
                      <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Resolved: {stats.resolvedCount}</span>
                    </div>
                  )}
                  {mode === 'select' && (
                    <button
                      onClick={() => onSelectZone && onSelectZone(zone.name, zone.lat, zone.lng)}
                      style={{
                        marginTop: '8px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Select this zone
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
