import './AQIGauge.css';

const AQI_LEVELS = [
    { max: 30, label: 'Good', color: '#34d399', gradient: 'var(--gradient-good)', emoji: '😊', desc: 'Air quality is satisfactory. Little or no risk.' },
    { max: 60, label: 'Satisfactory', color: '#a3e635', gradient: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)', emoji: '🙂', desc: 'Acceptable quality. Minor concern for sensitive people.' },
    { max: 90, label: 'Moderate', color: '#fbbf24', gradient: 'var(--gradient-moderate)', emoji: '😐', desc: 'Breathing discomfort for sensitive individuals.' },
    { max: 120, label: 'Poor', color: '#f97316', gradient: 'var(--gradient-poor)', emoji: '😷', desc: 'Breathing discomfort for most people on prolonged exposure.' },
    { max: 250, label: 'Very Poor', color: '#ef4444', gradient: 'var(--gradient-severe)', emoji: '🤢', desc: 'Respiratory illness on long exposure. Heart disease impact.' },
    { max: Infinity, label: 'Severe', color: '#dc2626', gradient: 'var(--gradient-hazardous)', emoji: '☠️', desc: 'Even healthy people affected. Serious health impacts.' },
];

function getAQILevel(value) {
    return AQI_LEVELS.find((l) => value <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

function AQIGauge({ records, pollutant, city }) {
    if (!records || records.length === 0) {
        return (
            <div className="aqi-gauge glass-card">
                <div className="gauge-empty">
                    <p className="gauge-empty-text">No data available for {city}</p>
                </div>
            </div>
        );
    }

    // Calculate city-wide average
    const avgValues = records.map((r) => parseFloat(r.avg_value)).filter((v) => !isNaN(v));
    const cityAvg = avgValues.length > 0 ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length : 0;
    const level = getAQILevel(cityAvg);

    // Gauge SVG params
    const radius = 90;
    const circumference = Math.PI * radius;
    const maxVal = 300;
    const progress = Math.min(cityAvg / maxVal, 1);
    const dashOffset = circumference * (1 - progress);

    return (
        <div className="aqi-gauge glass-card">
            <div className="gauge-header">
                <h2 className="gauge-title">Air Quality</h2>
                <span className="gauge-badge" style={{ background: `${level.color}22`, color: level.color, borderColor: `${level.color}44` }}>
                    {level.emoji} {level.label}
                </span>
            </div>

            <div className="gauge-visual">
                <svg viewBox="0 0 200 120" className="gauge-svg">
                    {/* Background arc */}
                    <path
                        d="M 10 110 A 90 90 0 0 1 190 110"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                    {/* Value arc */}
                    <path
                        d="M 10 110 A 90 90 0 0 1 190 110"
                        fill="none"
                        stroke={level.color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="gauge-arc-value"
                        style={{ filter: `drop-shadow(0 0 8px ${level.color}66)` }}
                    />
                    {/* AQI dots */}
                    {AQI_LEVELS.slice(0, 5).map((l, i) => {
                        const angle = Math.PI - (Math.PI * (l.max > 250 ? 250 : l.max)) / maxVal;
                        const dotX = 100 + 90 * Math.cos(angle);
                        const dotY = 110 - 90 * Math.sin(angle);
                        return (
                            <circle key={i} cx={dotX} cy={dotY} r="2" fill={l.color} opacity="0.5" />
                        );
                    })}
                </svg>

                <div className="gauge-value-container">
                    <span className="gauge-value" style={{ color: level.color }}>
                        {cityAvg.toFixed(1)}
                    </span>
                    <span className="gauge-unit">µg/m³</span>
                </div>
            </div>

            <div className="gauge-info">
                <p className="gauge-city">{city} — {pollutant} Average</p>
                <p className="gauge-desc">{level.desc}</p>
            </div>
        </div>
    );
}

export default AQIGauge;
