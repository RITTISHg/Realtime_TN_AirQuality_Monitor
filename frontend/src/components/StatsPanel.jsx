import './StatsPanel.css';

function StatsPanel({ records, pollutant, total }) {
    if (!records || records.length === 0) {
        return (
            <div className="stats-panel glass-card">
                <h2 className="stats-title">Statistics</h2>
                <p className="stats-empty">No data available</p>
            </div>
        );
    }

    const avgValues = records.map((r) => parseFloat(r.avg_value)).filter((v) => !isNaN(v));
    const minValues = records.map((r) => parseFloat(r.min_value)).filter((v) => !isNaN(v));
    const maxValues = records.map((r) => parseFloat(r.max_value)).filter((v) => !isNaN(v));

    const overallAvg = avgValues.length > 0 ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length : 0;
    const overallMin = minValues.length > 0 ? Math.min(...minValues) : 0;
    const overallMax = maxValues.length > 0 ? Math.max(...maxValues) : 0;
    const stationCount = records.length;

    const stats = [
        {
            label: 'Average Value',
            value: overallAvg.toFixed(1),
            unit: 'µg/m³',
            icon: '📊',
            color: 'var(--accent-indigo)',
        },
        {
            label: 'Minimum',
            value: overallMin.toFixed(1),
            unit: 'µg/m³',
            icon: '📉',
            color: 'var(--accent-emerald)',
        },
        {
            label: 'Maximum',
            value: overallMax.toFixed(1),
            unit: 'µg/m³',
            icon: '📈',
            color: 'var(--accent-rose)',
        },
        {
            label: 'Active Stations',
            value: stationCount,
            unit: `of ${total}`,
            icon: '📡',
            color: 'var(--accent-cyan)',
        },
    ];

    return (
        <div className="stats-panel glass-card">
            <h2 className="stats-title">
                {pollutant} Statistics
            </h2>
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-item" style={{ '--stat-color': stat.color }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-unit">{stat.unit}</span>
                        </div>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StatsPanel;
