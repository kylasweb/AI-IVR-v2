import { NextRequest, NextResponse } from 'next/server';

interface GitHubCommit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
    };
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    } | null;
    html_url: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const owner = searchParams.get('owner') || 'your-github-username';
        const repo = searchParams.get('repo') || 'ai-ivr-v2';
        const limit = parseInt(searchParams.get('limit') || '10');

        // GitHub API endpoint for commits
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AI-IVR-Admin/1.0',
                // Add GitHub token if available for higher rate limits
                // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({
                    error: 'Repository not found',
                    message: `Could not find repository ${owner}/${repo}`
                }, { status: 404 });
            }

            if (response.status === 403) {
                return NextResponse.json({
                    error: 'Rate limit exceeded',
                    message: 'GitHub API rate limit exceeded. Please try again later.'
                }, { status: 403 });
            }

            throw new Error(`GitHub API error: ${response.status}`);
        }

        const commits: GitHubCommit[] = await response.json();

        // Transform the data for our frontend
        const transformedCommits = commits.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
                name: commit.commit.author.name,
                email: commit.commit.author.email,
                login: commit.author?.login || commit.commit.author.name,
                avatar_url: commit.author?.avatar_url || null,
            },
            date: commit.commit.author.date,
            html_url: commit.html_url,
            short_sha: commit.sha.substring(0, 7),
        }));

        return NextResponse.json({
            commits: transformedCommits,
            repository: {
                owner,
                name: repo,
                url: `https://github.com/${owner}/${repo}`,
            },
            total: transformedCommits.length,
        });

    } catch (error) {
        console.error('Error fetching GitHub commits:', error);

        return NextResponse.json({
            error: 'Internal server error',
            message: 'Failed to fetch GitHub commits',
            commits: [],
        }, { status: 500 });
    }
}