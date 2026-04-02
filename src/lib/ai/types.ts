export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'github'

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
  gemini: 'gemini-pro',
  github: 'openai/gpt-4o'
}

export const GITHUB_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/o1-preview', name: 'o1 Preview', provider: 'OpenAI' },
  { id: 'openai/o1-mini', name: 'o1 Mini', provider: 'OpenAI' },
  { id: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo', name: 'Llama 3.2 Vision', provider: 'Meta' },
  { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'mistralai/Mistral-Nemo', name: 'Mistral Nemo', provider: 'Mistral' },
]
