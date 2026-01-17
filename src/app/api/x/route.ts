import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("x_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not connected to X", needsAuth: true },
      { status: 401 }
    );
  }

  try {
    // Get user info
    const userResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,description",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (userData.errors || !userData.data) {
      console.error("X user error:", userData);
      // Token might be expired
      cookieStore.delete("x_access_token");
      return NextResponse.json(
        { error: "X session expired", needsAuth: true },
        { status: 401 }
      );
    }

    const userId = userData.data.id;
    const username = userData.data.username;

    // Get user's tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=50&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url,type`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const tweetsData = await tweetsResponse.json();
    console.log("X tweets response:", JSON.stringify(tweetsData, null, 2));

    if (tweetsData.errors && !tweetsData.data) {
      console.error("X tweets error:", tweetsData);
      // Check if it's a permission/tier issue
      const errorMsg = tweetsData.errors?.[0]?.message || "Failed to fetch tweets";
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    // Create media lookup map
    const mediaMap = new Map();
    if (tweetsData.includes?.media) {
      for (const media of tweetsData.includes.media) {
        mediaMap.set(media.media_key, media);
      }
    }

    const tweets = (tweetsData.data || []).map(
      (tweet: {
        id: string;
        text: string;
        created_at: string;
        public_metrics?: {
          like_count: number;
          retweet_count: number;
          reply_count: number;
          impression_count: number;
        };
        attachments?: {
          media_keys?: string[];
        };
      }) => {
        // Get first media attachment if exists
        let thumbnail = null;
        let mediaType = null;
        if (tweet.attachments?.media_keys?.length) {
          const media = mediaMap.get(tweet.attachments.media_keys[0]);
          if (media) {
            thumbnail = media.preview_image_url || media.url;
            mediaType = media.type; // photo, video, animated_gif
          }
        }

        return {
          id: tweet.id,
          title: tweet.text.slice(0, 100) + (tweet.text.length > 100 ? "..." : ""),
          description: tweet.text,
          publishedAt: tweet.created_at,
          thumbnail,
          mediaType,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          views: tweet.public_metrics?.impression_count || 0,
          permalink: `https://x.com/${username}/status/${tweet.id}`,
          platform: "x",
          username,
        };
      }
    );

    return NextResponse.json({
      connected: true,
      profile: {
        username: userData.data.username,
        name: userData.data.name,
        profileImage: userData.data.profile_image_url,
        followers: userData.data.public_metrics?.followers_count || 0,
        tweetCount: userData.data.public_metrics?.tweet_count || 0,
      },
      tweets,
    });
  } catch (error) {
    console.error("X API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch X data" },
      { status: 500 }
    );
  }
}

// Disconnect X
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("x_access_token");
  cookieStore.delete("x_refresh_token");

  return NextResponse.json({ success: true });
}
