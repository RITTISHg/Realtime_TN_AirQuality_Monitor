import './PollutantOverview.css';

const POLLUTANT_INFO = {
    'PM2.5': { icon: '🌫️', name: 'PM2.5', fullName: 'Fine Particulate Matter', unit: 'µg/m³', safe: 60 },
    'PM10': { icon: '💨', name: 'PM10', fullName: 'Coarse Particulate Matter', unit: 'µg/m³', safe: 100 },
    'NO2': { icon: '🟤', name: 'NO₂', fullName: 'Nitrogen Dioxide', unit: 'µg/m³', safe: 80 },
    'SO2': { icon: '🟡', name: 'SO₂', fullName: 'Sulphur Dioxide', unit: 'µg/m³', safe: 80 },
    'CO': { icon: '⚫', name: 'CO', fullName: 'Carbon Monoxide', unit: 'mg/m³', safe: 2 },
    'OZONE': { icon: '🔵', name: 'O₃', fullName: 'Ozone', unit: 'µg/m³', safe: 100 },
    'NH3': { icon: '🟢', name: 'NH₃', fullName: 'Ammonia', unit: 'µg/m³', safe: 200 },
};

function PollutantOverview({ data, city }) {
    if (!data || !data.pollutants) {
        return (
            <div className="pollutant-overview glass-card">
                <h2 className="overview-title">All Pollutants</h2>
                <p className="overview-empty">No overview data</p>
            </div>
        );
    }

    return (
        <div className="pollutant-overview glass-card">
            <div className="overview-header">
                <h2 className="overview-title">All Pollutants — {city}</h2>
                <span className="overview-subtitle">Summary across all monitoring stations</span>
            </div>

            <div className="overview-grid">
                {data.pollutants.map((p) => {
                    const info = POLLUTANT_INFO[p.pollutant] || { icon: '🔘', name: p.pollutant, fullName: p.pollutant, unit: 'µg/m³', safe: 100 };
                    const validRecs = (p.records || []).filter((r) => r.avg_value !== 'NA');
                    const avgValues = validRecs.map((r) => parseFloat(r.avg_value)).filter((v) => !isNaN(v));
                    const avg = avgValues.length > 0 ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length : null;
                    const ratio = avg !== null ? Math.min(avg / (info.safe * 2), 1) : 0;
                    const isAboveSafe = avg !== null && avg > info.safe;

                    return (
                        <div key={p.pollutant} className={`overview-item ${isAboveSafe ? 'above-safe' : ''}`}>
                            <div className="ov-item-header">
                                <span className="ov-icon">{info.icon}</span>
                                <div className="ov-name-group">
                                    <span className="ov-name">{info.name}</span>
                                    <span className="ov-fullname">{info.fullName}</span>
                                </div>
                            </div>

                            <div className="ov-value-row">
                                <span className="ov-value">
                                    {avg !== null ? avg.toFixed(1) : 'N/A'}
                                </span>
                                <span className="ov-unit">{info.unit}</span>
                            </div>

                            <div className="ov-progress-container">
                                <div className="ov-progress-bg">
                                    <div
                                        className="ov-progress-fill"
                                        style={{
                                            width: `${ratio * 100}%`,
                                            background: isAboveSafe
                                                ? 'linear-gradient(90deg, #f97316, #ef4444)'
                                                : 'linear-gradient(90deg, #34d399, #22d3ee)',
                                        }}
                                    />
                                    <div
                                        className="ov-safe-marker"
                                        style={{ left: `${Math.min(info.safe / (info.safe * 2), 1) * 100}%` }}
                                        title={`Safe limit: ${info.safe} ${info.unit}`}
                                    />
                                </div>
                            </div>

                            <div className="ov-meta">
                                <span className="ov-stations">{validRecs.length} station{validRecs.length !== 1 ? 's' : ''}</span>
                                <span className={`ov-status ${isAboveSafe ? 'danger' : 'safe'}`}>
                                    {avg !== null ? (isAboveSafe ? 'Above limit' : 'Within limit') : 'No data'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PollutantOverview;
