import { NextResponse } from "next/server";

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function GET() {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Instagram access token not configured", needsAuth: true },
      { status: 401 }
    );
  }

  try {
    // Get user profile using Instagram Business API
    const profileResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,account_type,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    const profile = await profileResponse.json();

    if (profile.error) {
      console.error("Instagram profile error:", profile.error);
      return NextResponse.json(
        { error: profile.error.message || "Failed to fetch profile", needsAuth: true },
        { status: 401 }
      );
    }

    // Get user's media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username&limit=50&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      console.error("Instagram media error:", mediaData.error);
      return NextResponse.json(
        { error: mediaData.error.message || "Failed to fetch media" },
        { status: 400 }
      );
    }

    const media = (mediaData.data || []).map(
      (item: {
        id: string;
        caption?: string;
        media_type: string;
        media_url?: string;
        thumbnail_url?: string;
        permalink: string;
        timestamp: string;
        username: string;
      }) => ({
        id: item.id,
        title: item.caption?.slice(0, 100) || "Untitled",
        description: item.caption || "",
        mediaType: item.media_type, // IMAGE, VIDEO, CAROUSEL_ALBUM
        mediaUrl: item.media_url,
        thumbnail: item.thumbnail_url || item.media_url,
        permalink: item.permalink,
        publishedAt: item.timestamp,
        platform: "instagram",
        username: item.username,
      })
    );

    return NextResponse.json({
      connected: true,
      profile: {
        username: profile.username,
        mediaCount: profile.media_count,
        accountType: profile.account_type,
      },
      media,
    });
  } catch (error) {
    console.error("Instagram API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
