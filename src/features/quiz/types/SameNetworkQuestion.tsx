import { useState } from 'react';
import { Button } from '../../../components/ui/primitives';
import { Check, X, Network, Laptop } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Props {
  ipA?: string;
  ipB?: string;
  prefix?: number;
  disabled?: boolean;
  onSubmit: (same: boolean) => void;
}

export function SameNetworkQuestion({ ipA = '', ipB = '', prefix = 24, disabled = false, onSubmit }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="space-y-6">
      {/* Diagrama visual de las 2 máquinas */}
      <div className="p-4 rounded-xl border border-line bg-surface/50 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-cyan/15 border border-cyan/40 flex items-center justify-center text-cyan mb-2">
            <Laptop size={24} />
          </div>
          <span className="text-xs uppercase text-slate-400 font-semibold">Host A</span>
          <span className="font-mono text-sm text-cyan font-bold">{ipA}/{prefix}</span>
        </div>

        <div className="flex flex-col items-center text-slate-500">
          <Network size={28} className="text-slate-400 mb-1" />
          <span className="text-[11px] font-mono">¿Mismo Switch L2?</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-violet/15 border border-violet/40 flex items-center justify-center text-violet mb-2">
            <Laptop size={24} />
          </div>
          <span className="text-xs uppercase text-slate-400 font-semibold">Host B</span>
          <span className="font-mono text-sm text-violet font-bold">{ipB}/{prefix}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelected(true)}
          className={cn(
            'flex flex-col items-center justify-center p-5 rounded-xl border text-sm font-bold transition-all',
            selected === true
              ? 'border-emerald bg-emerald/20 text-emerald shadow-[0_0_16px_rgba(16,185,129,0.3)]'
              : 'border-line bg-surface/60 text-slate-300 hover:border-emerald/40 hover:bg-emerald/5'
          )}
        >
          <Check size={24} className="mb-1.5 text-emerald" />
          Sí, misma red (sin router)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setSelected(false)}
          className={cn(
            'flex flex-col items-center justify-center p-5 rounded-xl border text-sm font-bold transition-all',
            selected === false
              ? 'border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.3)]'
              : 'border-line bg-surface/60 text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/5'
          )}
        >
          <X size={24} className="mb-1.5 text-rose-500" />
          No, redes distintas (requiere router)
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
