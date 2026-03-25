import { useState } from 'react';
import type { TabId, TabDefinition } from './types/weather';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { getWeatherTheme } from './utils/weatherUtils';
import { TabBar } from './components/TabBar';
import { NowTab } from './components/NowTab';
import { WearTab } from './components/WearTab';
import { HourlyTab } from './components/HourlyTab';
import { TodayTab } from './components/TodayTab';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';

const TABS: TabDefinition[] = [
  { id: 'now', label: 'Now', icon: '🌡️' },
  { id: 'wear', label: 'Wear', icon: '👗' },
  { id: 'hourly', label: 'Hourly', icon: '⏱️' },
  { id: 'today', label: 'Today', icon: '📅' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('now');
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const { data, error: weatherError, loading: weatherLoading, refetch } = useWeather(coords);

  // ── Loading states ─────────────────────────────────────────────────────────
  if (geoLoading) return <LoadingScreen message="Locating you…" />;
  if (geoError) return <ErrorScreen message={geoError} />;
  if (weatherLoading) return <LoadingScreen message="Fetching conditions…" />;
  if (weatherError) return <ErrorScreen message={weatherError} onRetry={refetch} />;
  if (!data) return <LoadingScreen message="Loading…" />;

  // ── Theme derivation ───────────────────────────────────────────────────────
  const theme = getWeatherTheme(data.current.weatherCode);

  return (
    <div className={`app theme-${theme}`} data-tab={activeTab}>
      {/* Atmospheric background layer */}
      <div className="bg-atmosphere" aria-hidden="true">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
      </div>

      {/* App Shell */}
      <div className="app-shell">
        {/* Header */}
        <header className="app-header">
          <span className="app-logo">Atmos</span>
          <button
            className="refresh-btn"
            onClick={refetch}
            title="Refresh weather"
            aria-label="Refresh weather data"
          >
            ↻
          </button>
        </header>

        {/* Tab Navigation */}
        <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <main className="app-content">
          {activeTab === 'now' && <NowTab data={data} />}
          {activeTab === 'wear' && <WearTab data={data} />}
          {activeTab === 'hourly' && <HourlyTab data={data} />}
          {activeTab === 'today' && <TodayTab data={data} />}
        </main>
      </div>
    </div>
  );
}
