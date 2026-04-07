import { getNews } from './controllers/newsController.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mockReq = {
    query: {}
};

const mockRes = {
    json: (data) => {
        console.log("SUCCESS: News Aggregated!");
        console.log("Count:", data.news.length);
        console.log("Neural Briefing:", data.neuralBriefing);
        console.log("Pulse:", data.neuralPulse);
        if (data.news.length > 0) {
            console.log("First Article:", data.news[0].title, "-", data.news[0].date);
        }
        process.exit(0);
    },
    status: (code) => ({
        json: (data) => {
            console.error("FAILURE Code:", code);
            console.error("Error:", data);
            process.exit(1)
        }
    })
};

console.log("Starting News Diagnostic Node...");
getNews(mockReq, mockRes);
