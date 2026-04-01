import { createClient } from '@/lib/supabase/server'
import { createAIService, AIProvider } from '@/lib/ai'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, provider = 'anthropic' } = await request.json() as { 
      messages: Message[]
      provider?: AIProvider
    }

    // Get user's API key from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select(provider === 'openai' ? 'openai_key_encrypted' : provider === 'anthropic' ? 'anthropic_key_encrypted' : 'gemini_key_encrypted')
      .eq('id', user.id)
      .single()

    const keyField = provider === 'openai' ? 'openai_key_encrypted' : 
                      provider === 'anthropic' ? 'anthropic_key_encrypted' : 'gemini_key_encrypted'

    const apiKey = (profile?.[keyField as keyof typeof profile] as string | null | undefined) ?? null

    if (!apiKey) {
      return NextResponse.json({ 
        error: `${provider} API key not configured. Please add your API key in Settings.` 
      }, { status: 400 })
    }

    // Get user's memories for context
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Build context from memories
    const memoryContext = memories?.length 
      ? `\n\nContext from your startup memory:\n${memories.map(m => `[${m.type.toUpperCase()}] ${m.title}: ${m.content}`).join('\n')}`
      : ''

    // Get active goals for additional context
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(5)

    const goalsContext = goals?.length
      ? `\n\nYour active goals:\n${goals.map(g => `- [${g.priority.toUpperCase()}] ${g.title}${g.deadline ? ` (Due: ${new Date(g.deadline).toLocaleDateString()})` : ''}`).join('\n')}`
      : ''

    // Inject context into system message or prepend
    const enrichedMessages: Message[] = messages.map((msg, i) => {
      if (i === 0 && msg.role === 'system') {
        return {
          ...msg,
          content: msg.content + memoryContext + goalsContext
        }
      }
      return msg
    })

    // If no system message, prepend one with context
    if (!messages.find(m => m.role === 'system')) {
      enrichedMessages.unshift({
        role: 'system',
        content: `You are Startup Agent, an AI assistant that helps startup founders stay organized and accountable.${memoryContext}${goalsContext}\n\nAlways be concise, actionable, and focused on helping the founder achieve their goals.`
      })
    }

    const aiService = createAIService({ provider, apiKey })
    const response = await aiService.chat(enrichedMessages)

    // Save the conversation
    const conversationId = request.headers.get('x-conversation-id')
    if (conversationId) {
      // Save user message
      const userMessage = messages[messages.length - 1]
      if (userMessage?.role === 'user') {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content
        })
      }

      // Save assistant response
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content
      })
    }

    return NextResponse.json({ 
      content: response.content,
      usage: response.usage
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }, { status: 500 })
  }
}
