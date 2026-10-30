import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Respaldo para contextos sin Clipboard API (HTTP, iframes, navegadores viejos).
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Botón de copiar con confirmación visual durante 2 segundos. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = async () => {
    const ok = await writeToClipboard(value);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'Copiado' : `Copiar ${label ?? value}`}
      title={copied ? 'Copiado' : 'Copiar'}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-line px-2 text-xs transition-colors',
        'text-slate-400 hover:border-cyan/60 hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan',
        copied && 'border-emerald/60 text-emerald hover:border-emerald/60 hover:text-emerald',
        className,
      )}
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      <span>{copied ? 'Copiado' : 'Copiar'}</span>
    </button>
  );
}
