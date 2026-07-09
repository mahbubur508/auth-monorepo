'use client';

export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] tracking-widest2 text-ink-soft">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-ink/10 bg-white px-3.5 py-2.5 font-body text-sm text-ink shadow-sm outline-none transition placeholder:text-ink-soft/50 focus:border-brass"
      />
    </label>
  );
}

export function Button({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-body text-sm font-medium text-ivory transition hover:bg-vault-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ivory/30 border-t-brass" />
          Working…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Alert({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div
      className={[
        'mb-5 rounded-lg border px-3.5 py-2.5 font-body text-sm',
        kind === 'error' && 'border-rust/20 bg-rust/5 text-rust',
        kind === 'success' && 'border-sage/20 bg-sage/5 text-sage',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 font-mono text-[11px] tracking-widest2 text-brass-dim">{children}</p>;
}
