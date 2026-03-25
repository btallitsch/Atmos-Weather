// ─── Core Weather Domain Types ────────────────────────────────────────────────

export interface GeoCoords {
  latitude: number;
  longitude: number;
}

export interface CurrentConditions {
  temperature: number;       // °F
  feelsLike: number;         // °F
  humidity: number;          // %
  windSpeed: number;         // mph
  windDirection: number;     // degrees
  precipitation: number;     // mm in last hour
  weatherCode: number;       // WMO weather code
  time: string;              // ISO datetime
}

export interface HourlySlice {
  time: string;              // ISO datetime
  temperature: number;       // °F
  precipitationProbability: number; // %
  weatherCode: number;
}

export interface DailySummary {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitationSum: number;          // mm
  precipitationProbabilityMax: number; // %
}

export interface WeatherData {
  current: CurrentConditions;
  hourly: HourlySlice[];     // next 12 hours from now
  daily: DailySummary;
  location: string;
  timezone: string;
}

// ─── Raw API Response Types (Open-Meteo) ──────────────────────────────────────

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

export interface NominatimResponse {
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export type TabId = 'now' | 'wear' | 'hourly' | 'today';

export interface TabDefinition {
  id: TabId;
  label: string;
  icon: string;
}

export type WeatherTheme = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog';

// ─── Clothing & Suggestion Types ──────────────────────────────────────────────

export interface ClothingSuggestion {
  icon: string;
  primary: string;
  detail: string;
}

export interface WearSuggestions {
  headline: string;
  items: ClothingSuggestion[];
}
