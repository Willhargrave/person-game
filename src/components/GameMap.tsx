import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import { useEffect, useMemo } from 'react';
import type { HistoricalPerson } from '../types';
import type { LocalizedPerson, UiCopy } from '../i18n';
import {
  getRoutePointAtProgress,
  roundIntroOverviewDurationMs,
  roundIntroRouteDurationMs,
  type RoundIntroStage,
} from '../utils/roundIntro';

interface GameMapProps {
  person: HistoricalPerson;
  localizedPerson: LocalizedPerson;
  labels: Pick<UiCopy, 'birthplace' | 'deathPlace' | 'bornIn' | 'diedIn'>;
  introStage?: RoundIntroStage;
  deathCause?: string;
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

interface MapFocusProps {
  person: HistoricalPerson;
  introStage?: RoundIntroStage;
}

function MapFocus({ person, introStage = 'ready' }: MapFocusProps) {
  const map = useMap();

  useEffect(() => {
    const birthLocation = L.latLng(person.birthCoordinates.lat, person.birthCoordinates.lng);
    const deathLocation = L.latLng(person.deathCoordinates.lat, person.deathCoordinates.lng);
    const bounds = L.latLngBounds([
      birthLocation,
      deathLocation,
    ]);

    if (introStage === 'birth') {
      map.flyTo(birthLocation, 5, { animate: true, duration: 1 });
      return;
    }

    if (introStage === 'route') {
      let animationFrameId: number | null = null;
      let animationStart: number | null = null;
      map.stop();
      map.setView(birthLocation, 5, { animate: false });

      const animateRoute = (timestamp: number) => {
        animationStart ??= timestamp;
        const progress = (timestamp - animationStart) / roundIntroRouteDurationMs;
        const nextPoint = getRoutePointAtProgress(birthLocation, deathLocation, progress);

        map.setView(L.latLng(nextPoint.lat, nextPoint.lng), 5, { animate: false });

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(animateRoute);
        }
      };

      animationFrameId = window.requestAnimationFrame(animateRoute);

      return () => {
        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
        }
      };
    }

    if (introStage === 'death') {
      map.flyTo(deathLocation, 5, { animate: true, duration: 0.6 });
      return;
    }

    if (introStage === 'overview') {
      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.9), {
          animate: true,
          duration: roundIntroOverviewDurationMs / 1000,
          maxZoom: 4,
        });
      }
      return;
    }
  }, [introStage, map, person]);

  return null;
}

export function GameMap({
  person,
  localizedPerson,
  labels,
  introStage = 'ready',
  deathCause,
}: GameMapProps) {
  const route = useMemo(
    () => [
      [person.birthCoordinates.lat, person.birthCoordinates.lng] as [number, number],
      [person.deathCoordinates.lat, person.deathCoordinates.lng] as [number, number],
    ],
    [person],
  );
  const showRoute =
    introStage === 'route' ||
    introStage === 'death' ||
    introStage === 'overview' ||
    introStage === 'settle' ||
    introStage === 'ready';
  const showDeath =
    introStage === 'death' ||
    introStage === 'overview' ||
    introStage === 'settle' ||
    introStage === 'ready';

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
      {showRoute ? (
        <Polyline
          className={`intro-route ${introStage === 'route' ? 'drawing' : ''}`}
          positions={route}
          pathOptions={{
            color: '#4b4030',
            weight: 2,
            opacity: 0.55,
            dashArray: '6 8',
            lineCap: 'round',
          }}
        />
      ) : null}
      <Marker position={route[0]} icon={birthIcon}>
        <Tooltip
          direction="top"
          offset={[0, -12]}
          opacity={1}
          permanent={introStage === 'birth'}
          className={introStage === 'birth' ? 'round-location-tooltip round-detail-tooltip' : undefined}
        >
          {introStage === 'birth' ? (
            <span className="round-tooltip-content">
              {labels
                .bornIn(localizedPerson.birthPlace, localizedPerson.birthDate)
                .split('\n')
                .map((line) => (
                  <span key={line}>{line}</span>
                ))}
            </span>
          ) : (
            labels.birthplace
          )}
        </Tooltip>
      </Marker>
      {showDeath ? (
        <Marker position={route[1]} icon={deathIcon}>
          <Tooltip
            direction="top"
            offset={[0, -12]}
            opacity={1}
            permanent={
              introStage === 'death' || introStage === 'overview' || introStage === 'settle'
            }
            className={
              introStage === 'death' || introStage === 'overview' || introStage === 'settle'
                ? `round-location-tooltip round-detail-tooltip ${deathCause ? 'round-death-tooltip' : ''}`
                : undefined
            }
          >
            {introStage === 'death' || introStage === 'overview' || introStage === 'settle' ? (
              <span className="round-tooltip-content">
                {labels
                  .diedIn(localizedPerson.deathPlace, localizedPerson.deathDate, deathCause)
                  .split('\n')
                  .map((line) => (
                    <span key={line}>{line}</span>
                  ))}
              </span>
            ) : (
              labels.deathPlace
            )}
          </Tooltip>
        </Marker>
      ) : null}
      <MapFocus person={person} introStage={introStage} />
    </MapContainer>
  );
}
