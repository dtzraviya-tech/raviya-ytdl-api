const express = require('express');
const { search, ytmp3, ytmp4 } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. YouTube Search API
// Usage: /api/search?q=your_search_query
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    
    if (!query) {
        return res.status(400).json({ status: false, message: "Search query 'q' is required" });
    }

    try {
        const result = await search(query);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// 2. YouTube to MP3 API
// Usage: /api/ytmp3?url=youtube_video_url
app.get('/api/ytmp3', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({ status: false, message: "YouTube 'url' parameter is required" });
    }

    try {
        const result = await ytmp3(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// 3. YouTube to MP4 API
// Usage: /api/ytmp4?url=youtube_video_url&quality=720p
app.get('/api/ytmp4', async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || '720p'; // Defaults to 720p if not provided
    
    if (!url) {
        return res.status(400).json({ status: false, message: "YouTube 'url' parameter is required" });
    }

    try {
        const result = await ytmp4(url, quality);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the YouTube Downloader API",
        endpoints: {
            search: "/api/search?q={query}",
            ytmp3: "/api/ytmp3?url={youtube_url}",
            ytmp4: "/api/ytmp4?url={youtube_url}&quality={quality}"
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server is running on http://localhost:${PORT}`);
});