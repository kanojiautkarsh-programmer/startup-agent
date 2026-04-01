export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted: string | null
          anthropic_key_encrypted: string | null
          gemini_key_encrypted: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted?: string | null
          anthropic_key_encrypted?: string | null
          gemini_key_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          openai_key_encrypted?: string | null
          anthropic_key_encrypted?: string | null
          gemini_key_encrypted?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          type: 'decision' | 'commitment' | 'context' | 'note'
          title: string
          content: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'decision' | 'commitment' | 'context' | 'note'
          title: string
          content: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'decision' | 'commitment' | 'context' | 'note'
          title?: string
          content?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          deadline: string | null
          status: 'active' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          deadline?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          deadline?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_end?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Memory = Database['public']['Tables']['memories']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
