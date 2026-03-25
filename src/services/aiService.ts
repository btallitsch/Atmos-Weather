import type { WeatherData } from '../types/weather';
import { getWeatherDescription } from '../utils/weatherUtils';

// ─── AI Summary Service ───────────────────────────────────────────────────────
//
// Uses the Anthropic API to generate concise, human-feeling weather summaries.
// Falls back to local rule-based summaries if the key is absent or the call
// fails — so the app always shows *something* useful.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export type SummaryType = 'now' | 'today';

interface AISummaryResult {
  summary: string;
  fromAI: boolean;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function generateWeatherSummary(
  data: WeatherData,
  type: SummaryType,
): Promise<AISummaryResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return { summary: getFallbackSummary(data, type), fromAI: false };
  }

  try {
    const prompt = buildPrompt(data, type);
    const summary = await callAnthropicAPI(prompt, apiKey);
    return { summary, fromAI: true };
  } catch (err) {
    console.warn('AI summary failed, using fallback:', err);
    return { summary: getFallbackSummary(data, type), fromAI: false };
  }
}

// ─── Anthropic API Call ───────────────────────────────────────────────────────

async function callAnthropicAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text ?? '';
  return text.trim();
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(data: WeatherData, type: SummaryType): string {
  const { current, daily, hourly } = data;
  const conditions = getWeatherDescription(current.weatherCode);

  const weatherContext = [
    `Current conditions: ${conditions}`,
    `Temperature: ${Math.round(current.temperature)}°F, feels like ${Math.round(current.feelsLike)}°F`,
    `Wind: ${Math.round(current.windSpeed)} mph`,
    `Humidity: ${current.humidity}%`,
    `Today's high: ${Math.round(daily.maxTemp)}°F, low: ${Math.round(daily.minTemp)}°F`,
    `Rain chance today: ${daily.precipitationProbabilityMax}%`,
  ].join('\n');

  if (type === 'now') {
    return `You are a friendly, concise weather assistant. Given the following weather data, write a single punchy sentence (max 12 words) that captures the current vibe — like "Perfect morning for a run" or "Rain likely this afternoon, stay close to home." Be natural and helpful.\n\n${weatherContext}\n\nRespond with ONLY the one-line summary. No quotes, no punctuation at the end unless it's a period.`;
  }

  // Build hourly narrative context for "today" summary
  const hourlyContext = hourly
    .slice(0, 12)
    .map(h => `${new Date(h.time).getHours()}:00 — ${Math.round(h.temperature)}°F, ${h.precipitationProbability}% rain`)
    .join('\n');

  return `You are a friendly weather assistant. Given this weather data, write 2–3 short, natural sentences summarizing the day in plain language — like a friend texting you about the weather. Mention temperature trends, rain timing if relevant, and one actionable tip. Keep it under 60 words.\n\n${weatherContext}\n\nHourly breakdown:\n${hourlyContext}\n\nRespond with ONLY the summary. No headers, no quotes.`;
}

// ─── Fallback Rule-Based Summaries ───────────────────────────────────────────

function getFallbackSummary(data: WeatherData, type: SummaryType): string {
  const { current, daily } = data;
  const temp = Math.round(current.temperature);
  const feelsLike = Math.round(current.feelsLike);
  const rainChance = daily.precipitationProbabilityMax;
  const code = current.weatherCode;

  if (type === 'now') {
    if (code >= 95) return 'Thunderstorm conditions — stay indoors.';
    if (code >= 71 && code <= 77) return 'Snowing out — roads may be slick.';
    if (code >= 61 && code <= 65) return `Rainy and ${temp < 50 ? 'cold' : 'mild'} — grab an umbrella.`;
    if (code >= 51 && code <= 55) return 'Light drizzle — a light rain jacket will do.';
    if (rainChance >= 70) return 'Rain likely today — keep an umbrella handy.';
    if (temp >= 85) return 'Hot out — stay hydrated and seek shade.';
    if (temp >= 72 && code <= 3) return 'Beautiful weather — great day to be outside.';
    if (feelsLike <= 30) return 'Bitterly cold — dress in full winter layers.';
    if (feelsLike <= 45) return 'Cold and crisp — a heavy jacket is a must.';
    if (code === 2 || code === 3) return 'Cloudy but dry — comfortable conditions.';
    return 'Mild and pleasant conditions today.';
  }

  // Today summary fallback
  const parts: string[] = [];
  const high = Math.round(daily.maxTemp);
  const low = Math.round(daily.minTemp);

  if (code >= 95) {
    parts.push(`Stormy day ahead with a high of ${high}°F.`);
  } else if (code >= 61) {
    parts.push(`Rainy day — high of ${high}°F, low of ${low}°F.`);
  } else if (high >= 80) {
    parts.push(`Hot today with a high of ${high}°F.`);
  } else {
    parts.push(`High of ${high}°F, low of ${low}°F.`);
  }

  if (rainChance >= 60) {
    parts.push(`${rainChance}% chance of rain — take an umbrella.`);
  } else if (rainChance >= 30) {
    parts.push(`Slight rain chance (${rainChance}%) — mostly dry.`);
  } else {
    parts.push('Staying dry throughout the day.');
  }

  return parts.join(' ');
}
