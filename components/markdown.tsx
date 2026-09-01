import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  message: string
}

const Markdown = ({ message }: MarkdownProps) => {
  return (
    <ReactMarkdown
      components={{
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:decoration-primary"
            >
              {children}
            </a>
          )
        },
        code({ className, children, ...props }) {
          const isBlock = className?.includes('language-')
          if (isBlock) {
            return (
              <code className={clsx('font-mono text-[13px]', className)} {...props}>
                {children}
              </code>
            )
          }
          return (
            <code
              className="rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[13px] text-primary/90"
              {...props}
            >
              {children}
            </code>
          )
        },
        pre({ children }) {
          return (
            <pre className="my-4 overflow-x-auto rounded-lg border border-border/60 bg-background/70 p-4 font-mono text-[13px] leading-6">
              {children}
            </pre>
          )
        },
      }}
      className={clsx(
        'prose prose-invert prose-sm max-w-none break-words',
        'prose-p:my-3 prose-p:leading-7 prose-p:text-foreground/85',
        'prose-headings:font-display prose-headings:font-normal prose-headings:text-foreground',
        'prose-strong:text-foreground prose-strong:font-medium',
        'prose-li:my-1 prose-li:text-foreground/85',
        'prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground',
      )}
    >
      {message}
    </ReactMarkdown>
  )
}

export default Markdown
