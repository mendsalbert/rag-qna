import Markdown from '@/components/markdown'
import { sanitizeAssistantContent } from '@/lib/sanitizeContent'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  index?: number
}

export function ChatMessage({ role, content, index = 0 }: ChatMessageProps) {
  const isUser = role === 'user'
  const displayContent = isUser ? content : sanitizeAssistantContent(content)

  return (
    <article
      className={cn('animate-fade-up py-5', isUser ? 'pl-0' : 'pl-0')}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          'relative rounded-xl px-4 py-3.5',
          isUser
            ? 'ml-8 border border-border/50 bg-secondary/50'
            : 'mr-4 border border-border/50 bg-muted/30',
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.14em]',
              isUser ? 'text-muted-foreground' : 'text-primary',
            )}
          >
            {isUser ? 'You' : 'Answer'}
          </span>
        </div>

        <div className={cn('text-[15px] leading-7', isUser ? 'text-foreground/90' : 'text-foreground/85')}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          ) : (
            <Markdown message={displayContent} />
          )}
        </div>
      </div>
    </article>
  )
}
