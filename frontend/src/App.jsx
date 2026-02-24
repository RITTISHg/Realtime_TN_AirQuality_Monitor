import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import AQIGauge from './components/AQIGauge.jsx';
import StationCards from './components/StationCards.jsx';
import PollutantChart from './components/PollutantChart.jsx';
import PollutantOverview from './components/PollutantOverview.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';
import './App.css';

const STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Punjab", "Rajasthan", "TamilNadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const POLLUTANTS = ["PM2.5", "PM10", "NO2", "SO2", "CO", "OZONE", "NH3"];

function App() {
    const [state, setState] = useState("TamilNadu");
    const [city, setCity] = useState("Chennai");
    const [pollutant, setPollutant] = useState("PM2.5");
    const [cities, setCities] = useState([]);
    const [stationData, setStationData] = useState(null);
    const [allPollutants, setAllPollutants] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch cities for selected state
    const fetchCities = useCallback(async (selectedState) => {
        try {
            const res = await fetch(`/api/cities?state=${encodeURIComponent(selectedState)}`);
            const data = await res.json();
            setCities(data.cities || []);
            if (data.cities && data.cities.length > 0) {
                setCity(data.cities[0]);
                return data.cities[0];
            }
            return null;
        } catch (err) {
            console.error("Failed to fetch cities:", err);
            return null;
        }
    }, []);

    // Fetch air quality data
    const fetchData = useCallback(async (selectedCity, selectedPollutant) => {
        if (!selectedCity) return;
        setLoading(true);
        setError(null);

        try {
            const [stationRes, allRes] = await Promise.all([
                fetch(`/api/air-quality?city=${encodeURIComponent(selectedCity)}&state=${encodeURIComponent(state)}&pollutant=${encodeURIComponent(selectedPollutant)}`),
                fetch(`/api/all-pollutants?city=${encodeURIComponent(selectedCity)}&state=${encodeURIComponent(state)}`)
            ]);

            const stationJson = await stationRes.json();
            const allJson = await allRes.json();

            if (stationJson.error) throw new Error(stationJson.error);

            setStationData(stationJson);
            setAllPollutants(allJson);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [state]);

    // Initial load
    useEffect(() => {
        (async () => {
            const firstCity = await fetchCities(state);
            if (firstCity) {
                fetchData(firstCity, pollutant);
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-refresh every 5 minutes
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            fetchData(city, pollutant);
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [autoRefresh, city, pollutant, fetchData]);

    // Handle state change
    const handleStateChange = async (newState) => {
        setState(newState);
        const firstCity = await fetchCities(newState);
        if (firstCity) {
            fetchData(firstCity, pollutant);
        }
    };

    // Handle city change
    const handleCityChange = (newCity) => {
        setCity(newCity);
        fetchData(newCity, pollutant);
    };

    // Handle pollutant change
    const handlePollutantChange = (newPollutant) => {
        setPollutant(newPollutant);
        fetchData(city, newPollutant);
    };

    // Manual refresh
    const handleRefresh = () => {
        fetchData(city, pollutant);
    };

    const records = stationData?.records || [];
    const validRecords = records.filter(r => r.avg_value !== "NA" && r.avg_value !== null);

    return (
        <div className="app">
            <Header
                state={state}
                city={city}
                pollutant={pollutant}
                states={STATES}
                cities={cities}
                pollutants={POLLUTANTS}
                onStateChange={handleStateChange}
                onCityChange={handleCityChange}
                onPollutantChange={handlePollutantChange}
                onRefresh={handleRefresh}
                lastUpdated={lastUpdated}
                autoRefresh={autoRefresh}
                onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
                loading={loading}
            />

            {error && (
                <div className="error-banner fade-in-up">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={handleRefresh} className="error-retry">Retry</button>
                </div>
            )}

            <main className="dashboard-grid">
                {loading && !stationData ? (
                    <LoadingOverlay />
                ) : (
                    <>
                        <section className="gauge-section fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <AQIGauge records={validRecords} pollutant={pollutant} city={city} />
                        </section>

                        <section className="stats-section fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <StatsPanel records={validRecords} pollutant={pollutant} total={stationData?.total || 0} />
                        </section>

                        <section className="chart-section fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <PollutantChart records={validRecords} pollutant={pollutant} />
                        </section>

                        <section className="overview-section fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <PollutantOverview data={allPollutants} city={city} />
                        </section>

                        <section className="stations-section fade-in-up" style={{ animationDelay: '0.5s' }}>
                            <StationCards records={records} pollutant={pollutant} />
                        </section>
                    </>
                )}
            </main>

            <footer className="app-footer">
                <p>Data sourced from <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer">data.gov.in</a> — Central Pollution Control Board</p>
                <p className="footer-sub">Real-time Air Quality Monitoring • India 🇮🇳</p>
            </footer>
        </div>
    );
}

export default App;
