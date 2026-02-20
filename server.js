const express = require('express');
const { search, ytmp3, ytmp4 } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Root endpoint for API info
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the YouTube Downloader API",
        creator: "@raviya",
        endpoints: {
            search: "/api/search?q=your_search_query",
            ytmp3: "/api/ytmp3?url=youtube_video_url",
            ytmp4: "/api/ytmp4?url=youtube_video_url&quality=720p" // quality is optional, defaults to 720p
        }
    });
});

// Search API Endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ status: false, message: "Query parameter 'q' is missing!" });
    }
    const result = await search(query);
    res.json(result);
});

// MP3 Download API Endpoint
app.get('/api/ytmp3', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ status: false, message: "Query parameter 'url' is missing!" });
    }
    const result = await ytmp3(url);
    res.json(result);
});

// MP4 Download API Endpoint
app.get('/api/ytmp4', async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "720p"; // Default to 720p if not provided
    
    if (!url) {
        return res.status(400).json({ status: false, message: "Query parameter 'url' is missing!" });
    }
    const result = await ytmp4(url, quality);
    res.json(result);
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`🚀 API Creator: @raviya`);
});
