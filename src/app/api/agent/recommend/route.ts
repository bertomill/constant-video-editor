import { NextRequest, NextResponse } from "next/server";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { AVI_SYSTEM_PROMPT, AVI_JSON_SCHEMA } from "@/lib/avi";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail?: string | null;
  views?: number;
  likes?: number;
  platform: string;
  mediaType?: string;
  permalink?: string;
}

interface RecommendRequest {
  content: ContentItem[];
  focus?: "video" | "post" | "all";
  count?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendRequest = await request.json();
    const { content, focus = "all", count = 5 } = body;

    if (!content || content.length === 0) {
      return NextResponse.json(
        { error: "No content provided. Connect your social platforms first." },
        { status: 400 }
      );
    }

    // Build content summary for Avi to analyze
    const contentSummary = content.map((item) => ({
      platform: item.platform,
      title: item.title,
      description: item.description?.slice(0, 200),
      views: item.views,
      likes: item.likes,
      date: item.publishedAt,
      type: item.mediaType,
    }));

    const prompt = `A creator just shared their content library with you. Here's what they've been posting (${content.length} items):

${JSON.stringify(contentSummary, null, 2)}

Take a look at their content, analyze what's working, and give them ${count} specific ${focus === "all" ? "content" : focus} ideas for what to create next.

Be yourself - give them your honest take and real recommendations based on what you see.

${AVI_JSON_SCHEMA}`;

    let result = "";

    // Run Avi
    for await (const message of query({
      prompt,
      options: {
        systemPrompt: AVI_SYSTEM_PROMPT,
        allowedTools: [],
        permissionMode: "bypassPermissions",
      },
    })) {
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            result += block.text;
          }
        }
      }
    }

    // Parse JSON response
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          agent: "avi",
          data: parsed,
        });
      }
    } catch {
      // JSON parsing failed
    }

    return NextResponse.json({
      success: true,
      agent: "avi",
      data: { raw: result },
    });
  } catch (error) {
    console.error("Avi error:", error);
    return NextResponse.json(
      { error: "Avi couldn't analyze your content right now. Try again?" },
      { status: 500 }
    );
  }
}
