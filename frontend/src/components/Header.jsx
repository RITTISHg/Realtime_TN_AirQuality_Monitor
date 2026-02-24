import './Header.css';

function Header({
    state, city, pollutant,
    states, cities, pollutants,
    onStateChange, onCityChange, onPollutantChange,
    onRefresh, lastUpdated, autoRefresh, onAutoRefreshToggle,
    loading
}) {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="header-brand">
                    <div className="brand-logo">
                        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2.5" />
                            <path d="M10 20c2-4 4-8 6-8s4 4 6 8" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="16" cy="12" r="2.5" fill="url(#logo-grad)" />
                            <defs>
                                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#818cf8" />
                                    <stop offset="1" stopColor="#22d3ee" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-name">AirPulse</h1>
                        <p className="brand-tagline">Real-Time Air Quality Index</p>
                    </div>
                </div>

                <div className="header-controls">
                    <div className="control-group">
                        <label className="control-label">State</label>
                        <select
                            id="state-select"
                            className="control-select"
                            value={state}
                            onChange={(e) => onStateChange(e.target.value)}
                        >
                            {states.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <label className="control-label">City</label>
                        <select
                            id="city-select"
                            className="control-select"
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                        >
                            {cities.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="control-group">
                        <label className="control-label">Pollutant</label>
                        <select
                            id="pollutant-select"
                            className="control-select"
                            value={pollutant}
                            onChange={(e) => onPollutantChange(e.target.value)}
                        >
                            {pollutants.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        id="auto-refresh-toggle"
                        className={`action-btn toggle-btn ${autoRefresh ? 'active' : ''}`}
                        onClick={onAutoRefreshToggle}
                        title={autoRefresh ? "Auto-refresh ON (5 min)" : "Auto-refresh OFF"}
                    >
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span className="btn-label">Auto</span>
                    </button>

                    <button
                        id="refresh-btn"
                        className={`action-btn refresh-btn ${loading ? 'spinning' : ''}`}
                        onClick={onRefresh}
                        disabled={loading}
                        title="Refresh data"
                    >
                        <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" className="refresh-icon">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {lastUpdated && (
                        <span className="last-updated">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
