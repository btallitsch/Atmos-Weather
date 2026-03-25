import type { WearSuggestions, ClothingSuggestion, CurrentConditions } from '../types/weather';

// ─── Clothing Logic ────────────────────────────────────────────────────────────

/**
 * Derives practical wear suggestions from current weather conditions.
 * Uses temperature (°F), wind speed (mph), and precipitation data.
 */
export function getWearSuggestions(
  current: CurrentConditions,
  precipitationProbabilityMax: number,
): WearSuggestions {
  const { temperature: temp, feelsLike, windSpeed, weatherCode } = current;
  const items: ClothingSuggestion[] = [];

  const isRaining = weatherCode >= 51 && weatherCode <= 82;
  const isSnowing = (weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86;
  const isStorming = weatherCode >= 95;
  const isWindy = windSpeed > 15;

  // ── Layer / Core Clothing ──────────────────────────────────────────────────
  if (feelsLike >= 80) {
    items.push({
      icon: '👕',
      primary: 'Light tee or tank',
      detail: `Feels like ${Math.round(feelsLike)}° — minimal layers needed`,
    });
  } else if (feelsLike >= 68) {
    items.push({
      icon: '👕',
      primary: 'Short sleeves or a light shirt',
      detail: 'Comfortable and breathable weather',
    });
  } else if (feelsLike >= 55) {
    items.push({
      icon: '🧥',
      primary: 'Light jacket or long sleeves',
      detail: 'A layer you can tie around your waist works well',
    });
  } else if (feelsLike >= 40) {
    items.push({
      icon: '🧥',
      primary: 'Medium jacket recommended',
      detail: `${Math.round(feelsLike)}° is chilly — don't leave without a layer`,
    });
  } else if (feelsLike >= 25) {
    items.push({
      icon: '🧥',
      primary: 'Heavy coat essential',
      detail: `Feels like ${Math.round(feelsLike)}° — bundle up`,
    });
  } else {
    items.push({
      icon: '🧥',
      primary: 'Full winter gear',
      detail: `Extreme cold at ${Math.round(feelsLike)}° — insulate every layer`,
    });
  }

  // ── Bottom Half ────────────────────────────────────────────────────────────
  if (temp >= 72) {
    items.push({
      icon: '🩳',
      primary: 'Shorts weather',
      detail: 'Good shorts weather — keep it cool',
    });
  } else if (temp >= 55) {
    items.push({
      icon: '👖',
      primary: 'Jeans or light pants',
      detail: 'Could go either way — pants are a safe bet',
    });
  } else {
    items.push({
      icon: '👖',
      primary: 'Long pants or thermal layer',
      detail: 'Keep your legs warm today',
    });
  }

  // ── Rain Gear ──────────────────────────────────────────────────────────────
  if (isStorming) {
    items.push({
      icon: '⛈️',
      primary: 'Waterproof jacket — stay inside if you can',
      detail: `Thunderstorm conditions — umbrella may not be enough`,
    });
  } else if (isRaining) {
    items.push({
      icon: '☂️',
      primary: 'Umbrella advised',
      detail: 'Active rain — waterproof shoes are a plus',
    });
  } else if (precipitationProbabilityMax >= 50) {
    items.push({
      icon: '☂️',
      primary: 'Pack an umbrella',
      detail: `${precipitationProbabilityMax}% chance of rain today`,
    });
  } else if (precipitationProbabilityMax >= 25) {
    items.push({
      icon: '🌂',
      primary: 'Umbrella optional',
      detail: `Low rain chance (${precipitationProbabilityMax}%) — up to you`,
    });
  }

  // ── Snow Gear ─────────────────────────────────────────────────────────────
  if (isSnowing) {
    items.push({
      icon: '🥾',
      primary: 'Waterproof boots',
      detail: 'Snow on the ground — grip and dry feet matter',
    });
    items.push({
      icon: '🧤',
      primary: 'Gloves and a hat',
      detail: 'Protect your extremities in freezing conditions',
    });
  }

  // ── Wind Gear ─────────────────────────────────────────────────────────────
  if (isWindy && feelsLike < 65) {
    items.push({
      icon: '💨',
      primary: 'Windproof outer layer',
      detail: `${Math.round(windSpeed)} mph winds — a shell makes a big difference`,
    });
  }

  // ── Accessories ───────────────────────────────────────────────────────────
  if (temp >= 75 && weatherCode <= 3) {
    items.push({
      icon: '🕶️',
      primary: 'Sunglasses recommended',
      detail: 'Clear skies and strong sun today',
    });
  }
  if (temp >= 80) {
    items.push({
      icon: '🧴',
      primary: 'Apply sunscreen',
      detail: 'Hot and sunny — protect your skin',
    });
  }
  if (feelsLike <= 32) {
    items.push({
      icon: '🧣',
      primary: 'Scarf and gloves',
      detail: 'Freezing conditions — cover up',
    });
  }

  // ── Headline ──────────────────────────────────────────────────────────────
  const headline = buildWearHeadline(temp, feelsLike, isRaining, isSnowing, isStorming);

  return { headline, items };
}

function buildWearHeadline(
  temp: number,
  feelsLike: number,
  isRaining: boolean,
  isSnowing: boolean,
  isStorming: boolean,
): string {
  if (isStorming) return 'Stay inside if you can';
  if (isSnowing) return 'Bundle up — it\'s snowing';
  if (isRaining) return 'Grab an umbrella';
  if (feelsLike >= 80) return 'Great shorts weather';
  if (feelsLike >= 68) return 'Light layers only';
  if (feelsLike >= 55) return 'Light jacket recommended';
  if (feelsLike >= 40) return 'Jacket required';
  if (temp <= 32) return 'Full winter gear needed';
  return 'Layer up today';
}
