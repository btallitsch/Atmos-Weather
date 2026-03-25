# 🌤️ Atmos — Weather App

A polished, tab-based weather app built with **React + TypeScript + Vite**. Uses the free [Open-Meteo API](https://open-meteo.com/) for live weather data and the **Anthropic API** for AI-powered natural language summaries.

---

## Features

| Tab | What it shows |
|-----|---------------|
| **Now** | Current temperature, feels-like, wind, humidity, and an AI-generated one-liner |
| **Wear** | Practical clothing suggestions derived from temp, wind & precipitation |
| **Hourly** | 12-hour forecast with icons, temperature bars, and rain probability |
| **Today** | Day-at-a-glance timeline, high/low, and an AI narrative summary |

- 📍 Auto-detects your location via the browser Geolocation API
- 🤖 AI summaries powered by Claude (graceful fallback if no key provided)
- 🎨 Dynamic weather themes (clear, cloudy, rain, snow, storm, fog)
- 📱 Fully responsive — swipe-friendly on mobile, nav on desktop
- ♿ Accessible tab markup with `role="tab"` and `aria-selected`

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key (optional)

```bash
cp .env.example .env
# Edit .env and add your key
```

> **Note:** AI summaries are entirely optional — the app works fully without them, falling back to smart rule-based summaries.

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
├── types/
│   └── weather.ts          # All TypeScript types and interfaces
├── services/
│   ├── weatherService.ts   # Open-Meteo API fetching & transformation
│   └── aiService.ts        # Anthropic API integration + fallback logic
├── hooks/
│   ├── useGeolocation.ts   # Browser geolocation hook
│   └── useWeather.ts       # Weather data fetching hook
├── utils/
│   ├── weatherUtils.ts     # WMO codes, formatting, narrative helpers
│   └── clothingUtils.ts    # Clothing suggestion logic
├── components/
│   ├── TabBar.tsx           # Navigation tab bar
│   ├── NowTab.tsx           # Current conditions panel
│   ├── WearTab.tsx          # Clothing suggestions panel
│   ├── HourlyTab.tsx        # Hourly forecast panel
│   ├── TodayTab.tsx         # Day summary panel
│   ├── LoadingScreen.tsx    # Loading state
│   └── ErrorScreen.tsx      # Error + retry state
├── styles/
│   └── index.css            # Full design system (CSS variables, themes)
├── App.tsx                  # Root component — routing, theme, shell
└── main.tsx                 # Entry point
```

---

## Tech Stack

- **React 18** + **TypeScript** — strict mode
- **Vite** — fast dev server and build tool
- **Open-Meteo** — free, no-key weather API
- **Nominatim** — free reverse geocoding
- **Anthropic Claude API** — AI summaries (optional)

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add `VITE_ANTHROPIC_API_KEY` to your Vercel environment variables
4. Deploy — no other config needed

> ⚠️ **Production note:** For a public app, proxy your Anthropic API calls through a backend route (e.g., a Vercel Edge Function) to avoid exposing your key in the browser bundle.
