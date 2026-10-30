import { TriangleAlert, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CopyButton } from './CopyButton';

export function Card({
  title,
  icon,
  children,
  className,
  action,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface/80 p-4 shadow-lg backdrop-blur sm:p-5', className)}>
      {title && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

type Tone = 'cyan' | 'emerald' | 'violet' | 'amber' | 'slate';

const toneClasses: Record<Tone, string> = {
  cyan: 'border-cyan/40 bg-cyan/10 text-cyan',
  emerald: 'border-emerald/40 bg-emerald/10 text-emerald',
  violet: 'border-violet/40 bg-violet/10 text-violet',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  slate: 'border-line bg-slate-800/60 text-slate-300',
};

export function Badge({ children, tone = 'slate', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}

export function ResultRow({
  label,
  value,
  tone,
  copy = true,
  hint,
}: {
  label: string;
  value: string;
  tone?: Tone;
  copy?: boolean;
  hint?: string;
}) {
  const valueColor =
    tone === 'cyan' ? 'text-cyan' : tone === 'emerald' ? 'text-emerald' : tone === 'violet' ? 'text-violet' : tone === 'amber' ? 'text-amber-300' : 'text-slate-100';
  return (
    <div className="rounded-lg border border-line bg-base/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        {copy && <CopyButton value={value} label={label} />}
      </div>
      <p className={cn('mt-1 break-all font-mono text-base font-semibold', valueColor)}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
      <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function WarnBox({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
      <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

const inputBase =
  'w-full rounded-lg border border-line bg-base px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-600 ' +
  'focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan aria-[invalid=true]:border-red-500/70 aria-[invalid=true]:ring-red-500/40';

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} spellCheck={false} autoComplete="off" />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'resize-y', props.className)} spellCheck={false} />;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'primary'
          ? 'bg-cyan text-slate-950 hover:bg-cyan/80'
          : 'border border-line text-slate-300 hover:border-cyan/60 hover:text-cyan',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
