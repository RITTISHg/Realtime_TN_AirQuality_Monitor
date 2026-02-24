import './LoadingOverlay.css';

function LoadingOverlay() {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring inner"></div>
                    <div className="spinner-dot"></div>
                </div>
                <h3 className="loading-title">Fetching Air Quality Data</h3>
                <p className="loading-subtitle">Connecting to CPCB monitoring network...</p>
            </div>
        </div>
    );
}

export default LoadingOverlay;
