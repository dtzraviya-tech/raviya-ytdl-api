const axios = require('axios');
const yts = require('yt-search');

// YouTube URL එකෙන් Video ID එක ගන්න function එක
const extractVideoId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*[?&]v=))([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

// ────────────────────────────────────────
// අලුත් YTSMP3 Logic එක (For MP3)
// ────────────────────────────────────────
async function ytmp3(url) {
  if (!url) return { status: false, message: "YouTube URL is required" };

  const videoId = extractVideoId(url);
  if (!videoId) return { status: false, message: "Invalid YouTube URL" };

  const apiUrl = 'https://www.ytsmp3.org/api/add-track';
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json',
    'origin': 'https://www.ytsmp3.org',
    'referer': 'https://www.ytsmp3.org/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
    'sec-gpc': '1'
  };

  try {
    const response = await axios.post(apiUrl, { videoId: videoId, type: "" }, { headers });
    const data = response.data;

    // Base64 decode කරනවා title සහ description එක
    const title = data.title ? Buffer.from(data.title, 'base64').toString('utf-8') : "Unknown Title";
    const desc = data.description ? Buffer.from(data.description, 'base64').toString('utf-8') : "";

    return {
      status: true,
      creator: "@raviya",
      title: title,
      videoId: data.videoID || videoId,
      description: desc,
      downloadUrl: data.server_link,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error("Error fetching from YTSMP3:", error.message);
    return {
      status: false,
      message: error.message || "Failed to retrieve MP3 file"
    };
  }
}

// ────────────────────────────────────────
// පරණ Logic එක (For MP4 Fallback)
// ────────────────────────────────────────
const CONFIG = {
  video: { ext: ["mp4"], q: ["144p", "240p", "360p", "480p", "720p", "1080p"] }
};

const poll = async (statusUrl) => {
  try {
    const { data } = await axios.get(statusUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (Android)",
        referer: "https://ytmp3.gg/"
      }
    });
    if (data.status === "completed") return data;
    if (data.status === "failed") throw new Error(data.message || "Conversion failed");
   
    await new Promise(r => setTimeout(r, 2000));
    return poll(statusUrl);
  } catch (err) {
    throw new Error(`Polling failed: ${err.message}`);
  }
};

async function convertYouTubeMp4(url, quality = "720p") {
  try {
    const { data: meta } = await axios.get("https://www.youtube.com/oembed", {
      params: { url, format: "json" }
    });

    const payload = {
      url,
      os: "android",
      output: { type: "video", format: "mp4", quality }
    };

    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 (Android)",
      referer: "https://ytmp3.gg/"
    };

    let downloadInit;
    try {
      downloadInit = await axios.post("https://hub.ytconvert.org/api/download", payload, { headers });
    } catch {
      downloadInit = await axios.post("https://api.ytconvert.org/api/download", payload, { headers });
    }

    const { data: initData } = downloadInit;
    if (!initData?.statusUrl) throw new Error("No status URL received from converter");

    const result = await poll(initData.statusUrl);

    return {
      title: meta.title,
      author: meta.author_name,
      duration: meta.duration || result.duration || "Unknown",
      thumbnail: meta.thumbnail_url || null,
      downloadUrl: result.downloadUrl,
      filename: `${meta.title.replace(/[^\w\s-]/gi, '')}.mp4`
    };
  } catch (err) {
    return { status: false, message: err.message || "Failed to retrieve file" };
  }
}

async function ytmp4(url, quality = "720p") {
  if (!url) return { status: false, message: "YouTube URL is required" };
  
  const result = await convertYouTubeMp4(url, quality);
  if (result.status === false) return result;

  return {
    status: true,
    creator: "@raviya",
    title: result.title,
    channel: result.author,
    duration: result.duration,
    thumbnail: result.thumbnail,
    downloadUrl: result.downloadUrl,
    quality_list: {
      [quality]: {
        resolution: quality,
        size: "Unknown",
        url: result.downloadUrl
      }
    },
    filename: result.filename
  };
}

// ────────────────────────────────────────
// YouTube Search API
// ────────────────────────────────────────
async function search(teks) {
  try {
    let data = await yts(teks);
    return {
      status: true,
      creator: "@raviya",
      results: data.all
    };
  } catch (error) {
    return {
      status: false,
      message: error.message
    };
  }
}

module.exports = {
  search,
  ytmp3,
  ytmp4
};
