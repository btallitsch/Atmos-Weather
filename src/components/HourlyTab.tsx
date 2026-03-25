import type { WeatherData } from '../types/weather';
import { getWeatherIcon, formatTemp, formatHour } from '../utils/weatherUtils';

interface HourlyTabProps {
  data: WeatherData;
}

export function HourlyTab({ data }: HourlyTabProps) {
  const { hourly } = data;

  return (
    <div className="tab-panel fade-in" id="panel-hourly" role="tabpanel">
      <h2 className="section-title">Next 12 Hours</h2>

      <div className="hourly-list">
        {hourly.map((hour, i) => {
          const isNow = i === 0;
          const hasRain = hour.precipitationProbability >= 20;

          return (
            <div
              key={hour.time}
              className={`hourly-row ${isNow ? 'hourly-row--now' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Time */}
              <span className="hourly-time">
                {isNow ? 'Now' : formatHour(hour.time)}
              </span>

              {/* Weather icon */}
              <span className="hourly-icon">{getWeatherIcon(hour.weatherCode)}</span>

              {/* Temperature bar visualization */}
              <div className="hourly-bar-wrap">
                <TempBar
                  temp={hour.temperature}
                  min={Math.min(...hourly.map(h => h.temperature))}
                  max={Math.max(...hourly.map(h => h.temperature))}
                />
              </div>

              {/* Temperature */}
              <span className="hourly-temp">{formatTemp(hour.temperature)}</span>

              {/* Rain probability */}
              {hasRain ? (
                <span className="hourly-rain">💧 {hour.precipitationProbability}%</span>
              ) : (
                <span className="hourly-rain hourly-rain--empty" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TempBarProps {
  temp: number;
  min: number;
  max: number;
}

function TempBar({ temp, min, max }: TempBarProps) {
  const range = max - min || 1;
  const pct = ((temp - min) / range) * 100;

  return (
    <div className="temp-bar">
      <div
        className="temp-bar-fill"
        style={{ width: `${Math.max(8, pct)}%` }}
      />
    </div>
  );
}
