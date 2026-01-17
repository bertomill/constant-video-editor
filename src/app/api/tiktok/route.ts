import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("tiktok_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not connected to TikTok", needsAuth: true },
      { status: 401 }
    );
  }

  try {
    // Get user info
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (userData.error?.code || !userData.data?.user) {
      console.error("TikTok user error:", userData);
      // Token might be expired
      cookieStore.delete("tiktok_access_token");
      return NextResponse.json(
        { error: userData.error?.message || "TikTok session expired", needsAuth: true },
        { status: 401 }
      );
    }

    const user = userData.data.user;

    // Get user's videos
    const videosResponse = await fetch(
      "https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link,create_time,share_url,view_count,like_count,comment_count,share_count",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_count: 20,
        }),
      }
    );

    const videosData = await videosResponse.json();

    if (videosData.error?.code) {
      console.error("TikTok videos error:", videosData);
      return NextResponse.json(
        { error: videosData.error?.message || "Failed to fetch videos" },
        { status: 400 }
      );
    }

    const videos = (videosData.data?.videos || []).map(
      (video: {
        id: string;
        title?: string;
        video_description?: string;
        duration?: number;
        cover_image_url?: string;
        share_url?: string;
        create_time?: number;
        view_count?: number;
        like_count?: number;
        comment_count?: number;
        share_count?: number;
      }) => ({
        id: video.id,
        title: video.title || video.video_description?.slice(0, 100) || "TikTok Video",
        description: video.video_description || "",
        publishedAt: video.create_time
          ? new Date(video.create_time * 1000).toISOString()
          : new Date().toISOString(),
        thumbnail: video.cover_image_url,
        duration: video.duration,
        views: video.view_count || 0,
        likes: video.like_count || 0,
        comments: video.comment_count || 0,
        shares: video.share_count || 0,
        permalink: video.share_url,
        platform: "tiktok",
      })
    );

    return NextResponse.json({
      connected: true,
      profile: {
        username: user.username || user.display_name,
        displayName: user.display_name,
        avatar: user.avatar_url,
        followers: user.follower_count || 0,
        following: user.following_count || 0,
        likes: user.likes_count || 0,
        videoCount: user.video_count || 0,
      },
      videos,
      cursor: videosData.data?.cursor,
      hasMore: videosData.data?.has_more,
    });
  } catch (error) {
    console.error("TikTok API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch TikTok data" },
      { status: 500 }
    );
  }
}

// Disconnect TikTok
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("tiktok_access_token");
  cookieStore.delete("tiktok_refresh_token");
  cookieStore.delete("tiktok_open_id");

  return NextResponse.json({ success: true });
}
