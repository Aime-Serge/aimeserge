"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Loader2,
  ExternalLink,
  Settings,
} from "lucide-react";

interface SyndicationStatus {
  id: string;
  platform: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
  externalUrl?: string;
  publishedAt?: string;
  error?: string;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: "ARTICLE" | "POST" | "PROJECT" | "RESEARCH";
  createdAt: string;
  updatedAt: string;
  syndicationStatus: SyndicationStatus[];
}

const PLATFORMS = [
  {
    name: "Medium",
    key: "MEDIUM",
    icon: "M",
    color: "bg-gray-900",
    url: "https://medium.com",
  },
  {
    name: "Dev.to",
    key: "DEV_TO",
    icon: "≡",
    color: "bg-black",
    url: "https://dev.to",
  },
  {
    name: "LinkedIn",
    key: "LINKEDIN",
    icon: "in",
    color: "bg-blue-700",
    url: "https://linkedin.com",
  },
  {
    name: "Hashnode",
    key: "HASHNODE",
    icon: "H",
    color: "bg-blue-600",
    url: "https://hashnode.com",
  },
];

export default function SyndicationDashboard() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyndicating, setIsSyndicating] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );
  const [globalMetrics, setGlobalMetrics] = useState({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/admin/syndication/content", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setContents(data.content || []);

        // Calculate global metrics
        let totalViews = 0,
          totalLikes = 0,
          totalShares = 0,
          totalComments = 0;
        data.content?.forEach((item: ContentItem) => {
          item.syndicationStatus?.forEach((status) => {
            totalViews += status.views || 0;
            totalLikes += status.likes || 0;
            totalShares += status.shares || 0;
            totalComments += status.comments || 0;
          });
        });

        setGlobalMetrics({
          views: totalViews,
          likes: totalLikes,
          shares: totalShares,
          comments: totalComments,
        });
      }
    } catch (error) {
      console.error("Failed to load content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyndicate = async (contentId: string, platforms: string[]) => {
    setIsSyndicating(true);
    try {
      const response = await fetch("/api/v1/admin/syndicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentType: "ARTICLE",
          platforms,
        }),
      });

      if (response.ok) {
        // Refresh content status
        await loadContent();
      }
    } catch (error) {
      console.error("Syndication error:", error);
    } finally {
      setIsSyndicating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "text-emerald-500 bg-emerald-500/10";
      case "SCHEDULED":
        return "text-cyan-500 bg-cyan-500/10";
      case "FAILED":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-slate-500 bg-slate-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "SCHEDULED":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Content Syndication</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "overview"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-cyan-600 text-white"
                : "bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Active Platforms Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            {PLATFORMS.map((platform) => {
              const publishedCount = contents.filter((c) =>
                c.syndicationStatus.some(
                  (s) => s.platform === platform.key && s.status === "PUBLISHED"
                )
              ).length;
              return (
                <div
                  key={platform.key}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-6"
                >
                  <div
                    className={`${platform.color} inline-flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold mb-4`}
                  >
                    {platform.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{platform.name}</h3>
                  <p className="text-2xl font-bold text-cyan-400">{publishedCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Published Posts</p>
                </div>
              );
            })}
          </div>

          {/* Global Syndication Metrics */}
          <div className="grid gap-4 md:grid-cols-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-white">{globalMetrics.views.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Total Likes</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{globalMetrics.likes.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Total Shares</span>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{globalMetrics.shares.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Total Comments</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">{globalMetrics.comments.toLocaleString()}</p>
            </div>
          </div>

          {/* Content Distribution Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <div className="bg-slate-900/40 p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                Content Distribution
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Manage syndication for your articles, posts, and projects
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800">
                  <tr className="bg-slate-900/20">
                    <th className="text-left px-6 py-3 text-slate-400 font-medium">
                      Title
                    </th>
                    <th className="text-left px-6 py-3 text-slate-400 font-medium">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-slate-400 font-medium">
                      Syndication Status
                    </th>
                    <th className="text-right px-6 py-3 text-slate-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-slate-500 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading content...
                        </p>
                      </td>
                    </tr>
                  ) : contents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-slate-500">
                          No published articles found. Write and publish your first article to start syndicating!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    contents.map((content) => (
                      <tr key={content.id} className="hover:bg-slate-900/40 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {content.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(content.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-slate-800/50 text-cyan-400 px-2 py-1 rounded">
                            {content.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {PLATFORMS.map((platform) => {
                              const status = content.syndicationStatus.find(
                                (s) => s.platform === platform.key
                              );
                              return (
                                <button
                                  key={platform.key}
                                  onClick={() =>
                                    status?.externalUrl && window.open(status.externalUrl, "_blank")
                                  }
                                  disabled={!status || status.status !== "PUBLISHED"}
                                  title={`${platform.name}: ${status?.status || "Not syndicated"}`}
                                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
                                    status
                                      ? `${getStatusColor(status.status)} cursor-pointer hover:opacity-80`
                                      : "bg-slate-800/50 text-slate-600"
                                  }`}
                                >
                                  {status ? (
                                    getStatusIcon(status.status)
                                  ) : (
                                    <span className="text-[10px] font-bold">
                                      {platform.icon}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              handleSyndicate(
                                content.id,
                                PLATFORMS.map((p) => p.key)
                              )
                            }
                            disabled={isSyndicating}
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 px-3 py-2 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSyndicating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Syndicate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Platform Configuration
          </h3>
          <p className="text-slate-400 mb-8">
            Configure API keys and settings for each syndication platform
          </p>

          <div className="space-y-6">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.key}
                className="rounded-lg border border-slate-800/50 bg-slate-800/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`${platform.color} h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {platform.name}
                      </h4>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center gap-1 mt-1"
                      >
                        Visit Platform <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-slate-700 rounded-full cursor-pointer"></div>
                </div>
                <p className="text-sm text-slate-400">
                  Enable automatic syndication to {platform.name}. Requires API
                  key configuration.
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              How Content Syndication Works
            </h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>
                ✓ Automatically publish your blog posts, articles, and projects
                to multiple platforms
              </li>
              <li>
                ✓ Each syndicated post includes a canonical URL back to your
                site for SEO
              </li>
              <li>
                ✓ Track engagement metrics (views, likes, shares) across all
                platforms
              </li>
              <li>
                ✓ Expand your reach and establish authority in your field
              </li>
              <li>
                ✓ Drive organic traffic back to your primary portfolio site
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
