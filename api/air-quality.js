// ═══════════════════════════════════════════════════════════════
//  GET /api/air-quality
//  Fetch air quality data for a specific city & pollutant
// ═══════════════════════════════════════════════════════════════

const { withSecurity, validateParams, buildApiUrl, fetchWithTimeout } = require("./_lib/security");

module.exports = withSecurity(async (req, res) => {
    const { city, state, pollutant, limit } = validateParams(req.query);

    const url = buildApiUrl({ state, city, pollutant, limit });
    const data = await fetchWithTimeout(url, 15000);

    return res.status(200).json(data);
});
