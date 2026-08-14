import { ContentSyndication, SyndicationConfig, SyndicationPlatform } from "@/core/domain/portfolio/types";

/**
 * Syndication Service - Manages multi-platform content distribution
 * Handles posting to Medium, Dev.to, LinkedIn, and other platforms with tracking
 */

interface SyndicationAdapterInterface {
  authenticate(): Promise<boolean>;
  publish(content: SyndicationContent): Promise<SyndicationResult>;
  getMetrics(externalId: string): Promise<SyndicationMetrics>;
}

interface SyndicationContent {
  title: string;
  excerpt?: string;
  content: string;
  tags: string[];
  coverImageUrl?: string;
  canonicalUrl?: string;
  authorBio?: string;
  cta?: {
    text: string;
    url: string;
  };
}

interface SyndicationResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
}

interface SyndicationMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

class MediumAdapter implements SyndicationAdapterInterface {
  private apiKey: string;
  private authorId?: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("https://api.medium.com/v1/me", {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.authorId = data.data.id;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Medium authentication failed:", error);
      return false;
    }
  }

  async publish(content: SyndicationContent): Promise<SyndicationResult> {
    if (!this.authorId) {
      return { success: false, error: "Not authenticated with Medium" };
    }

    try {
      const publishedContent = `${content.content}\n\n---\n\n*Originally published on [aimeserge.com](${content.canonicalUrl})*${
        content.authorBio ? `\n\n${content.authorBio}` : ""
      }${
        content.cta
          ? `\n\n[${content.cta.text}](${content.cta.url})`
          : ""
      }`;

      const response = await fetch(
        `https://api.medium.com/v1/users/${this.authorId}/posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: content.title,
            contentFormat: "markdown",
            content: publishedContent,
            tags: content.tags,
            publishStatus: "published",
            canonicalUrl: content.canonicalUrl,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          externalId: data.data.id,
          externalUrl: data.data.url,
        };
      }

      return { success: false, error: "Failed to publish to Medium" };
    } catch (error) {
      return {
        success: false,
        error: `Medium syndication error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getMetrics(externalId: string): Promise<SyndicationMetrics> {
    // Medium API doesn't provide detailed metrics in free tier
    // This would require Premium integration
    return { views: 0, likes: 0, shares: 0, comments: 0 };
  }
}

class DevToAdapter implements SyndicationAdapterInterface {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("https://dev.to/api/users/me", {
        headers: {
          "api-key": this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Dev.to authentication failed:", error);
      return false;
    }
  }

  async publish(content: SyndicationContent): Promise<SyndicationResult> {
    try {
      const publishedContent = `${content.content}\n\n---\n\n*Originally published on [aimeserge.com](${content.canonicalUrl})*${
        content.authorBio ? `\n\n${content.authorBio}` : ""
      }${
        content.cta
          ? `\n\n[${content.cta.text}](${content.cta.url})`
          : ""
      }`;

      const response = await fetch("https://dev.to/api/articles", {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: {
            title: content.title,
            body_markdown: publishedContent,
            tags: content.tags,
            canonical_url: content.canonicalUrl,
            cover_image: content.coverImageUrl,
            published: true,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          externalId: String(data.id),
          externalUrl: data.url,
        };
      }

      return { success: false, error: "Failed to publish to Dev.to" };
    } catch (error) {
      return {
        success: false,
        error: `Dev.to syndication error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getMetrics(externalId: string): Promise<SyndicationMetrics> {
    try {
      const response = await fetch(`https://dev.to/api/articles/${externalId}`, {
        headers: {
          "api-key": this.apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          views: data.page_views_count || 0,
          likes: data.positive_reactions_count || 0,
          shares: data.public_reactions_count || 0,
          comments: data.comments_count || 0,
        };
      }
    } catch (error) {
      console.error("Failed to fetch Dev.to metrics:", error);
    }

    return { views: 0, likes: 0, shares: 0, comments: 0 };
  }
}

class LinkedInAdapter implements SyndicationAdapterInterface {
  private accessToken: string;
  private personId?: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.personId = data.id;
        return true;
      }
      return false;
    } catch (error) {
      console.error("LinkedIn authentication failed:", error);
      return false;
    }
  }

  async publish(content: SyndicationContent): Promise<SyndicationResult> {
    if (!this.personId) {
      return { success: false, error: "Not authenticated with LinkedIn" };
    }

    try {
      // LinkedIn supports article sharing with preview
      const articleContent = `${content.title}\n\n${content.content}`;

      const response = await fetch(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            author: `urn:li:person:${this.personId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: content.excerpt || content.title,
                },
                shareMediaCategory: "ARTICLE",
                media: [
                  {
                    status: "READY",
                    description: {
                      text: content.excerpt || content.title,
                    },
                    originalUrl: content.canonicalUrl,
                    title: {
                      text: content.title,
                    },
                    ...(content.coverImageUrl && {
                      thumbnails: [
                        {
                          resolvedUrl: content.coverImageUrl,
                        },
                      ],
                    }),
                  },
                ],
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          externalId: data.id,
          externalUrl: `https://www.linkedin.com/feed/update/${data.id}`,
        };
      }

      return { success: false, error: "Failed to publish to LinkedIn" };
    } catch (error) {
      return {
        success: false,
        error: `LinkedIn syndication error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async getMetrics(externalId: string): Promise<SyndicationMetrics> {
    // LinkedIn engagement metrics require additional API calls
    // This is simplified - full implementation would fetch engagement data
    return { views: 0, likes: 0, shares: 0, comments: 0 };
  }
}

export class ContentSyndicationService {
  private adapters: Map<SyndicationPlatform, SyndicationAdapterInterface> = new Map();
  private configs: Map<SyndicationPlatform, SyndicationConfig> = new Map();

  constructor(configs: SyndicationConfig[]) {
    configs.forEach((config) => {
      this.configs.set(config.platform, config);

      if (!config.enabled || !config.apiKey) return;

      switch (config.platform) {
        case "MEDIUM":
          this.adapters.set("MEDIUM", new MediumAdapter(config.apiKey));
          break;
        case "DEV_TO":
          this.adapters.set("DEV_TO", new DevToAdapter(config.apiKey));
          break;
        case "LINKEDIN":
          this.adapters.set("LINKEDIN", new LinkedInAdapter(config.apiKey));
          break;
      }
    });
  }

  async publishToAll(
    content: SyndicationContent,
    platforms?: SyndicationPlatform[]
  ): Promise<Map<SyndicationPlatform, SyndicationResult>> {
    const results = new Map<SyndicationPlatform, SyndicationResult>();

    const targetPlatforms = platforms ||
      Array.from(this.adapters.keys());

    for (const platform of targetPlatforms) {
      const adapter = this.adapters.get(platform);
      if (!adapter) {
        results.set(platform, {
          success: false,
          error: `Adapter not configured for ${platform}`,
        });
        continue;
      }

      const isAuthenticated = await adapter.authenticate();
      if (!isAuthenticated) {
        results.set(platform, {
          success: false,
          error: `Authentication failed for ${platform}`,
        });
        continue;
      }

      const result = await adapter.publish(content);
      results.set(platform, result);
    }

    return results;
  }

  async getMetrics(
    platform: SyndicationPlatform,
    externalId: string
  ): Promise<SyndicationMetrics | null> {
    const adapter = this.adapters.get(platform);
    if (!adapter) return null;

    return adapter.getMetrics(externalId);
  }

  isConfigured(platform: SyndicationPlatform): boolean {
    const config = this.configs.get(platform);
    return config?.enabled ?? false;
  }
}
