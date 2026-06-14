import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { HistoricalPerson } from '../types';

interface GameMapProps {
  person: HistoricalPerson;
}

const worldBounds: LatLngBoundsExpression = [
  [-75, -180],
  [85, 180],
];

const birthIcon = L.divIcon({
  className: 'sketch-marker birth-marker',
  html: '<span>👶</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const deathIcon = L.divIcon({
  className: 'sketch-marker death-marker',
  html: '<span>💀</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function MapFocus({ person }: GameMapProps) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [person.birthCoordinates.lat, person.birthCoordinates.lng],
      [person.deathCoordinates.lat, person.deathCoordinates.lng],
    ]);

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.9), { animate: true, maxZoom: 4 });
    }
  }, [map, person]);

  return null;
}

export function GameMap({ person }: GameMapProps) {
  const route = useMemo(
    () => [
      [person.birthCoordinates.lat, person.birthCoordinates.lng] as [number, number],
      [person.deathCoordinates.lat, person.deathCoordinates.lng] as [number, number],
    ],
    [person],
  );

  return (
    <MapContainer
      className="game-map"
      center={[22, 0]}
      zoom={3}
      minZoom={3}
      maxZoom={6}
      maxBounds={worldBounds}
      maxBoundsViscosity={1}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        className="sketch-tile-layer"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        noWrap
        bounds={worldBounds}
      />
      <Polyline
        positions={route}
        pathOptions={{
          color: '#4b4030',
          weight: 2,
          opacity: 0.55,
          dashArray: '6 8',
          lineCap: 'round',
        }}
      />
      <Marker position={route[0]} icon={birthIcon}>
        <Tooltip direction="top" offset={[0, -12]} opacity={1}>
          Birthplace
        </Tooltip>
      </Marker>
      <Marker position={route[1]} icon={deathIcon}>
        <Tooltip direction="top" offset={[0, -12]} opacity={1}>
          Death place
        </Tooltip>
      </Marker>
      <MapFocus person={person} />
    </MapContainer>
  );
}
