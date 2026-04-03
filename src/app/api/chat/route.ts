import { createClient } from '@/lib/supabase/server'
import { createAIService, AIProvider } from '@/lib/ai'
import { NextRequest, NextResponse } from 'next/server'
import { Message } from '@/lib/ai/types'
import { checkChatRateLimit, sanitizeError } from '@/lib/security-utils'
import { buildContextFromDocuments } from '@/lib/rag'

const VALID_PROVIDERS: AIProvider[] = ['anthropic', 'openai', 'gemini', 'github'];
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES = 50;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimit = await checkChatRateLimit(user.id);
    if (!rateLimit.passed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, provider = 'anthropic' } = body as { 
      messages: Message[]
      provider?: AIProvider
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages (max ${MAX_MESSAGES})` },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.content?.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    if (!VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid AI provider' },
        { status: 400 }
      );
    }

    const keyField = provider === 'openai' ? 'openai_key_encrypted' : 
                      provider === 'anthropic' ? 'anthropic_key_encrypted' : 
                      provider === 'github' ? 'github_key_encrypted' : 'gemini_key_encrypted'

    const { data: profile } = await supabase
      .from('profiles')
      .select(keyField)
      .eq('id', user.id)
      .single()

    const apiKey = (profile?.[keyField as keyof typeof profile] as string | null | undefined) ?? null

    if (!apiKey) {
      return NextResponse.json({ 
        error: `${provider} API key not configured. Please add your API key in Settings.` 
      }, { status: 400 })
    }

    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const memoryContext = memories?.length 
      ? `\n\nContext from your startup memory:\n${memories.map(m => `[${m.type.toUpperCase()}] ${m.title}: ${m.content}`).join('\n')}`
      : ''

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

    let ragContext = '';
    try {
      ragContext = await buildContextFromDocuments(user.id, lastMessage.content, 2000);
    } catch (ragError) {
      console.error('RAG context error:', ragError);
    }

    const ragContextSection = ragContext
      ? `\n\nRelevant documents from your knowledge base:\n${ragContext}`
      : ''

    const enrichedMessages: Message[] = messages.map((msg, i) => {
      if (i === 0 && msg.role === 'system') {
        return {
          ...msg,
          content: msg.content.slice(0, 4000) + memoryContext + goalsContext + ragContextSection
        }
      }
      return msg
    })

    if (!messages.find(m => m.role === 'system')) {
      enrichedMessages.unshift({
        role: 'system',
        content: `You are a startup assistant that helps founders stay organized and accountable.${memoryContext}${goalsContext}${ragContextSection}\n\nAlways be concise, actionable, and focused on helping the founder achieve their goals.`
      })
    }

    const aiService = createAIService({ provider, apiKey })
    const response = await aiService.chat(enrichedMessages)

    const conversationId = request.headers.get('x-conversation-id')
    if (conversationId) {
      const userMessage = messages[messages.length - 1]
      if (userMessage?.role === 'user') {
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content.slice(0, MAX_MESSAGE_LENGTH)
        })
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content.slice(0, MAX_MESSAGE_LENGTH * 2)
      })
    }

    return NextResponse.json({ 
      content: response.content,
      usage: response.usage
    })
  } catch (error) {
    return NextResponse.json({ 
      error: sanitizeError(error)
    }, { status: 500 })
  }
}
