import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const channelId = searchParams.get("channelId");
  const username = searchParams.get("username");

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 }
    );
  }

  try {
    let resolvedChannelId = channelId;

    // If username provided, resolve to channel ID first
    if (username && !channelId) {
      const channelResponse = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=id&forHandle=@${username.replace("@", "")}&key=${YOUTUBE_API_KEY}`
      );
      const channelData = await channelResponse.json();

      if (channelData.items && channelData.items.length > 0) {
        resolvedChannelId = channelData.items[0].id;
      } else {
        // Try searching by username
        const searchResponse = await fetch(
          `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${username}&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchResponse.json();
        if (searchData.items && searchData.items.length > 0) {
          resolvedChannelId = searchData.items[0].snippet.channelId;
        }
      }
    }

    if (!resolvedChannelId) {
      return NextResponse.json(
        { error: "Could not find channel. Please provide a valid channel ID or username." },
        { status: 400 }
      );
    }

    // Get channel's uploads playlist
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=contentDetails,snippet&id=${resolvedChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosResponse.json();

    if (!videosData.items) {
      return NextResponse.json({ videos: [], channel: channelTitle });
    }

    // Get video statistics
    const videoIds = videosData.items
      .map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)
      .join(",");

    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const statsData = await statsResponse.json();

    // Merge video data with stats
    const videos = videosData.items.map((item: {
      contentDetails: { videoId: string };
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      };
    }) => {
      const stats = statsData.items?.find(
        (s: { id: string }) => s.id === item.contentDetails.videoId
      );
      return {
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url,
        views: stats?.statistics?.viewCount || 0,
        likes: stats?.statistics?.likeCount || 0,
        comments: stats?.statistics?.commentCount || 0,
        duration: stats?.contentDetails?.duration || "",
        platform: "youtube",
      };
    });

    return NextResponse.json({
      channel: channelTitle,
      channelId: resolvedChannelId,
      videos,
    });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
