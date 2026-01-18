/**
 * Test script for the Content Manager Agent
 *
 * Run with: npx tsx scripts/test-recommend-agent.ts
 *
 * This simulates what the frontend will send to the agent
 */

// Sample content data (mimics what comes from your social platforms)
const sampleContent = [
  {
    id: "yt-1",
    platform: "youtube",
    title: "How I Built an AI App in 24 Hours",
    description: "Building a full-stack AI application using Next.js and Claude",
    views: 15000,
    likes: 890,
    publishedAt: "2024-12-15",
    mediaType: "VIDEO"
  },
  {
    id: "yt-2",
    platform: "youtube",
    title: "React 19 - Everything You Need to Know",
    description: "Complete guide to React 19 features and migration",
    views: 8500,
    likes: 420,
    publishedAt: "2024-11-20",
    mediaType: "VIDEO"
  },
  {
    id: "tt-1",
    platform: "tiktok",
    title: "POV: You discover cursor AI",
    description: "When you realize AI can write your code #coding #ai",
    views: 125000,
    likes: 8900,
    publishedAt: "2024-12-10",
    mediaType: "VIDEO"
  },
  {
    id: "x-1",
    platform: "x",
    title: "Thread: 5 AI tools that replaced my entire workflow",
    description: "1/ Let me show you the AI tools I use daily...",
    views: 45000,
    likes: 2100,
    publishedAt: "2024-12-08",
    mediaType: "TEXT"
  },
  {
    id: "x-2",
    platform: "x",
    title: "Hot take: Most developers are sleeping on Claude",
    description: "Claude is genuinely better for coding than you think",
    views: 12000,
    likes: 650,
    publishedAt: "2024-12-01",
    mediaType: "TEXT"
  },
  {
    id: "med-1",
    platform: "medium",
    title: "The Future of AI-Assisted Development",
    description: "How AI is changing the way we write software",
    views: 3200,
    likes: 180,
    publishedAt: "2024-11-15",
    mediaType: "ARTICLE"
  }
];

import { query } from "@anthropic-ai/claude-agent-sdk";

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

async function testAgent() {
  console.log("🎬 Testing Content Manager Agent...\n");
  console.log(`Analyzing ${sampleContent.length} content items...\n`);

  const contentSummary = sampleContent.map((item) => ({
    platform: item.platform,
    title: item.title,
    description: item.description?.slice(0, 200),
    views: item.views,
    likes: item.likes,
    date: item.publishedAt,
    type: item.mediaType,
  }));

  const prompt = `Here is the creator's content library (${sampleContent.length} items):

${JSON.stringify(contentSummary, null, 2)}

Based on this content, provide:
1. A brief analysis of what's working
2. 5 specific content ideas they should create next

Focus on actionable, specific ideas that build on their existing success.
Return your response as valid JSON matching the schema in your instructions.`;

  let result = "";

  for await (const message of query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      allowedTools: [],
      permissionMode: "bypassPermissions",
    },
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          result += block.text;
          process.stdout.write(block.text);
        }
      }
    } else if (message.type === "result") {
      console.log(`\n\n✅ Agent finished: ${message.subtype}`);
    }
  }
}

testAgent().catch(console.error);
