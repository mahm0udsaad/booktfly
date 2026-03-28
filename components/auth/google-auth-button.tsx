import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type GoogleAuthButtonProps = {
  label: string
  onClick: () => void | Promise<void>
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function GoogleAuthButton({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  className,
}: GoogleAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 py-4 text-base font-bold text-foreground shadow-sm transition-all duration-200 hover:border-border/80 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-70',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <GoogleLogo className="h-5 w-5 shrink-0" />
      )}
      <span>{label}</span>
    </button>
  )
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v2.99h3.87c2.27-2.09 3.57-5.18 3.57-8.63Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-2.99c-1.07.72-2.44 1.14-4.08 1.14-3.13 0-5.78-2.11-6.73-4.95H1.27v3.08A12 12 0 0 0 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.27 14.3A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.3V6.62H1.27A12 12 0 0 0 0 12c0 1.93.46 3.75 1.27 5.38l4-3.08Z"
        fill="#FBBC04"
      />
      <path
        d="M12 4.77c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.62l4 3.08c.95-2.84 3.6-4.93 6.73-4.93Z"
        fill="#EA4335"
      />
    </svg>
  )
}
