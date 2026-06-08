import {useEffect, useRef} from 'react';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

const STATUS_LABEL = {
  idle: 'Idle',
  cleaning: 'Cleaning',
  charging: 'Charging',
  error: 'Error',
};

const MARKER_COLOR = {
  idle: '#94a3b8',
  cleaning: '#4ade80',
  charging: '#facc15',
  error: '#f87171',
};

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();
    resize();
    const timer = setTimeout(resize, 200);
    window.addEventListener('resize', resize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [map]);

  return null;
}

function FitFleetBounds({robots}) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || robots.length === 0) return;

    const bounds = L.latLngBounds(robots.map(r => [r.lat, r.lng]));
    map.fitBounds(bounds.pad(0.15));
    hasFitted.current = true;
  }, [map, robots]);

  return null;
}

export default function FleetMap({robots, selectedId, onSelect, countryNames}) {
  return (
    <div className="fleet-map-wrapper">
      <MapContainer
        center={[50.5, 10]}
        zoom={4}
        minZoom={3}
        scrollWheelZoom
        style={{height: '100%', width: '100%'}}>
        <MapResizer />
        <FitFleetBounds robots={robots} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {robots.map(r => (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={selectedId === r.id ? 11 : 7}
            pathOptions={{
              color: MARKER_COLOR[r.status] || MARKER_COLOR.idle,
              fillColor: MARKER_COLOR[r.status] || MARKER_COLOR.idle,
              fillOpacity: 0.9,
              weight: selectedId === r.id ? 3 : 2,
            }}
            eventHandlers={{click: () => onSelect(r.id)}}>
            <Popup>
              <b>{r.id}</b>
              <br />
              {countryNames[r.country] || r.country} · {r.site}
              <br />
              Status: {STATUS_LABEL[r.status] || r.status}
              <br />
              Battery: {Math.round(r.battery)}%
              <br />
              Water: {Math.round(r.water_level)}%
              <br />
              Panels cleaned: {r.panels_cleaned}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
