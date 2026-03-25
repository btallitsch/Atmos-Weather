import { useState, useEffect } from 'react';
import type { GeoCoords } from '../types/weather';

interface GeolocationState {
  coords: GeoCoords | null;
  error: string | null;
  loading: boolean;
}

/**
 * Requests the browser's Geolocation API and resolves coordinates once.
 * Returns a stable object — does not re-request on re-render.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, error: 'Geolocation is not supported by your browser.', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access was denied. Please allow location access and refresh.',
          2: 'Location unavailable. Please check your connection.',
          3: 'Location request timed out. Please try again.',
        };
        setState({
          coords: null,
          error: messages[err.code] ?? 'Could not determine your location.',
          loading: false,
        });
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return state;
}
