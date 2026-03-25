import type { WeatherTheme, CurrentConditions, HourlySlice } from '../types/weather';

// ─── WMO Weather Code Maps ────────────────────────────────────────────────────

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ heavy hail',
};

const WMO_ICONS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export function getWeatherDescription(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? 'Unknown';
}

export function getWeatherIcon(code: number): string {
  return WMO_ICONS[code] ?? '🌡️';
}

// ─── Theme Derivation ─────────────────────────────────────────────────────────

export function getWeatherTheme(code: number): WeatherTheme {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  return 'clear';
}

// ─── Wind Direction ───────────────────────────────────────────────────────────

export function getWindDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

// ─── Hourly Analysis Helpers ─────────────────────────────────────────────────

export function getRainHoursAfter(hourly: HourlySlice[], afterHour: number): number | null {
  for (let i = afterHour; i < hourly.length; i++) {
    if (hourly[i].precipitationProbability >= 50) {
      return i;
    }
  }
  return null;
}

/**
 * Finds the current-hour index within the hourly array.
 * Returns 0 if not found (safe fallback).
 */
export function getCurrentHourIndex(hourly: HourlySlice[]): number {
  const now = new Date();
  const currentHourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;
  const idx = hourly.findIndex(h => h.time.startsWith(currentHourStr));
  return idx >= 0 ? idx : 0;
}

// ─── Temperature Helpers ──────────────────────────────────────────────────────

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°`;
}

export function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  const hours = date.getHours();
  if (hours === 0) return '12 AM';
  if (hours === 12) return '12 PM';
  return hours > 12 ? `${hours - 12} PM` : `${hours} AM`;
}

// ─── Today's Plain-Language Narrative ────────────────────────────────────────

export function buildTodayNarrative(
  current: CurrentConditions,
  hourly: HourlySlice[],
  maxTemp: number,
  minTemp: number,
): string {
  const now = new Date();
  const currentHour = now.getHours();
  const tempRange = maxTemp - minTemp;

  // Morning / afternoon / evening slices from hourly
  const afternoon = hourly.find(h => new Date(h.time).getHours() === 15);
  const evening = hourly.find(h => new Date(h.time).getHours() === 20);

  const parts: string[] = [];

  // Opening temperature feel
  const tempDesc =
    current.temperature >= 80
      ? 'Hot'
      : current.temperature >= 70
        ? 'Warm'
        : current.temperature >= 55
          ? 'Mild'
          : current.temperature >= 40
            ? 'Cool'
            : 'Cold';

  parts.push(`${tempDesc} start to the day at ${formatTemp(current.temperature)}.`);

  // Afternoon outlook
  if (afternoon) {
    const afDesc =
      afternoon.temperature >= 80
        ? 'a hot afternoon'
        : afternoon.temperature >= 70
          ? 'a warm afternoon'
          : afternoon.temperature >= 55
            ? 'a mild afternoon'
            : 'a cool afternoon';
    parts.push(`Expecting ${afDesc} around ${formatTemp(afternoon.temperature)}.`);
  } else {
    parts.push(`High of ${formatTemp(maxTemp)} expected.`);
  }

  // Temp swing
  if (tempRange >= 15) {
    parts.push(`Temperatures will drop noticeably by evening — low near ${formatTemp(minTemp)}.`);
  }

  // Evening rain
  const rainHour = getRainHoursAfter(hourly, Math.max(0, currentHour - now.getHours() + 17));
  if (rainHour !== null && hourly[rainHour]) {
    const rainTime = formatHour(hourly[rainHour].time);
    parts.push(`Rain likely around ${rainTime} — ${hourly[rainHour].precipitationProbability}% chance.`);
  } else if (evening && evening.precipitationProbability >= 30) {
    parts.push(`Some chance of rain this evening (${evening.precipitationProbability}%).`);
  } else {
    parts.push('Staying dry through the evening.');
  }

  // Wind note
  if (current.windSpeed > 20) {
    parts.push(`Breezy conditions persist — winds ${Math.round(current.windSpeed)} mph.`);
  }

  return parts.join(' ');
}
