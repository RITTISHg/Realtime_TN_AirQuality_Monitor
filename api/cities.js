// ═══════════════════════════════════════════════════════════════
//  GET /api/cities
//  Fetch available cities for a given Indian state
// ═══════════════════════════════════════════════════════════════

const {
    withSecurity,
    sanitize,
    buildApiUrl,
    fetchWithTimeout,
    ALLOWED_STATES,
    sendError,
} = require("./_lib/security");

module.exports = withSecurity(async (req, res) => {
    const state = sanitize(req.query.state || "TamilNadu");

    if (!ALLOWED_STATES.has(state)) {
        return sendError(res, 400, `Invalid state: "${state}".`);
    }

    const url = buildApiUrl({ state, city: "", limit: 1000 }).replace(
        "&filters[city]=",
        ""
    );

    const data = await fetchWithTimeout(url, 15000);
    const cities = [
        ...new Set((data.records || []).map((r) => r.city).filter(Boolean)),
    ].sort();

    return res.status(200).json({ state, cities });
});
