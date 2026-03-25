import { useState, useEffect } from 'react';
import type { WeatherData, GeoCoords } from '../types/weather';
import { fetchWeatherData } from '../services/weatherService';

interface WeatherState {
  data: WeatherData | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Fetches and caches weather data for given coordinates.
 * Re-fetches automatically when coords change or when refetch() is called.
 */
export function useWeather(coords: GeoCoords | null): WeatherState {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchWeatherData(coords)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to fetch weather data. Please try again.';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coords, tick]);

  const refetch = () => setTick((n) => n + 1);

  return { data, error, loading, refetch };
}
