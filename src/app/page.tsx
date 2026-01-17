import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Content Studio</h1>
      </header>

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-semibold mb-6">Connected Platforms</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* YouTube Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">▶</span>
                </div>
                <div>
                  <h3 className="font-medium">YouTube</h3>
                  <p className="text-sm text-zinc-500">Not connected</p>
                </div>
              </div>
              <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                Connect
              </button>
            </div>

            {/* Instagram Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">◎</span>
                </div>
                <div>
                  <h3 className="font-medium">Instagram</h3>
                  <p className="text-sm text-zinc-500">Not connected</p>
                </div>
              </div>
              <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                Connect
              </button>
            </div>

            {/* LinkedIn Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">in</span>
                </div>
                <div>
                  <h3 className="font-medium">LinkedIn</h3>
                  <p className="text-sm text-zinc-500">Not connected</p>
                </div>
              </div>
              <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">
                Connect
              </button>
            </div>
          </div>

          {/* AI Assistant Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-medium mb-4">AI Assistant</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Connect your platforms to unlock AI-powered content analysis, script writing, and edit suggestions.
            </p>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-zinc-500 text-sm italic">
                &quot;Based on your top performing videos, I suggest starting with a hook about...&quot;
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
