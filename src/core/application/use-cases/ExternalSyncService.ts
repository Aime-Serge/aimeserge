import { upsertKnowledge } from "@/core/domain/ai/mutations";

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  language: string;
}

export class ExternalSyncService {
  private static GITHUB_USERNAME = "AimeSerge";

  /**
   * Syncs GitHub repositories to the AI knowledge base.
   */
  async syncGitHub() {
    console.log(`📡 Fetching GitHub data for ${ExternalSyncService.GITHUB_USERNAME}...`);
    try {
      const response = await fetch(`https://api.github.com/users/${ExternalSyncService.GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
      if (!response.ok) throw new Error("GitHub API failed");
      
      const repos: GitHubRepo[] = await response.json();
      
      for (const repo of repos) {
        const content = `GitHub Repository: ${repo.name}\nDescription: ${repo.description || 'No description'}\nURL: ${repo.html_url}\nLast Updated: ${repo.updated_at}\nStars: ${repo.stargazers_count}\nPrimary Language: ${repo.language}`;
        
        await upsertKnowledge({
          id: `github-repo-${repo.name}`,
          content,
          metadata: {
            type: 'github',
            title: repo.name,
            url: repo.html_url
          }
        });
      }
      
      return { success: true, count: repos.length };
    } catch (error) {
      console.error("GitHub Sync Error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Syncs LinkedIn posts (Mocked for now as LinkedIn API requires OAuth/Partner access)
   */
  async syncLinkedIn() {
    console.log(`📡 Fetching LinkedIn data for Aime Serge...`);
    // In a real scenario, this would use an API or a specialized scraper service.
    // For this portfolio, we'll ground it in the latest known updates.
    const mockPosts = [
      {
        id: 'li-post-1',
        content: "Excited to share that I've been appointed as an ALX Ventures Rwanda Ambassador! Looking forward to supporting the next generation of tech leaders.",
        date: '2026-05-01'
      },
      {
        id: 'li-post-2',
        content: "Just completed a deep dive into Zero-Trust architectures on GCP. Security is not a feature, it's a foundation.",
        date: '2026-04-25'
      }
    ];

    try {
      for (const post of mockPosts) {
        await upsertKnowledge({
          id: post.id,
          content: `LinkedIn Post: ${post.content}\nDate: ${post.date}`,
          metadata: {
            type: 'social',
            platform: 'linkedin',
            date: post.date
          }
        });
      }
      return { success: true, count: mockPosts.length };
    } catch (error) {
      console.error("LinkedIn Sync Error:", error);
      return { success: false, error };
    }
  }

  /**
   * Performs a full external synchronization.
   */
  async syncAll() {
    const gh = await this.syncGitHub();
    const li = await this.syncLinkedIn();
    
    return {
      github: gh,
      linkedin: li,
      timestamp: new Date().toISOString()
    };
  }
}
