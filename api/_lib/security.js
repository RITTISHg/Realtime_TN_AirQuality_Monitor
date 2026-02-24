// ═══════════════════════════════════════════════════════════════
//  Security & Utility Library for Vercel Serverless Functions
// ═══════════════════════════════════════════════════════════════

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69";

// ─── Input Validation & Sanitization ─────────────────────────
const ALLOWED_STATES = new Set([
    "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Punjab", "Rajasthan", "TamilNadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
]);

const ALLOWED_POLLUTANTS = new Set([
    "PM2.5", "PM10", "NO2", "SO2", "CO", "OZONE", "NH3"
]);

/**
 * Sanitize a string to prevent injection attacks.
 * Removes any characters that aren't alphanumeric, spaces, dots, or hyphens.
 */
function sanitize(input) {
    if (typeof input !== "string") return "";
    return input.replace(/[^a-zA-Z0-9\s.\-]/g, "").trim().substring(0, 100);
}

/**
 * Validate and sanitize query parameters.
 * Returns sanitized params or throws descriptive error.
 */
function validateParams(query) {
    const city = sanitize(query.city || "Chennai");
    const state = sanitize(query.state || "TamilNadu");
    const pollutant = sanitize(query.pollutant || "PM2.5");
    const limit = Math.min(Math.max(parseInt(query.limit) || 100, 1), 500);

    if (!ALLOWED_STATES.has(state)) {
        throw new Error(`Invalid state: "${state}". Must be one of the supported Indian states.`);
    }

    if (pollutant && !ALLOWED_POLLUTANTS.has(pollutant)) {
        throw new Error(`Invalid pollutant: "${pollutant}". Must be one of: ${[...ALLOWED_POLLUTANTS].join(", ")}`);
    }

    if (city.length < 2 || city.length > 50) {
        throw new Error("City name must be between 2 and 50 characters.");
    }

    return { city, state, pollutant, limit };
}

// ─── Rate Limiting (In-Memory per instance) ──────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function rateLimit(req) {
    const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
    const now = Date.now();

    if (rateLimitMap.has(ip)) {
        const entry = rateLimitMap.get(ip);
        // Clean up expired entries
        if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
            entry.windowStart = now;
            entry.count = 1;
        } else {
            entry.count++;
        }

        if (entry.count > RATE_LIMIT_MAX) {
            return { limited: true, remaining: 0 };
        }

        return { limited: false, remaining: RATE_LIMIT_MAX - entry.count };
    }

    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
}

// ─── CORS Handler ────────────────────────────────────────────
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
}

// ─── Build API URL ───────────────────────────────────────────
function buildApiUrl({ state, city, pollutant, limit = 100 }) {
    return (
        `${BASE_URL}?api-key=${API_KEY}` +
        `&format=json&offset=0&limit=${limit}` +
        `&filters[country]=India` +
        `&filters[state]=${encodeURIComponent(state)}` +
        `&filters[city]=${encodeURIComponent(city)}` +
        (pollutant ? `&filters[pollutant_id]=${encodeURIComponent(pollutant)}` : "")
    );
}

// ─── API Fetch with Timeout ──────────────────────────────────
async function fetchWithTimeout(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Upstream API responded with status ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
            throw new Error("Upstream API request timed out");
        }
        throw err;
    }
}

// ─── Error Response Helper ───────────────────────────────────
function sendError(res, statusCode, message) {
    return res.status(statusCode).json({
        error: true,
        message,
        timestamp: new Date().toISOString(),
    });
}

// ─── Security Middleware Wrapper ─────────────────────────────
function withSecurity(handler) {
    return async (req, res) => {
        // Handle OPTIONS preflight
        setCorsHeaders(res);
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }

        // Only allow GET requests
        if (req.method !== "GET") {
            return sendError(res, 405, "Method not allowed. Only GET requests are accepted.");
        }

        // Check API key configuration
        if (!API_KEY) {
            return sendError(res, 500, "Server configuration error: API key not set.");
        }

        // Rate limiting
        const { limited, remaining } = rateLimit(req);
        res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX);
        res.setHeader("X-RateLimit-Remaining", remaining);

        if (limited) {
            return sendError(res, 429, "Too many requests. Please try again in a minute.");
        }

        try {
            return await handler(req, res);
        } catch (err) {
            console.error(`[API Error] ${req.url}:`, err.message);
            return sendError(res, 500, "Internal server error. Please try again later.");
        }
    };
}

module.exports = {
    sanitize,
    validateParams,
    rateLimit,
    setCorsHeaders,
    buildApiUrl,
    fetchWithTimeout,
    sendError,
    withSecurity,
    ALLOWED_STATES,
    ALLOWED_POLLUTANTS,
    API_KEY,
    BASE_URL,
};
