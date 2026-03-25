import { useState, useEffect } from 'react';
import type { WeatherData } from '../types/weather';
import { generateWeatherSummary } from '../services/aiService';
import { getWeatherDescription, getWeatherIcon, getWindDirectionLabel, formatTemp } from '../utils/weatherUtils';

interface NowTabProps {
  data: WeatherData;
}

export function NowTab({ data }: NowTabProps) {
  const { current, daily, location } = data;
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [fromAI, setFromAI] = useState(false);

  useEffect(() => {
    setSummaryLoading(true);
    generateWeatherSummary(data, 'now').then(({ summary: s, fromAI: ai }) => {
      setSummary(s);
      setFromAI(ai);
      setSummaryLoading(false);
    });
  }, [data]);

  const windLabel = getWindDirectionLabel(current.windDirection);

  return (
    <div className="tab-panel fade-in" id="panel-now" role="tabpanel">
      {/* Location */}
      <div className="location-row">
        <span className="location-pin">📍</span>
        <span className="location-name">{location}</span>
      </div>

      {/* Hero Temperature */}
      <div className="now-hero">
        <div className="now-weather-icon">{getWeatherIcon(current.weatherCode)}</div>
        <div className="now-temp">{formatTemp(current.temperature)}</div>
        <div className="now-condition">{getWeatherDescription(current.weatherCode)}</div>
        <div className="now-feels">Feels like {formatTemp(current.feelsLike)}</div>
      </div>

      {/* AI Summary Card */}
      <div className="summary-card">
        <div className="summary-badge">{fromAI ? '✦ AI' : '✦'}</div>
        {summaryLoading ? (
          <div className="summary-skeleton">
            <span className="skeleton-bar" />
          </div>
        ) : (
          <p className="summary-text">{summary}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard icon="💧" label="Humidity" value={`${current.humidity}%`} />
        <StatCard
          icon="💨"
          label="Wind"
          value={`${Math.round(current.windSpeed)} mph ${windLabel}`}
        />
        <StatCard
          icon="🌡️"
          label="High / Low"
          value={`${formatTemp(daily.maxTemp)} / ${formatTemp(daily.minTemp)}`}
        />
        <StatCard
          icon="☂️"
          label="Rain Chance"
          value={`${daily.precipitationProbabilityMax}%`}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
