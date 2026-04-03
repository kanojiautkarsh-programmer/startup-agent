import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decryptFromStorage } from '@/lib/security/encryption';
import { ingestDocument } from '@/lib/rag';

async function fetchGitHubAPI(endpoint: string, accessToken: string) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'github')
      .eq('status', 'connected')
      .single();

    if (!integration) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    const accessToken = decryptFromStorage(integration.access_token_encrypted);
    const username = integration.metadata?.github_username;
    
    const results = {
      reposProcessed: 0,
      issuesProcessed: 0,
      prsProcessed: 0,
      documentsCreated: 0,
      errors: [] as string[]
    };

    const repos = await fetchGitHubAPI(`/user/repos?per_page=30&sort=updated`, accessToken) as any[];

    for (const repo of repos.slice(0, 10)) {
      try {
        results.reposProcessed++;
        
        const issues = await fetchGitHubAPI(
          `/repos/${repo.full_name}/issues?state=all&per_page=20`,
          accessToken
        ) as any[];

        for (const issue of issues.slice(0, 5)) {
          results.issuesProcessed++;
          
          if (issue.title && issue.body) {
            const content = `
# ${issue.title}

## Details
- Number: #${issue.number}
- State: ${issue.state}
- Author: @${issue.user?.login}
- Labels: ${issue.labels?.map((l: any) => l.name).join(', ') || 'None'}
- Created: ${issue.created_at}
- Updated: ${issue.updated_at}

## Description
${issue.body}

## Comments
${issue.comments > 0 ? `This issue has ${issue.comments} comments` : 'No comments'}
`.trim();

            await ingestDocument(
              user.id,
              `[Issue] ${repo.name} #${issue.number}: ${issue.title}`,
              content,
              'url',
              issue.html_url,
              { repo: repo.name, type: 'issue', issue_number: issue.number }
            );
            results.documentsCreated++;
          }
        }

        const prs = await fetchGitHubAPI(
          `/repos/${repo.full_name}/pulls?state=all&per_page=10`,
          accessToken
        ) as any[];

        for (const pr of prs.slice(0, 3)) {
          results.prsProcessed++;
          
          if (pr.title && pr.body) {
            const content = `
# ${pr.title}

## Details
- Number: #${pr.number}
- State: ${pr.state}
- Author: @${pr.user?.login}
- Branch: ${pr.head?.ref} → ${pr.base?.ref}
- Created: ${pr.created_at}
- Updated: ${pr.updated_at}
- Mergeable: ${pr.mergeable}

## Description
${pr.body}

## Stats
- Comments: ${pr.comments}
- Review comments: ${pr.review_comments}
- Additions: +${pr.additions}
- Deletions: -${pr.deletions}
`.trim();

            await ingestDocument(
              user.id,
              `[PR] ${repo.name} #${pr.number}: ${pr.title}`,
              content,
              'url',
              pr.html_url,
              { repo: repo.name, type: 'pull_request', pr_number: pr.number }
            );
            results.documentsCreated++;
          }
        }
      } catch (err) {
        results.errors.push(`Failed to process ${repo.full_name}: ${err}`);
      }
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'github_sync_completed',
      resource_type: 'github',
      metadata: results,
    });

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub' },
      { status: 500 }
    );
  }
}
