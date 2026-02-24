import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load environment variables from API.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "API.env") });

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 5000;

// ─── Endpoint: Get air quality data ──────────────────────────────────
app.get("/api/air-quality", async (req, res) => {
    const { city = "Chennai", state = "TamilNadu", pollutant = "PM2.5", limit = 100 } = req.query;

    const url =
        `${BASE_URL}?api-key=${API_KEY}` +
        `&format=json&offset=0&limit=${limit}` +
        `&filters[country]=India` +
        `&filters[state]=${state}` +
        `&filters[city]=${city}` +
        `&filters[pollutant_id]=${pollutant}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error fetching AQ data:", err.message);
        res.status(500).json({ error: "Failed to fetch air quality data", details: err.message });
    }
});

// ─── Endpoint: Get all pollutants for a city ─────────────────────────
app.get("/api/air-quality/all-pollutants", async (req, res) => {
    const { city = "Chennai", state = "TamilNadu" } = req.query;
    const pollutants = ["PM2.5", "PM10", "NO2", "SO2", "CO", "OZONE", "NH3"];

    try {
        const results = await Promise.all(
            pollutants.map(async (pollutant) => {
                const url =
                    `${BASE_URL}?api-key=${API_KEY}` +
                    `&format=json&offset=0&limit=100` +
                    `&filters[country]=India` +
                    `&filters[state]=${state}` +
                    `&filters[city]=${city}` +
                    `&filters[pollutant_id]=${pollutant}`;

                const response = await fetch(url);
                if (!response.ok) return { pollutant, records: [], error: true };
                const data = await response.json();
                return { pollutant, records: data.records || [], total: data.total || 0 };
            })
        );

        res.json({ city, state, pollutants: results });
    } catch (err) {
        console.error("Error fetching all pollutants:", err.message);
        res.status(500).json({ error: "Failed to fetch pollutant data", details: err.message });
    }
});

// ─── Endpoint: Get available cities by state ─────────────────────────
app.get("/api/cities", async (req, res) => {
    const { state = "TamilNadu" } = req.query;

    const url =
        `${BASE_URL}?api-key=${API_KEY}` +
        `&format=json&offset=0&limit=1000` +
        `&filters[country]=India` +
        `&filters[state]=${state}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API responded with status ${response.status}`);
        const data = await response.json();
        const cities = [...new Set((data.records || []).map((r) => r.city))].sort();
        res.json({ state, cities });
    } catch (err) {
        console.error("Error fetching cities:", err.message);
        res.status(500).json({ error: "Failed to fetch cities", details: err.message });
    }
});

// ─── Serve React frontend in production ──────────────────────────────

const distPath = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});