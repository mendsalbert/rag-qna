'use client'

import { ChatMessage } from '@/components/chat-message'
import { FileUploadZone } from '@/components/file-upload-zone'
import { TypingIndicator } from '@/components/typing-indicator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useChat } from 'ai/react'
import { AlertCircle, ArrowUp, BookOpen, Loader2, MessageSquareText, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const SUGGESTIONS = [
  'What are the main topics covered?',
  'Summarize the key points',
  'What details did I save about this?',
]

type BackendStats = {
  status: 'ok' | 'needs_config' | 'error'
  configured: boolean
  missing: string[]
  chunkCount: number
  tableReady: boolean
  sources: string[]
  provider?: 'gemini'
  error?: string
}

export default function Page() {
  const { toast } = useToast()
  const [knowledge, setKnowledge] = useState('')
  const [isIngesting, setIsIngesting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [stats, setStats] = useState<BackendStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const refreshStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await fetch('/api/stats')
      const data = (await response.json()) as BackendStats
      setStats(data)
    } catch {
      setStats({
        status: 'error',
        configured: false,
        missing: [],
        chunkCount: 0,
        tableReady: false,
        sources: [],
        error: 'Could not reach backend',
      })
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  const { messages, handleSubmit, input, handleInputChange, isLoading, append } = useChat({
    onError: (error) => {
      toast({
        variant: 'destructive',
        description: error.message || 'Chat request failed.',
      })
    },
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function uploadFile(file: File) {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/learn/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not upload file')
      }

      toast({
        description: `Indexed ${file.name} (${data.chunksAdded} chunks).`,
      })
      await refreshStats()
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Could not upload file.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function ingestKnowledge(event: React.FormEvent) {
    event.preventDefault()

    if (!knowledge.trim()) {
      toast({
        variant: 'destructive',
        description: 'Add some text first.',
      })
      return
    }

    setIsIngesting(true)

    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        body: JSON.stringify({ message: knowledge }),
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not save content')
      }

      toast({
        description: `Indexed ${data.chunksAdded} chunks into Neon.`,
      })
      setKnowledge('')
      await refreshStats()
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Could not save content.',
      })
    } finally {
      setIsIngesting(false)
    }
  }

  async function clearCorpus() {
    if (!confirm('Clear all saved content from the vector store?')) {
      return
    }

    setIsClearing(true)

    try {
      const response = await fetch('/api/corpus', { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Could not clear corpus')
      }

      toast({
        description: `Removed ${data.deleted} chunks.`,
      })
      await refreshStats()
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Could not clear corpus.',
      })
    } finally {
      setIsClearing(false)
    }
  }

  function handleChatKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input.trim() && !isLoading) {
        event.currentTarget.closest('form')?.requestSubmit()
      }
    }
  }

  const wordCount = knowledge.trim() ? knowledge.trim().split(/\s+/).length : 0
  const backendReady = stats?.status === 'ok'
  const needsConfig = stats?.status === 'needs_config'
  const chunkCount = stats?.chunkCount ?? 0

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 shadow-[0_0_24px_-4px_hsl(34_92%_58%_/_0.35)]">
              <BookOpen className="size-4 text-primary" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="font-display text-xl font-medium tracking-tight text-foreground">Corpus</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Personal knowledge base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {chunkCount > 0 && (
              <button
                type="button"
                onClick={clearCorpus}
                disabled={isClearing || !backendReady}
                className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive sm:flex"
              >
                {isClearing ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                Clear
              </button>
            )}

            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">
              <span className="relative flex size-1.5">
                {backendReady ? (
                  <>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </>
                ) : (
                  <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
                )}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {statsLoading
                  ? 'Connecting…'
                  : backendReady
                    ? `${chunkCount} chunk${chunkCount === 1 ? '' : 's'}`
                    : needsConfig
                      ? 'Needs .env'
                      : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {needsConfig && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-3">
          <div className="mx-auto flex max-w-[1400px] items-start gap-3 lg:px-10">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div className="text-sm leading-relaxed text-foreground/85">
              <p className="font-medium text-amber-200/90">Backend not configured</p>
              <p className="mt-1 text-muted-foreground">
                Copy <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">.env.example</code> to{' '}
                <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">.env</code> and add{' '}
                {stats?.missing.join(', ') || 'POSTGRES_URL, GOOGLE_API_KEY'}. Then run{' '}
                <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">npm run init-db</code> and{' '}
                <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">npm run seed</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid w-full max-w-[1400px] flex-1 gap-5 px-6 py-6 lg:grid-cols-2 lg:gap-6 lg:px-10 lg:py-8">
        <section className="panel flex min-h-[520px] flex-col lg:min-h-[calc(100vh-8.5rem)]">
          <div className="panel-header">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Sparkles className="size-3.5 text-primary" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium tracking-tight">Feed the corpus</h2>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Paste text or upload a file. We chunk it, embed it, and keep it searchable in Neon.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={ingestKnowledge} className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
            <FileUploadZone
              disabled={needsConfig}
              isUploading={isUploading}
              onUpload={uploadFile}
            />

            <div className="composer flex flex-1 flex-col overflow-hidden">
              <Textarea
                id="knowledge"
                value={knowledge}
                placeholder="Paste anything — meeting notes, research, specs, transcripts…"
                className="min-h-[280px] flex-1 resize-none border-0 bg-transparent px-4 py-4 text-[15px] leading-7 shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 lg:min-h-0"
                onChange={(event) => setKnowledge(event.target.value)}
                disabled={needsConfig}
              />

              <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {wordCount > 0 ? `${wordCount.toLocaleString()} words` : 'Waiting for content'}
                </span>
                <Button
                  type="submit"
                  disabled={isIngesting || !knowledge.trim() || needsConfig}
                  className="h-9 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-[0_0_20px_-4px_hsl(34_92%_58%_/_0.5)] hover:bg-primary/90"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Indexing…
                    </>
                  ) : (
                    'Save & index'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </section>

        <section className="panel flex min-h-[520px] flex-col lg:min-h-[calc(100vh-8.5rem)]">
          <div className="panel-header">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <MessageSquareText className="size-3.5 text-primary" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium tracking-tight">Ask anything</h2>
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  LangChain retrieves the top matches from pgvector, then streams a grounded answer.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
                  <MessageSquareText className="size-6 text-muted-foreground/70" strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg text-foreground/80">
                  {chunkCount > 0 ? 'Corpus ready — ask away' : 'Nothing indexed yet'}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {chunkCount > 0
                    ? 'Try one of these questions:'
                    : 'Save some content on the left, then try one of these:'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => append({ role: 'user', content: suggestion })}
                      disabled={needsConfig || (chunkCount === 0 && !backendReady)}
                      className="rounded-full border border-border/70 bg-secondary/40 px-3.5 py-1.5 text-xs text-secondary-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground disabled:opacity-40"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pb-2 pt-1">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id ?? index}
                    role={message.role}
                    content={message.content}
                    index={index}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border/60 px-6 py-4">
            <form onSubmit={handleSubmit}>
              <div className="composer flex items-end gap-2 p-2">
                <Textarea
                  id="message"
                  name="prompt"
                  value={input}
                  rows={1}
                  onChange={handleInputChange}
                  onKeyDown={handleChatKeyDown}
                  placeholder={
                    needsConfig
                      ? 'Configure .env to enable chat…'
                      : 'Ask a question about your saved content…'
                  }
                  className="min-h-[44px] max-h-32 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] leading-6 shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={needsConfig}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || needsConfig}
                  size="icon"
                  className="size-10 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4" strokeWidth={2.25} />
                  )}
                </Button>
              </div>
              <p className="mt-2.5 px-1 font-mono text-[10px] tracking-wide text-muted-foreground/70">
                Enter to send · Shift+Enter for new line · Gemini
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
