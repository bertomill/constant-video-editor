import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("Starting test agent...\n");

  for await (const message of query({
    prompt: "What files are in the src/app directory? Give me a brief summary.",
    options: {
      allowedTools: ["Glob", "Read"],
      permissionMode: "bypassPermissions"  // Read-only, safe to auto-approve
    }
  })) {
    // Print Claude's reasoning
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text);
        } else if ("name" in block) {
          console.log(`\n[Tool: ${block.name}]\n`);
        }
      }
    } else if (message.type === "result") {
      console.log(`\n✓ Done: ${message.subtype}`);
    }
  }
}

main().catch(console.error);
