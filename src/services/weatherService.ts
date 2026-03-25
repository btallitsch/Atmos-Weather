import type {
  GeoCoords,
  WeatherData,
  OpenMeteoResponse,
  NominatimResponse,
  HourlySlice,
} from '../types/weather';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';

// ─── Fetch & Transform ────────────────────────────────────────────────────────

export async function fetchWeatherData(coords: GeoCoords): Promise<WeatherData> {
  const [weatherResponse, locationName] = await Promise.all([
    fetchOpenMeteo(coords),
    fetchLocationName(coords),
  ]);

  return transformToWeatherData(weatherResponse, locationName);
}

async function fetchOpenMeteo(coords: GeoCoords): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    hourly: ['temperature_2m', 'precipitation_probability', 'weather_code'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '2',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<OpenMeteoResponse>;
}

async function fetchLocationName(coords: GeoCoords): Promise<string> {
  try {
    const params = new URLSearchParams({
      lat: String(coords.latitude),
      lon: String(coords.longitude),
      format: 'json',
    });

    const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!response.ok) return 'Your Location';

    const data = (await response.json()) as NominatimResponse;
    const { city, town, village, county, state } = data.address ?? {};
    const place = city ?? town ?? village ?? county ?? '';
    return place && state ? `${place}, ${state}` : place || state || 'Your Location';
  } catch {
    return 'Your Location';
  }
}

// ─── Data Transformation ──────────────────────────────────────────────────────

function transformToWeatherData(raw: OpenMeteoResponse, location: string): WeatherData {
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().slice(0, 10);

  // Find the current-hour index in the hourly array
  const hourlyStartIdx = raw.hourly.time.findIndex(t => {
    const d = new Date(t);
    return (
      d.toISOString().slice(0, 10) === todayStr && d.getHours() === currentHour
    );
  });

  const startIdx = hourlyStartIdx >= 0 ? hourlyStartIdx : 0;

  // Build next-12-hour slices
  const hourlySlices: HourlySlice[] = raw.hourly.time
    .slice(startIdx, startIdx + 13)
    .map((time, i) => ({
      time,
      temperature: raw.hourly.temperature_2m[startIdx + i],
      precipitationProbability: raw.hourly.precipitation_probability[startIdx + i] ?? 0,
      weatherCode: raw.hourly.weather_code[startIdx + i],
    }));

  // Daily is index 0 = today
  const daily = {
    date: raw.daily.time[0],
    weatherCode: raw.daily.weather_code[0],
    maxTemp: raw.daily.temperature_2m_max[0],
    minTemp: raw.daily.temperature_2m_min[0],
    precipitationSum: raw.daily.precipitation_sum[0],
    precipitationProbabilityMax: raw.daily.precipitation_probability_max[0],
  };

  return {
    current: {
      temperature: raw.current.temperature_2m,
      feelsLike: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      windDirection: raw.current.wind_direction_10m,
      precipitation: raw.current.precipitation,
      weatherCode: raw.current.weather_code,
      time: raw.current.time,
    },
    hourly: hourlySlices,
    daily,
    location,
    timezone: raw.timezone,
  };
}
