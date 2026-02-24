// ═══════════════════════════════════════════════════════════════
//  GET /api/all-pollutants
//  Fetch all 7 pollutant types for a city (parallel requests)
// ═══════════════════════════════════════════════════════════════

const {
    withSecurity,
    validateParams,
    buildApiUrl,
    fetchWithTimeout,
    ALLOWED_POLLUTANTS,
} = require("./_lib/security");

module.exports = withSecurity(async (req, res) => {
    const { city, state } = validateParams(req.query);
    const pollutants = [...ALLOWED_POLLUTANTS];

    const results = await Promise.all(
        pollutants.map(async (pollutant) => {
            try {
                const url = buildApiUrl({ state, city, pollutant, limit: 100 });
                const data = await fetchWithTimeout(url, 15000);
                return {
                    pollutant,
                    records: data.records || [],
                    total: data.total || 0,
                };
            } catch (err) {
                console.error(`[all-pollutants] Failed for ${pollutant}:`, err.message);
                return { pollutant, records: [], total: 0, error: true };
            }
        })
    );

    return res.status(200).json({ city, state, pollutants: results });
});
