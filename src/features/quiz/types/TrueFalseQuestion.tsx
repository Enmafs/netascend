import { useState } from 'react';
import { Button } from '../../../components/ui/primitives';
import { Check, X } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Props {
  disabled?: boolean;
  onSubmit: (ans: boolean) => void;
}

export function TrueFalseQuestion({ disabled = false, onSubmit }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelected(true)}
          className={cn(
            'flex flex-col items-center justify-center p-6 rounded-xl border text-base font-bold transition-all',
            selected === true
              ? 'border-emerald bg-emerald/20 text-emerald shadow-[0_0_16px_rgba(16,185,129,0.3)]'
              : 'border-line bg-surface/60 text-slate-300 hover:border-emerald/40 hover:bg-emerald/5'
          )}
        >
          <Check size={28} className="mb-2 text-emerald" />
          Verdadero
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelected(false)}
          className={cn(
            'flex flex-col items-center justify-center p-6 rounded-xl border text-base font-bold transition-all',
            selected === false
              ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
              : 'border-line bg-surface/60 text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5'
          )}
        >
          <X size={28} className="mb-2 text-rose-500" />
          Falso
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          disabled={disabled || selected === null}
          onClick={() => selected !== null && onSubmit(selected)}
          className="px-6 py-2.5 font-bold"
        >
          Confirmar Respuesta
        </Button>
      </div>
    </div>
  );
}
