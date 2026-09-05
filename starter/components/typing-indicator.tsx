export function TypingIndicator() {
  return (
    <div className="animate-fade-up py-5">
      <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-primary animate-pulse-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </span>
        <span className="font-mono text-xs tracking-wide text-muted-foreground">Searching your corpus</span>
      </div>
    </div>
  )
}
