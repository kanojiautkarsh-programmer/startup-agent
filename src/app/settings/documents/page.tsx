'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Document {
  id: string
  title: string
  source_type: string
  source_url?: string
  file_name?: string
  file_type?: string
  is_indexed: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null
  })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => {
    fetchDocuments()
  })

  const handleIngest = async () => {
    if (!title.trim() || !content.trim()) {
      setUploadState(prev => ({ ...prev, error: 'Title and content are required' }))
      return
    }

    setUploadState({ uploading: true, progress: 0, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      setUploadState(prev => ({ ...prev, progress: 20 }))

      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          source_type: 'text',
          user_id: user.id
        })
      })

      setUploadState(prev => ({ ...prev, progress: 80 }))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ingest document')
      }

      setUploadState(prev => ({ ...prev, progress: 100 }))
      
      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0, error: null })
        setTitle('')
        setContent('')
        fetchDocuments()
      }, 500)
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }))
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({ ...prev, error: 'File too large (max 5MB)' }))
      return
    }

    setUploadState({ uploading: true, progress: 0, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const text = await file.text()

      setUploadState(prev => ({ ...prev, progress: 30 }))

      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text,
          source_type: 'file',
          metadata: { file_name: file.name, file_type: file.type },
          user_id: user.id
        })
      })

      setUploadState(prev => ({ ...prev, progress: 80 }))

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to ingest document')
      }

      setUploadState(prev => ({ ...prev, progress: 100 }))

      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0, error: null })
        fetchDocuments()
      }, 500)
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-gray-600 mt-1">Manage documents for AI-powered context</p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold">Add Text Content</h2>
        
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text content here..."
            rows={6}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleIngest}
          disabled={uploadState.uploading || !title.trim() || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadState.uploading ? 'Ingesting...' : 'Add to Knowledge Base'}
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold">Upload File</h2>
        <p className="text-sm text-gray-600">Supported: TXT, MD, JSON, CSV (max 5MB)</p>
        
        <input
          type="file"
          accept=".txt,.md,.json,.csv"
          onChange={handleFileUpload}
          disabled={uploadState.uploading}
          className="block w-full text-sm border rounded-lg p-2"
        />

        {uploadState.uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        )}

        {uploadState.error && (
          <p className="text-red-600 text-sm">{uploadState.error}</p>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Your Documents ({documents.length})</h2>
        </div>

        {documents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No documents yet. Add some content to enable AI-powered context.
          </div>
        ) : (
          <ul className="divide-y">
            {documents.map((doc) => (
              <li key={doc.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-sm text-gray-500">
                    {doc.source_type} • {new Date(doc.created_at).toLocaleDateString()}
                    {doc.is_indexed ? ' • Indexed' : ' • Processing...'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
