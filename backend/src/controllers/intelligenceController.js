import Profile from '../models/Profile.js';
import { callGroq } from '../ai-services/groqService.js';
import fetch from 'node-fetch';

// Using native groqService instead of external SDK to maintain ecosystem stability

// @desc    Fetch Environmental OSINT data from Open-Meteo including City geocoding if needed
const fetchOSINT = async (lat, lon, city) => {
    try {
        let finalLat = lat;
        let finalLon = lon;
        let locationName = "Unknown Location";

        // If City is provided instead of Lat/Lon, Geocode it using Open-Meteo Geocoding API
        if (city && (!lat || !lon)) {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
                finalLat = geoData.results[0].latitude;
                finalLon = geoData.results[0].longitude;
                locationName = geoData.results[0].name;
            } else {
                return null;
            }
        } else {
            locationName = "Your Coordinates";
        }

        if (!finalLat || !finalLon) return null;

        // 1. Weather & UV & Pressure
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=relative_humidity_2m,surface_pressure,uv_index&hourly=uv_index&daily=uv_index_max&timezone=auto`);
        const weatherData = await weatherRes.json();

        // 2. Air Quality (AQI)
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${finalLat}&longitude=${finalLon}&current=us_aqi,pm10,pm2_5`);
        const aqiData = await aqiRes.json();

        return {
            aqi: aqiData.current?.us_aqi || 0,
            uv: weatherData.current?.uv_index || 0,
            humidity: weatherData.current?.relative_humidity_2m || 0,
            locationName,
            location: { lat: finalLat, lon: finalLon }
        };
    } catch (err) {
        console.error("OSINT_FETCH_ERROR:", err);
        return null;
    }
};

export const getIntelligence = async (req, res) => {
    try {
        const { lat, lon, city } = req.query;
        const profile = await Profile.findOne({ user: req.user._id });

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        // Parallelize OSINT and AI generation
        let osint = null;
        if (lat && lon || city) {
            osint = await fetchOSINT(lat, lon, city);
        }

        const prompt = `
            Generate a personalized health intelligence brief for a ${profile.age}yo ${profile.gender}.
            Biometrics: BMI ${profile.bmi}, Blood ${profile.bloodGroup}.
            Conditions: ${profile.conditions?.join(', ') || 'None'}.
            Allergies: ${profile.allergies?.join(', ') || 'None'}.
            Location Context: ${osint ? `City: ${osint.locationName}, AQI ${osint.aqi}, UV ${osint.uv}, Humidity ${osint.humidity}%` : 'Unknown'}.

            CRITICAL VARIANCE INSTRUCTION: Generate COMPLETELY NOVEL insights for this session (Time: ${new Date().toISOString()}). DO NOT repeat generic advice from previous sessions. Pick a highly specific, obscure, or unique biological system or lifestyle factor to focus on today. 

            Return JSON exactly matching this structure (DO NOT include any text outside the JSON):
            {
              "dailyTip": "One sentence health advice.",
              "dailyStatus": "Short status (e.g., Stable, Warning).",
              "intelligenceBrief": "2 sentences explaining current health state.",
              "environmentalAnalysis": "1-2 sentences strictly analyzing the location context (AQI/Humidity/UV) and how it uniquely affects their conditions/allergies in that specific city.",
              "digitalTwin": {
                "pattern": "Detected pattern based on profile.",
                "riskTrend": "Current risk direction (e.g., Improving, Rising).",
                "medInsight": "Specific caution or optimization for their meds."
              },
              "education": {
                "title": "Clinical concept name.",
                "explanation": "Simpler analogy of that concept (1 sentence)."
              }
            }
        `;

        const responseText = await callGroq(prompt, "You are a specialized medical intelligence extraction engine.", "qwen/qwen3-32b", 0.1);
        
        // Robust JSON parsing for LLM output
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonContent = responseText.substring(jsonStart, jsonEnd);
        const intelligence = JSON.parse(jsonContent);

        res.json({
            intelligence,
            osint,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("INTELLIGENCE_LAYER_FAULT:", error);
        res.status(500).json({ message: "Intelligence Layer Fault", error: error.message });
    }
};
