"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string | null;
  views?: number;
  likes?: number;
  platform: string;
  mediaType?: string;
  permalink?: string;
}

const platformColors: Record<string, string> = {
  youtube: "bg-red-600",
  instagram: "bg-gradient-to-br from-purple-600 to-pink-500",
  x: "bg-black",
  medium: "bg-emerald-600",
  linkedin: "bg-blue-600",
};

type FilterType = "all" | "youtube" | "instagram" | "x" | "medium";

function ContentPageInner() {
  const searchParams = useSearchParams();

  // YouTube state
  const [youtubeVideos, setYoutubeVideos] = useState<ContentItem[]>([]);
  const [youtubeChannel, setYoutubeChannel] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");

  // Instagram state
  const [instagramMedia, setInstagramMedia] = useState<ContentItem[]>([]);
  const [instagramProfile, setInstagramProfile] = useState<{
    username: string;
    mediaCount: number;
  } | null>(null);
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramInput, setInstagramInput] = useState("");
  const [instagramError, setInstagramError] = useState("");

  // X state
  const [xTweets, setXTweets] = useState<ContentItem[]>([]);
  const [xProfile, setXProfile] = useState<{
    username: string;
    name: string;
    tweetCount: number;
  } | null>(null);
  const [xLoading, setXLoading] = useState(false);
  const [xConnected, setXConnected] = useState(false);
  const [xError, setXError] = useState("");

  // Medium state
  const [mediumArticles, setMediumArticles] = useState<ContentItem[]>([]);
  const [mediumProfile, setMediumProfile] = useState<{
    username: string;
    articleCount: number;
  } | null>(null);
  const [mediumLoading, setMediumLoading] = useState(false);
  const [mediumInput, setMediumInput] = useState("");
  const [mediumError, setMediumError] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Check for OAuth callbacks
  useEffect(() => {
    if (searchParams.get("x") === "connected") {
      fetchXData();
    }
    if (searchParams.get("error")) {
      setXError(searchParams.get("error") || "");
    }
    // Check if already connected
    checkXConnection();
  }, [searchParams]);

  const checkXConnection = async () => {
    try {
      const response = await fetch("/api/x");
      const data = await response.json();
      if (data.connected) {
        setXConnected(true);
        setXProfile(data.profile);
        setXTweets(data.tweets || []);
      }
    } catch {
      // Not connected
    }
  };

  const fetchXData = async () => {
    setXLoading(true);
    setXError("");

    try {
      const response = await fetch("/api/x");
      const data = await response.json();

      if (data.needsAuth) {
        setXConnected(false);
        return;
      }

      if (data.error) {
        setXError(data.error);
        return;
      }

      if (data.connected && data.profile) {
        setXConnected(true);
        setXProfile(data.profile);
        setXTweets(data.tweets || []);
      }
    } catch {
      setXError("Failed to fetch X data");
    } finally {
      setXLoading(false);
    }
  };

  const connectX = () => {
    window.location.href = "/api/auth/x";
  };

  const disconnectX = async () => {
    await fetch("/api/x", { method: "DELETE" });
    setXConnected(false);
    setXProfile(null);
    setXTweets([]);
  };

  const fetchInstagramMedia = async () => {
    if (!instagramInput.trim()) return;

    setInstagramLoading(true);
    setInstagramError("");

    try {
      const response = await fetch("/api/instagram");
      const data = await response.json();

      if (data.error) {
        setInstagramError(data.error);
        return;
      }

      if (data.connected && data.profile) {
        setInstagramProfile(data.profile);
        setInstagramMedia(data.media || []);
      }
    } catch {
      setInstagramError("Failed to fetch Instagram data");
    } finally {
      setInstagramLoading(false);
    }
  };

  const fetchYouTubeVideos = async () => {
    if (!youtubeInput.trim()) return;

    setYoutubeLoading(true);

    try {
      const response = await fetch(
        `/api/youtube?username=${encodeURIComponent(youtubeInput)}`
      );
      const data = await response.json();

      if (data.error) {
        return;
      }

      setYoutubeVideos(data.videos);
      setYoutubeChannel(data.channel);
    } catch {
      // handle error silently
    } finally {
      setYoutubeLoading(false);
    }
  };

  const fetchMediumArticles = async () => {
    if (!mediumInput.trim()) return;

    setMediumLoading(true);
    setMediumError("");

    try {
      const response = await fetch(
        `/api/medium?username=${encodeURIComponent(mediumInput)}`
      );
      const data = await response.json();

      if (data.error) {
        setMediumError(data.error);
        return;
      }

      setMediumProfile(data.profile);
      setMediumArticles(data.articles || []);
    } catch {
      setMediumError("Failed to fetch Medium articles");
    } finally {
      setMediumLoading(false);
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Combine and filter content
  const allContent = [...youtubeVideos, ...instagramMedia, ...xTweets, ...mediumArticles];
  const filteredContent =
    activeFilter === "all"
      ? allContent
      : allContent.filter((item) => item.platform === activeFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Content Studio</h1>
      </header>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Content Library</h2>
          </div>

          {(xError || mediumError) && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-200">{xError || mediumError}</p>
            </div>
          )}

          {/* Platform Connections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* YouTube Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg">▶</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">YouTube</h3>
                  <p className="text-xs text-zinc-500">
                    {youtubeChannel
                      ? `${youtubeVideos.length} videos`
                      : "Import videos"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchYouTubeVideos()}
                  placeholder="@username"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-xs"
                />
                <button
                  onClick={fetchYouTubeVideos}
                  disabled={youtubeLoading}
                  className="px-2 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 rounded-lg font-medium text-xs"
                >
                  {youtubeLoading ? "..." : "Go"}
                </button>
              </div>
            </div>

            {/* Instagram Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">◎</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Instagram</h3>
                  <p className="text-xs text-zinc-500">
                    {instagramProfile
                      ? `${instagramMedia.length} posts`
                      : instagramError || "Import posts"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={instagramInput}
                  onChange={(e) => setInstagramInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchInstagramMedia()}
                  placeholder="@username"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-xs"
                />
                <button
                  onClick={fetchInstagramMedia}
                  disabled={instagramLoading}
                  className="px-2 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-zinc-700 disabled:to-zinc-700 rounded-lg font-medium text-xs"
                >
                  {instagramLoading ? "..." : "Go"}
                </button>
              </div>
            </div>

            {/* X Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-black border border-zinc-700 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">𝕏</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">X</h3>
                  <p className="text-xs text-zinc-500">
                    {xConnected && xProfile
                      ? `${xTweets.length} posts`
                      : "Connect"}
                  </p>
                </div>
              </div>

              {xConnected ? (
                <div className="flex gap-2">
                  <button
                    onClick={fetchXData}
                    disabled={xLoading}
                    className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs"
                  >
                    {xLoading ? "..." : "Refresh"}
                  </button>
                  <button
                    onClick={disconnectX}
                    className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectX}
                  className="w-full px-2 py-1.5 bg-black border border-zinc-700 hover:bg-zinc-900 rounded-lg font-medium text-xs"
                >
                  Connect X
                </button>
              )}
            </div>

            {/* Medium Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-lg font-serif font-bold">M</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Medium</h3>
                  <p className="text-xs text-zinc-500">
                    {mediumProfile
                      ? `${mediumArticles.length} articles`
                      : "Import articles"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediumInput}
                  onChange={(e) => setMediumInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchMediumArticles()}
                  placeholder="@username"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-xs"
                />
                <button
                  onClick={fetchMediumArticles}
                  disabled={mediumLoading}
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-lg font-medium text-xs"
                >
                  {mediumLoading ? "..." : "Go"}
                </button>
              </div>
            </div>

            {/* LinkedIn - Coming Soon */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 opacity-60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">in</span>
                </div>
                <div>
                  <h3 className="font-medium text-sm">LinkedIn</h3>
                  <p className="text-xs text-zinc-500">Coming soon</p>
                </div>
              </div>

              <button
                disabled
                className="w-full px-2 py-1.5 bg-zinc-700 rounded-lg font-medium text-xs text-zinc-500 cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          {allContent.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeFilter === "all"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                All ({allContent.length})
              </button>
              {youtubeVideos.length > 0 && (
                <button
                  onClick={() => setActiveFilter("youtube")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeFilter === "youtube"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  YouTube ({youtubeVideos.length})
                </button>
              )}
              {instagramMedia.length > 0 && (
                <button
                  onClick={() => setActiveFilter("instagram")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeFilter === "instagram"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Instagram ({instagramMedia.length})
                </button>
              )}
              {xTweets.length > 0 && (
                <button
                  onClick={() => setActiveFilter("x")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeFilter === "x"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  X ({xTweets.length})
                </button>
              )}
              {mediumArticles.length > 0 && (
                <button
                  onClick={() => setActiveFilter("medium")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeFilter === "medium"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Medium ({mediumArticles.length})
                </button>
              )}
            </div>
          )}

          {/* Content Grid */}
          {filteredContent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => (
                <div
                  key={`${item.platform}-${item.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer"
                  onClick={() => {
                    if (item.platform === "youtube") {
                      window.open(
                        `https://youtube.com/watch?v=${item.id}`,
                        "_blank"
                      );
                    } else if (item.permalink) {
                      window.open(item.permalink, "_blank");
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-zinc-800 relative">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-4">
                        <p className="text-zinc-500 text-sm text-center line-clamp-4">
                          {item.description || "No preview"}
                        </p>
                      </div>
                    )}
                    {item.mediaType && (
                      <span className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        {item.mediaType}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full ${platformColors[item.platform]}`}
                      />
                      <span className="text-xs text-zinc-500 capitalize">
                        {item.platform === "x" ? "X" : item.platform}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2 line-clamp-2 text-sm">
                      {item.title}
                    </h3>
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>{formatDate(item.publishedAt)}</span>
                      {item.views !== undefined && item.views > 0 && (
                        <span>{formatViews(Number(item.views))} views</span>
                      )}
                      {item.likes !== undefined && item.likes > 0 && !item.views && (
                        <span>{formatViews(Number(item.likes))} likes</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredContent.length === 0 && !youtubeLoading && !instagramLoading && !xLoading && !mediumLoading && (
            <div className="text-center py-16">
              <p className="text-zinc-500 mb-4">No content yet</p>
              <p className="text-zinc-600 text-sm">
                Connect your platforms above to import your content
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>}>
      <ContentPageInner />
    </Suspense>
  );
}
