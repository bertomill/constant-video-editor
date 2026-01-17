"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function CreatePage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI content assistant. I can help you plan videos, write scripts, and suggest edits based on your past content. What would you like to create today?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // Mock AI response (will be replaced with real AI integration)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'd love to help with that! Since you haven't connected your platforms yet, I can't analyze your past content. But I can still help you brainstorm ideas. What topic are you thinking about?",
        },
      ]);
    }, 500);

    setInput("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Content Studio</h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8 flex flex-col h-[calc(100vh-65px)]">
          <h2 className="text-2xl font-semibold mb-6">Create New Content</h2>

          {/* Chat Area */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Describe what you want to create..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleSend}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
