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
  tiktok: "bg-black",
};

// Platform Icons
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

type FilterType = "all" | "youtube" | "instagram" | "x" | "medium" | "tiktok";

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

  // TikTok state
  const [tiktokVideos, setTiktokVideos] = useState<ContentItem[]>([]);
  const [tiktokProfile, setTiktokProfile] = useState<{
    username: string;
    displayName: string;
    videoCount: number;
  } | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [tiktokError, setTiktokError] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Check for OAuth callbacks
  useEffect(() => {
    if (searchParams.get("x") === "connected") {
      fetchXData();
    }
    if (searchParams.get("tiktok") === "connected") {
      fetchTiktokData();
    }
    if (searchParams.get("error")) {
      setXError(searchParams.get("error") || "");
      setTiktokError(searchParams.get("error") || "");
    }
    // Check if already connected
    checkXConnection();
    checkTiktokConnection();
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

  const checkTiktokConnection = async () => {
    try {
      const response = await fetch("/api/tiktok");
      const data = await response.json();
      if (data.connected) {
        setTiktokConnected(true);
        setTiktokProfile(data.profile);
        setTiktokVideos(data.videos || []);
      }
    } catch {
      // Not connected
    }
  };

  const fetchTiktokData = async () => {
    setTiktokLoading(true);
    setTiktokError("");

    try {
      const response = await fetch("/api/tiktok");
      const data = await response.json();

      if (data.needsAuth) {
        setTiktokConnected(false);
        return;
      }

      if (data.error) {
        setTiktokError(data.error);
        return;
      }

      if (data.connected && data.profile) {
        setTiktokConnected(true);
        setTiktokProfile(data.profile);
        setTiktokVideos(data.videos || []);
      }
    } catch {
      setTiktokError("Failed to fetch TikTok data");
    } finally {
      setTiktokLoading(false);
    }
  };

  const connectTiktok = () => {
    window.location.href = "/api/auth/tiktok";
  };

  const disconnectTiktok = async () => {
    await fetch("/api/tiktok", { method: "DELETE" });
    setTiktokConnected(false);
    setTiktokProfile(null);
    setTiktokVideos([]);
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
  const allContent = [...youtubeVideos, ...instagramMedia, ...xTweets, ...mediumArticles, ...tiktokVideos];
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

          {(xError || mediumError || tiktokError) && (
            <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-200">{xError || mediumError || tiktokError}</p>
            </div>
          )}

          {/* Platform Connections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* YouTube Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white">
                  <YouTubeIcon />
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
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  <InstagramIcon />
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
                <div className="w-9 h-9 bg-black border border-zinc-700 rounded-lg flex items-center justify-center text-white">
                  <XIcon />
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
                <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white">
                  <MediumIcon />
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

            {/* TikTok Connect */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-black border border-zinc-700 rounded-lg flex items-center justify-center text-white">
                  <TikTokIcon />
                </div>
                <div>
                  <h3 className="font-medium text-sm">TikTok</h3>
                  <p className="text-xs text-zinc-500">
                    {tiktokConnected && tiktokProfile
                      ? `${tiktokVideos.length} videos`
                      : "Connect"}
                  </p>
                </div>
              </div>

              {tiktokConnected ? (
                <div className="flex gap-2">
                  <button
                    onClick={fetchTiktokData}
                    disabled={tiktokLoading}
                    className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs"
                  >
                    {tiktokLoading ? "..." : "Refresh"}
                  </button>
                  <button
                    onClick={disconnectTiktok}
                    className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium text-xs text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectTiktok}
                  className="w-full px-2 py-1.5 bg-black border border-zinc-700 hover:bg-zinc-900 rounded-lg font-medium text-xs"
                >
                  Connect TikTok
                </button>
              )}
            </div>

            {/* LinkedIn - Coming Soon */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 opacity-60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <LinkedInIcon />
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
              {tiktokVideos.length > 0 && (
                <button
                  onClick={() => setActiveFilter("tiktok")}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeFilter === "tiktok"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  TikTok ({tiktokVideos.length})
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
          {filteredContent.length === 0 && !youtubeLoading && !instagramLoading && !xLoading && !mediumLoading && !tiktokLoading && (
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
