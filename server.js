const express = require('express');
const { search, ytmp3, ytmp4 } = require('./scraper');

const app = express();

// Middleware
app.use(express.json());

// Root endpoint for API info
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the YouTube Downloader API",
        creator: "@raviya",
        endpoints: {
            search: "/api/search?q=your_search_query",
            ytmp3: "/api/ytmp3?url=youtube_video_url",
            ytmp4: "/api/ytmp4?url=youtube_video_url&quality=720p"
        }
    });
});

// Search API
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ status: false, message: "Query parameter 'q' is missing!" });
    res.json(await search(query));
});

// MP3 Download API
app.get('/api/ytmp3', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ status: false, message: "Query parameter 'url' is missing!" });
    res.json(await ytmp3(url));
});

// MP4 Download API
app.get('/api/ytmp4', async (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality || "720p";
    if (!url) return res.status(400).json({ status: false, message: "Query parameter 'url' is missing!" });
    res.json(await ytmp4(url, quality));
});

// Local testing (Vercel එක මේක ගණන් ගන්නේ නෑ)
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log(`✅ Server is running on http://localhost:3000`);
    });
}

// Vercel එකට අනිවාර්යයි
module.exports = app;
