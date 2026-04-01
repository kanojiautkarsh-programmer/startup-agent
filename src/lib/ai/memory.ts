import { createClient } from '@/lib/supabase/server'

export interface ExtractedMemory {
  type: 'decision' | 'commitment' | 'context' | 'note'
  title: string
  content: string
  metadata?: Record<string, unknown>
}

const DECISION_PATTERNS = [
  /(?:we decided|decision:|decided to|i've decided|we will|we're going to|the plan is to)/i,
  /(?:going with|choosing|selected|picked)/i,
]

const COMMITMENT_PATTERNS = [
  /(?:i'll|i will|we'll|we will|commit to|promise to)/i,
  /(?:by (?:next|this|the end of))/i,
  /(?:deadline:|due:|should complete|finish by)/i,
]

export async function extractAndSaveMemories(
  userId: string,
  content: string,
  conversationId: string
): Promise<ExtractedMemory[]> {
  const supabase = await createClient()
  const memories: ExtractedMemory[] = []

  const lines = content.split('\n').filter(line => line.trim().length > 10)

  for (const line of lines) {
    // Check for decisions
    for (const pattern of DECISION_PATTERNS) {
      if (pattern.test(line)) {
        const memory: ExtractedMemory = {
          type: 'decision',
          title: extractTitle(line),
          content: line.trim()
        }
        memories.push(memory)
        break
      }
    }

    // Check for commitments
    for (const pattern of COMMITMENT_PATTERNS) {
      if (pattern.test(line)) {
        const memory: ExtractedMemory = {
          type: 'commitment',
          title: extractTitle(line),
          content: line.trim(),
          metadata: { conversation_id: conversationId }
        }

        // Extract deadline if present
        const deadlineMatch = line.match(/(?:by|due|deadline:?)\s*((?:next|this|the end of)\s+\w+|\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i)
        if (deadlineMatch) {
          memory.metadata = { ...memory.metadata, mentioned_deadline: deadlineMatch[1] }
        }

        memories.push(memory)
        break
      }
    }
  }

  // Save memories to database
  if (memories.length > 0) {
    const toInsert = memories.map(m => ({
      user_id: userId,
      type: m.type,
      title: m.title,
      content: m.content,
      metadata: m.metadata || null
    }))

    await supabase.from('memories').insert(toInsert)
  }

  return memories
}

function extractTitle(text: string): string {
  // Remove common prefixes and clean up
  let title = text
    .replace(/^(?:-\s*|\d+[.):]\s*|•\s*)/, '')
    .replace(/(?:decision:|commitment:|note:)/i, '')
    .trim()

  // Truncate if too long
  if (title.length > 100) {
    title = title.substring(0, 97) + '...'
  }

  return title || 'Untitled'
}
