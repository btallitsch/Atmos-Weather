import { useState, useEffect } from 'react';
import type { WeatherData } from '../types/weather';
import { generateWeatherSummary } from '../services/aiService';
import { getWeatherIcon, formatTemp } from '../utils/weatherUtils';

interface TodayTabProps {
  data: WeatherData;
}

export function TodayTab({ data }: TodayTabProps) {
  const { daily, hourly } = data;
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [fromAI, setFromAI] = useState(false);

  useEffect(() => {
    setSummaryLoading(true);
    generateWeatherSummary(data, 'today').then(({ summary: s, fromAI: ai }) => {
      setSummary(s);
      setFromAI(ai);
      setSummaryLoading(false);
    });
  }, [data]);

  // Build a "key moments" timeline from the hourly data
  const keyHours = [6, 9, 12, 15, 18, 21];
  const keyMoments = keyHours
    .map((targetHour) => hourly.find((h) => new Date(h.time).getHours() === targetHour))
    .filter(Boolean);

  const labels: Record<number, string> = {
    6: 'Morning',
    9: 'Late AM',
    12: 'Noon',
    15: 'Afternoon',
    18: 'Evening',
    21: 'Night',
  };

  return (
    <div className="tab-panel fade-in" id="panel-today" role="tabpanel">
      {/* Day Range Header */}
      <div className="today-range">
        <div className="today-range-item">
          <span className="today-range-label">High</span>
          <span className="today-range-value today-range-value--high">
            {formatTemp(daily.maxTemp)}
          </span>
        </div>
        <div className="today-range-divider">{getWeatherIcon(daily.weatherCode)}</div>
        <div className="today-range-item">
          <span className="today-range-label">Low</span>
          <span className="today-range-value today-range-value--low">
            {formatTemp(daily.minTemp)}
          </span>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="summary-card summary-card--today">
        <div className="summary-badge">{fromAI ? '✦ AI Summary' : '✦ Summary'}</div>
        {summaryLoading ? (
          <div className="summary-skeleton">
            <span className="skeleton-bar" />
            <span className="skeleton-bar skeleton-bar--short" />
          </div>
        ) : (
          <p className="summary-text summary-text--multiline">{summary}</p>
        )}
      </div>

      {/* Key Moments Timeline */}
      {keyMoments.length > 0 && (
        <>
          <h3 className="section-title section-title--sm">Day at a glance</h3>
          <div className="today-timeline">
            {keyMoments.map((hour, i) => {
              if (!hour) return null;
              const h = new Date(hour.time).getHours();
              const hasRain = hour.precipitationProbability >= 25;
              return (
                <div
                  key={hour.time}
                  className="timeline-item"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="timeline-label">{labels[h] ?? `${h}:00`}</span>
                  <span className="timeline-icon">{getWeatherIcon(hour.weatherCode)}</span>
                  <span className="timeline-temp">{formatTemp(hour.temperature)}</span>
                  {hasRain && (
                    <span className="timeline-rain">💧{hour.precipitationProbability}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Daily Stats */}
      <div className="today-stats">
        <div className="today-stat">
          <span className="today-stat-icon">☂️</span>
          <div>
            <span className="today-stat-label">Rain chance</span>
            <span className="today-stat-value">{daily.precipitationProbabilityMax}%</span>
          </div>
        </div>
        {daily.precipitationSum > 0 && (
          <div className="today-stat">
            <span className="today-stat-icon">🌧️</span>
            <div>
              <span className="today-stat-label">Total rain</span>
              <span className="today-stat-value">{daily.precipitationSum.toFixed(1)} mm</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
