export type AIProvider = 'anthropic' | 'openai' | 'gemini'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4-turbo-preview',
  gemini: 'gemini-pro'
}
