import { NextRequest, NextResponse } from 'next/server';

interface GitHubRelease {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    published_at: string;
    html_url: string;
    author: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const owner = searchParams.get('owner') || 'your-github-username';
        const repo = searchParams.get('repo') || 'ai-ivr-v2';
        const limit = parseInt(searchParams.get('limit') || '5');

        // GitHub API endpoint for releases
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`;

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

        const releases: GitHubRelease[] = await response.json();

        // Transform the data for our frontend
        const transformedReleases = releases.map(release => ({
            id: release.id,
            tag_name: release.tag_name,
            name: release.name,
            body: release.body,
            draft: release.draft,
            prerelease: release.prerelease,
            published_at: release.published_at,
            html_url: release.html_url,
            author: {
                login: release.author.login,
                avatar_url: release.author.avatar_url,
                html_url: release.author.html_url,
            },
        }));

        return NextResponse.json({
            releases: transformedReleases,
            repository: {
                owner,
                name: repo,
                url: `https://github.com/${owner}/${repo}`,
            },
            total: transformedReleases.length,
        });

    } catch (error) {
        console.error('Error fetching GitHub releases:', error);

        return NextResponse.json({
            error: 'Internal server error',
            message: 'Failed to fetch GitHub releases',
            releases: [],
        }, { status: 500 });
    }
}