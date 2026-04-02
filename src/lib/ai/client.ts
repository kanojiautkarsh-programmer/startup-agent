import { AIConfig, AIProvider, Message, AIResponse, DEFAULT_MODELS } from './types'

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = {
      model: DEFAULT_MODELS[config.provider],
      ...config
    }
  }

  private getHeaders(): Record<string, string> {
    switch (this.config.provider) {
      case 'anthropic':
        return {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        }
      case 'openai':
      case 'github':
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      case 'gemini':
        return {
          'Content-Type': 'application/json'
        }
    }
  }

  private getEndpoint(): string {
    switch (this.config.provider) {
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages'
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions'
      case 'github':
        return 'https://models.github.ai/inference/chat/completions'
      case 'gemini':
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`
    }
  }

  async chat(messages: Message[]): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'anthropic':
        return this.anthropicChat(messages)
      case 'openai':
      case 'github':
        return this.openaiChat(messages)
      case 'gemini':
        return this.geminiChat(messages)
    }
  }

  private formatMessagesForAnthropic(messages: Message[]): { role: string; content: string }[] {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role,
      content: msg.content
    }))
  }

  private async anthropicChat(messages: Message[]): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: 4096,
      messages: this.formatMessagesForAnthropic(chatMessages)
    }

    if (systemMessage) {
      body.system = systemMessage.content
    }

    const response = await fetch(this.getEndpoint(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      usage: {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      }
    }
  }

  private async openaiChat(messages: Message[]): Promise<AIResponse> {
    const body = {
      model: this.config.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 4096
    }

    const response = await fetch(this.getEndpoint(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }

  private async geminiChat(messages: Message[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Gemini requires a user message')
    }

    const contents = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: 4096
      }
    }

    const response = await fetch(this.getEndpoint(), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      content: data.candidates[0].content.parts[0].text
    }
  }
}

export function createAIService(config: AIConfig): AIService {
  return new AIService(config)
}
