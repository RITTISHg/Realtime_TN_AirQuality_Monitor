import './StationCards.css';

function getAQILevel(value) {
    if (value === 'NA' || value === null || isNaN(parseFloat(value))) return { label: 'No Data', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' };
    const v = parseFloat(value);
    if (v <= 30) return { label: 'Good', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' };
    if (v <= 60) return { label: 'Satisfactory', color: '#a3e635', bg: 'rgba(163, 230, 53, 0.12)' };
    if (v <= 90) return { label: 'Moderate', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' };
    if (v <= 120) return { label: 'Poor', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' };
    if (v <= 250) return { label: 'Very Poor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
    return { label: 'Severe', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' };
}

function StationCards({ records, pollutant }) {
    if (!records || records.length === 0) {
        return (
            <div className="station-cards glass-card">
                <h2 className="stations-title">Monitoring Stations</h2>
                <p className="stations-empty">No station data available</p>
            </div>
        );
    }

    return (
        <div className="station-cards glass-card">
            <div className="stations-header">
                <h2 className="stations-title">Monitoring Stations</h2>
                <span className="stations-count">{records.length} station{records.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="cards-grid">
                {records.map((record, i) => {
                    const level = getAQILevel(record.avg_value);
                    const isNA = record.avg_value === 'NA';

                    return (
                        <div key={i} className="station-card" style={{ '--station-color': level.color, animationDelay: `${i * 0.05}s` }}>
                            <div className="card-top">
                                <div className="card-station-info">
                                    <h3 className="card-station-name">{record.station}</h3>
                                    <span className="card-coords">
                                        {parseFloat(record.latitude).toFixed(4)}°N, {parseFloat(record.longitude).toFixed(4)}°E
                                    </span>
                                </div>
                                <span className="card-status" style={{ background: level.bg, color: level.color }}>
                                    {level.label}
                                </span>
                            </div>

                            <div className="card-values">
                                <div className="card-val-item main">
                                    <span className="val-label">Average</span>
                                    <span className="val-number" style={{ color: level.color }}>
                                        {isNA ? '—' : record.avg_value}
                                    </span>
                                </div>
                                <div className="card-val-item">
                                    <span className="val-label">Min</span>
                                    <span className="val-number">
                                        {record.min_value === 'NA' ? '—' : record.min_value}
                                    </span>
                                </div>
                                <div className="card-val-item">
                                    <span className="val-label">Max</span>
                                    <span className="val-number">
                                        {record.max_value === 'NA' ? '—' : record.max_value}
                                    </span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <span className="card-pollutant">{pollutant}</span>
                                <span className="card-updated">{record.last_update}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StationCards;
