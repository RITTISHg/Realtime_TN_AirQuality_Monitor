import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './PollutantChart.css';

const COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#f97316', '#fbbf24', '#34d399', '#22d3ee'];

function getBarColor(value) {
    if (value <= 30) return '#34d399';
    if (value <= 60) return '#a3e635';
    if (value <= 90) return '#fbbf24';
    if (value <= 120) return '#f97316';
    if (value <= 250) return '#ef4444';
    return '#dc2626';
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="chart-tooltip glass-card">
            <p className="tooltip-station">{d.shortName}</p>
            <div className="tooltip-row">
                <span className="tooltip-label">Avg</span>
                <span className="tooltip-value" style={{ color: getBarColor(d.avg) }}>{d.avg} µg/m³</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-label">Min</span>
                <span className="tooltip-value">{d.min} µg/m³</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-label">Max</span>
                <span className="tooltip-value">{d.max} µg/m³</span>
            </div>
            <p className="tooltip-time">{d.lastUpdate}</p>
        </div>
    );
}

function PollutantChart({ records, pollutant }) {
    if (!records || records.length === 0) {
        return (
            <div className="pollutant-chart glass-card">
                <h2 className="chart-title">{pollutant} by Station</h2>
                <p className="chart-empty">No data to display</p>
            </div>
        );
    }

    const chartData = records.map((r) => ({
        station: r.station,
        shortName: r.station.split(',')[0].trim(),
        avg: parseFloat(r.avg_value) || 0,
        min: parseFloat(r.min_value) || 0,
        max: parseFloat(r.max_value) || 0,
        lastUpdate: r.last_update,
    }));

    return (
        <div className="pollutant-chart glass-card">
            <div className="chart-header">
                <h2 className="chart-title">
                    {pollutant} Levels by Station
                </h2>
                <div className="chart-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#34d399' }}></span>Good</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#fbbf24' }}></span>Moderate</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }}></span>Poor</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }}></span>Severe</span>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="shortName"
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                            tickLine={false}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={50}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.avg)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default PollutantChart;
