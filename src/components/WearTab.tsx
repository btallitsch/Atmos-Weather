import type { WeatherData } from '../types/weather';
import { getWearSuggestions } from '../utils/clothingUtils';

interface WearTabProps {
  data: WeatherData;
}

export function WearTab({ data }: WearTabProps) {
  const { current, daily } = data;
  const suggestions = getWearSuggestions(current, daily.precipitationProbabilityMax);

  return (
    <div className="tab-panel fade-in" id="panel-wear" role="tabpanel">
      <div className="wear-header">
        <h2 className="wear-headline">{suggestions.headline}</h2>
        <p className="wear-subtext">
          {Math.round(current.feelsLike)}°F outside · {daily.precipitationProbabilityMax}% rain chance
        </p>
      </div>

      <div className="wear-list">
        {suggestions.items.map((item, i) => (
          <div key={i} className="wear-item" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="wear-item-icon">{item.icon}</div>
            <div className="wear-item-content">
              <span className="wear-item-primary">{item.primary}</span>
              <span className="wear-item-detail">{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
