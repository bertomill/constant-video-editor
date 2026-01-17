import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "creator"],
    ],
  },
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  // Clean up username (remove @ if present)
  const cleanUsername = username.replace("@", "");

  try {
    // Medium RSS feed URL
    const feedUrl = `https://medium.com/feed/@${cleanUsername}`;

    const feed = await parser.parseURL(feedUrl);

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json(
        { error: "No articles found for this user" },
        { status: 404 }
      );
    }

    const articles = feed.items.map((item) => {
      // Extract first image from content if available
      let thumbnail = null;
      const contentEncoded = (item as { contentEncoded?: string }).contentEncoded || item.content || "";
      const imgMatch = contentEncoded.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        thumbnail = imgMatch[1];
      }

      // Extract description (strip HTML and truncate)
      let description = item.contentSnippet || item.content || "";
      description = description.replace(/<[^>]*>/g, "").slice(0, 300);

      return {
        id: item.guid || item.link || "",
        title: item.title || "Untitled",
        description,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        thumbnail,
        permalink: item.link,
        platform: "medium",
        categories: item.categories || [],
        creator: (item as { creator?: string }).creator || cleanUsername,
      };
    });

    return NextResponse.json({
      profile: {
        username: cleanUsername,
        title: feed.title || `@${cleanUsername} on Medium`,
        description: feed.description || "",
        link: feed.link || `https://medium.com/@${cleanUsername}`,
        articleCount: articles.length,
      },
      articles,
    });
  } catch (error) {
    console.error("Medium RSS error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Medium articles. Make sure the username is correct." },
      { status: 500 }
    );
  }
}
