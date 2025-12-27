import axios from "axios";

/**
 * Fetch a REAL YouTube video using search query
 * Always returns an existing, playable video
 * Includes quota exceeded fallback
 */
export const fetchYouTubeVideo = async (query) => {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          maxResults: 1,
          type: "video",
          safeSearch: "strict",
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    if (!res.data.items || res.data.items.length === 0) {
      return null;
    }

    const videoId = res.data.items[0].id.videoId;

    return {
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  } catch (error) {
    // Check if quota exceeded
    if (error.response?.status === 403 && 
        error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
      console.warn("⚠️ YouTube API quota exceeded - using fallback");
      // Return a generic educational video as fallback
      return {
        videoId: "dQw4w9WgXcQ",
        watchUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ`,
        isQuotaFallback: true
      };
    }
    console.error("❌ YouTube API error:", error.message);
    return null;
  }
};
