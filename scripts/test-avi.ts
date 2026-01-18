/**
 * Test Avi - Your Content Manager
 *
 * Run with: npx tsx scripts/test-avi.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { AVI_SYSTEM_PROMPT, AVI_JSON_SCHEMA } from "../src/lib/avi";

// Sample content data
const sampleContent = [
  {
    platform: "youtube",
    title: "How I Built an AI App in 24 Hours",
    description: "Building a full-stack AI application using Next.js and Claude",
    views: 15000,
    likes: 890,
    date: "2024-12-15",
    type: "VIDEO"
  },
  {
    platform: "youtube",
    title: "React 19 - Everything You Need to Know",
    description: "Complete guide to React 19 features and migration",
    views: 8500,
    likes: 420,
    date: "2024-11-20",
    type: "VIDEO"
  },
  {
    platform: "tiktok",
    title: "POV: You discover cursor AI",
    description: "When you realize AI can write your code #coding #ai",
    views: 125000,
    likes: 8900,
    date: "2024-12-10",
    type: "VIDEO"
  },
  {
    platform: "x",
    title: "Thread: 5 AI tools that replaced my entire workflow",
    description: "1/ Let me show you the AI tools I use daily...",
    views: 45000,
    likes: 2100,
    date: "2024-12-08",
    type: "TEXT"
  },
  {
    platform: "x",
    title: "Hot take: Most developers are sleeping on Claude",
    description: "Claude is genuinely better for coding than you think",
    views: 12000,
    likes: 650,
    date: "2024-12-01",
    type: "TEXT"
  },
  {
    platform: "medium",
    title: "The Future of AI-Assisted Development",
    description: "How AI is changing the way we write software",
    views: 3200,
    likes: 180,
    date: "2024-11-15",
    type: "ARTICLE"
  }
];

async function testAvi() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  AVI - Your Content Manager");
  console.log("  \"Your creator who made it\"");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(`Analyzing ${sampleContent.length} pieces of content...\n`);

  const prompt = `A creator just shared their content library with you. Here's what they've been posting (${sampleContent.length} items):

${JSON.stringify(sampleContent, null, 2)}

Take a look at their content, analyze what's working, and give them 5 specific content ideas for what to create next.

Be yourself - give them your honest take and real recommendations based on what you see.

${AVI_JSON_SCHEMA}`;

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
          process.stdout.write(block.text);
        }
      }
    } else if (message.type === "result") {
      console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("  Session complete");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  }
}

testAvi().catch(console.error);
