import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { decryptFromStorage } from '@/lib/security/encryption';
import { ingestDocument } from '@/lib/rag';

const NOTION_API_VERSION = '2022-06-28';

async function fetchNotionAPI(endpoint: string, accessToken: string) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function getAllPages(accessToken: string): Promise<string[]> {
  const pageIds: string[] = [];
  let cursor: string | undefined;
  
  do {
    const data = await fetchNotionAPI(
      cursor ? `/search?cursor=${cursor}&filter={property:object,value:string}page` : '/search?filter={property:object,value:string}page',
      accessToken
    );
    
    for (const result of data.results) {
      if (result.object === 'page') {
        pageIds.push(result.id);
      }
    }
    
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  
  return pageIds;
}

async function getAllDatabases(accessToken: string): Promise<string[]> {
  const databaseIds: string[] = [];
  let cursor: string | undefined;
  
  do {
    const data = await fetchNotionAPI(
      cursor ? `/search?cursor=${cursor}&filter={property:object,value:string}database` : '/search?filter={property:object,value:string}database',
      accessToken
    );
    
    for (const result of data.results) {
      if (result.object === 'database') {
        databaseIds.push(result.id);
      }
    }
    
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  
  return databaseIds;
}

async function getPageContent(pageId: string, accessToken: string): Promise<string> {
  const blocks: any[] = [];
  let cursor: string | undefined;
  
  do {
    const data = await fetchNotionAPI(
      cursor ? `/blocks/${pageId}/children?cursor=${cursor}` : `/blocks/${pageId}/children`,
      accessToken
    );
    
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  
  return convertBlocksToText(blocks);
}

async function getDatabaseContent(databaseId: string, accessToken: string): Promise<string> {
  const response = await fetchNotionAPI(`/databases/${databaseId}/query`, accessToken);
  
  const lines: string[] = [];
  
  for (const page of response.results) {
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';
    lines.push(`## ${title}`);
    
    for (const [key, prop] of Object.entries(page.properties)) {
      if (key === 'title') continue;
      
      const value = extractPropertyValue(prop);
      if (value) {
        lines.push(`- ${key}: ${value}`);
      }
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

function extractPropertyValue(prop: any): string {
  switch (prop.type) {
    case 'title':
      return prop.title?.map((t: any) => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map((t: any) => t.plain_text).join('') || '';
    case 'number':
      return prop.number?.toString() || '';
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return prop.multi_select?.map((s: any) => s.name).join(', ') || '';
    case 'date':
      return prop.date?.start || '';
    case 'checkbox':
      return prop.checkbox ? 'Yes' : 'No';
    case 'url':
      return prop.url || '';
    case 'email':
      return prop.email || '';
    case 'phone_number':
      return prop.phone_number || '';
    default:
      return '';
  }
}

function convertBlocksToText(blocks: any[]): string {
  const lines: string[] = [];
  
  for (const block of blocks) {
    const text = extractBlockText(block);
    if (text) {
      lines.push(text);
    }
    
    if (block.has_children) {
      const childText = convertBlocksToText(block.children || []);
      if (childText) {
        lines.push(childText);
      }
    }
  }
  
  return lines.join('\n');
}

function extractBlockText(block: any): string {
  const richText = block.rich_text || [];
  const text = richText.map((t: any) => t.plain_text).join('');
  
  switch (block.type) {
    case 'heading_1':
      return `# ${text}`;
    case 'heading_2':
      return `## ${text}`;
    case 'heading_3':
      return `### ${text}`;
    case 'paragraph':
      return text;
    case 'bulleted_list_item':
      return `- ${text}`;
    case 'numbered_list_item':
      return `1. ${text}`;
    case 'to_do':
      return `- [${block.to_do?.checked ? 'x' : ' '}] ${text}`;
    case 'code':
      return `\`\`\`${block.code?.language || ''}\n${text}\n\`\`\``;
    case 'quote':
      return `> ${text}`;
    case 'callout':
      return `> ${text}`;
    default:
      return text;
  }
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
      .eq('provider', 'notion')
      .eq('status', 'connected')
      .single();

    if (!integration) {
      return NextResponse.json({ error: 'Notion not connected' }, { status: 400 });
    }

    const accessToken = decryptFromStorage(integration.access_token_encrypted);
    
    const results = {
      pagesProcessed: 0,
      databasesProcessed: 0,
      documentsCreated: 0,
      errors: [] as string[]
    };

    const pageIds = await getAllPages(accessToken);
    results.pagesProcessed = pageIds.length;

    for (const pageId of pageIds) {
      try {
        const content = await getPageContent(pageId, accessToken);
        
        if (content.trim().length > 50) {
          await ingestDocument(
            user.id,
            `Notion Page ${pageId.slice(0, 8)}`,
            content,
            'notion',
            `https://notion.so/${pageId.replace(/-/g, '')}`,
            { source_id: pageId, type: 'page' }
          );
          results.documentsCreated++;
        }
      } catch (err) {
        results.errors.push(`Failed to process page ${pageId}: ${err}`);
      }
    }

    const databaseIds = await getAllDatabases(accessToken);
    results.databasesProcessed = databaseIds.length;

    for (const databaseId of databaseIds) {
      try {
        const content = await getDatabaseContent(databaseId, accessToken);
        
        if (content.trim().length > 50) {
          await ingestDocument(
            user.id,
            `Notion Database ${databaseId.slice(0, 8)}`,
            content,
            'notion',
            `https://notion.so/${databaseId.replace(/-/g, '')}`,
            { source_id: databaseId, type: 'database' }
          );
          results.documentsCreated++;
        }
      } catch (err) {
        results.errors.push(`Failed to process database ${databaseId}: ${err}`);
      }
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'notion_sync_completed',
      resource_type: 'notion',
      metadata: results,
    });

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Notion sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Notion' },
      { status: 500 }
    );
  }
}
