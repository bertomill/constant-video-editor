import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Content Studio</h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>

          <div className="space-y-6 max-w-2xl">
            {/* API Keys Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-medium mb-4">API Keys</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    OpenAI API Key (for AI assistant)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-medium mb-4">Connected Accounts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                      <span>▶</span>
                    </div>
                    <span>YouTube</span>
                  </div>
                  <span className="text-zinc-500 text-sm">Not connected</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded flex items-center justify-center">
                      <span>◎</span>
                    </div>
                    <span>Instagram</span>
                  </div>
                  <span className="text-zinc-500 text-sm">Not connected</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="font-bold text-sm">in</span>
                    </div>
                    <span>LinkedIn</span>
                  </div>
                  <span className="text-zinc-500 text-sm">Not connected</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
