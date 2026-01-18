import { NextRequest, NextResponse } from "next/server";
import { query, ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";

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
  focus?: "video" | "post" | "all"; // What type of content to suggest
  count?: number; // How many suggestions
}

const SYSTEM_PROMPT = `You are an expert social media content manager and strategist.

Your job is to analyze a creator's existing content library and suggest compelling new content ideas.

When analyzing content:
1. Identify top performers (high views/likes relative to other content)
2. Find recurring themes or topics that resonate with the audience
3. Spot content gaps - topics not yet covered or platforms not fully utilized
4. Note posting patterns and timing

When suggesting new content:
1. Be SPECIFIC - don't say "make a video about tech", say "Create a 60-second TikTok comparing the battery life of the top 3 phones of 2024"
2. Reference which existing content inspired the idea
3. Suggest the best platform(s) for each idea
4. Consider cross-platform opportunities (e.g., turn a popular tweet into a YouTube short)

Format your response as JSON with this structure:
{
  "analysis": {
    "topPerformers": [{"title": "...", "platform": "...", "whyItWorked": "..."}],
    "themes": ["theme1", "theme2"],
    "gaps": ["gap1", "gap2"]
  },
  "recommendations": [
    {
      "title": "Specific content idea title",
      "description": "What the content should cover",
      "platform": "youtube|tiktok|instagram|x|medium",
      "format": "short|long|carousel|thread|article",
      "inspiration": "Which existing content inspired this",
      "reasoning": "Why this will perform well"
    }
  ]
}`;

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

    // Build prompt with the content data
    const contentSummary = content.map((item) => ({
      platform: item.platform,
      title: item.title,
      description: item.description?.slice(0, 200),
      views: item.views,
      likes: item.likes,
      date: item.publishedAt,
      type: item.mediaType,
    }));

    const prompt = `Here is the creator's content library (${content.length} items):

${JSON.stringify(contentSummary, null, 2)}

Based on this content, provide:
1. A brief analysis of what's working
2. ${count} specific ${focus === "all" ? "content" : focus} ideas they should create next

Focus on actionable, specific ideas that build on their existing success.
Return your response as valid JSON matching the schema in your instructions.`;

    let result = "";

    // Run the agent
    for await (const message of query({
      prompt,
      options: {
        systemPrompt: SYSTEM_PROMPT,
        allowedTools: [], // No tools needed - pure analysis
        permissionMode: "bypassPermissions",
        maxTurns: 1, // Single turn for analysis
      } as ClaudeAgentOptions,
    })) {
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            result += block.text;
          }
        }
      }
    }

    // Try to parse as JSON, fall back to raw text
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, data: parsed });
      }
    } catch {
      // JSON parsing failed, return raw result
    }

    return NextResponse.json({ success: true, data: { raw: result } });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
