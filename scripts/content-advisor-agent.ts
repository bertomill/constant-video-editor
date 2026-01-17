import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * Content Advisor Agent - Proof of Concept
 *
 * This agent analyzes your app's social media integration code
 * and understands how your data flows. Later, we can extend it
 * to actually call your APIs and analyze real content.
 */

async function main() {
  console.log("🎬 Content Advisor Agent starting...\n");

  const systemPrompt = `You are a social media content strategist AI assistant.
Your job is to help creators understand their content performance and suggest new video ideas.

When analyzing content:
1. Look for patterns in what performs well (high views, engagement)
2. Identify content gaps or opportunities
3. Suggest specific, actionable video ideas
4. Consider cross-platform opportunities (content that works on YouTube might work on TikTok)

Be concise and practical in your recommendations.`;

  for await (const message of query({
    prompt: `First, explore the src/app/api directory to understand what social media platforms
this app integrates with. Then look at src/app/content/page.tsx to understand how content
is displayed and what data fields are available.

Give me a brief summary of:
1. Which platforms are integrated
2. What data we can pull from each
3. How this data could be used to make content recommendations`,
    options: {
      allowedTools: ["Glob", "Read", "Grep"],
      permissionMode: "bypassPermissions",
      systemPrompt
    }
  })) {
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text);
        } else if ("name" in block) {
          console.log(`\n[${block.name}]`);
        }
      }
    } else if (message.type === "result") {
      console.log(`\n✅ Agent finished: ${message.subtype}`);
    }
  }
}

main().catch(console.error);
