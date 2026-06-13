import { env } from '../config/env';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  lastPush: string;
  topics: string[];
  hasReadme: boolean;
}

export interface GitHubSnapshot {
  username: string;
  name: string | null;
  publicRepos: number;
  followers: number;
  accountCreated: string;
  languages: Record<string, number>; // lang → repo count
  topRepos: GitHubRepo[];
}

export class GitHubFetchError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'GitHubFetchError';
  }
}

// ── GitHub handle validation regex ───────────────────────────────────────────

const GITHUB_USERNAME_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

// ── In-memory TTL cache (10-minute expiry) ───────────────────────────────────

interface CacheEntry {
  data: GitHubSnapshot;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;

// ── Request headers ──────────────────────────────────────────────────────────

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  return headers;
}

// ── Main fetch function ───────────────────────────────────────────────────────

export async function fetchGitHubSnapshot(
  username: string
): Promise<GitHubSnapshot> {
  // Validate username format
  if (!GITHUB_USERNAME_RE.test(username)) {
    throw new GitHubFetchError(400, `Invalid GitHub username: ${username}`);
  }

  // Check cache
  const cached = cache.get(username);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const headers = buildHeaders();

  const [userRes, repoRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`,
      { headers }
    ),
  ]);

  if (userRes.status === 404) {
    throw new GitHubFetchError(404, `GitHub user '${username}' not found`);
  }
  if (userRes.status === 403) {
    throw new GitHubFetchError(403, 'GitHub API rate limit exceeded');
  }
  if (!userRes.ok) {
    throw new GitHubFetchError(
      userRes.status,
      `GitHub API error: ${userRes.statusText}`
    );
  }

  const user = (await userRes.json()) as {
    name: string | null;
    public_repos: number;
    followers: number;
    created_at: string;
  };

  const repos = repoRes.ok
    ? ((await repoRes.json()) as Array<{
        name: string;
        description: string | null;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        pushed_at: string;
        topics: string[];
      }>)
    : [];

  // Build language frequency map
  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] ?? 0) + 1;
    }
  }

  const snapshot: GitHubSnapshot = {
    username,
    name: user.name,
    publicRepos: user.public_repos,
    followers: user.followers,
    accountCreated: user.created_at,
    languages,
    topRepos: repos.slice(0, 10).map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      lastPush: r.pushed_at,
      topics: r.topics ?? [],
      hasReadme: true, // GitHub doesn't expose this in list API; agent evaluates
    })),
  };

  // Store in cache
  cache.set(username, { data: snapshot, expiresAt: Date.now() + TTL_MS });

  return snapshot;
}
