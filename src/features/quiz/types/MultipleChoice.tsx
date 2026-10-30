import { useState } from 'react';
import { Button } from '../../../components/ui/primitives';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Props {
  options: string[];
  disabled?: boolean;
  onSubmit: (selected: string) => void;
}

export function MultipleChoice({ options, disabled = false, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    if (disabled) return;
    setSelected(opt);
  };

  const handleConfirm = () => {
    if (!selected || disabled) return;
    onSubmit(selected);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option, idx) => {
          const isSelected = selected === option;
          return (
            <button
              key={`${option}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(option)}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border text-left text-sm transition-all',
                'focus:outline-none focus:ring-2 focus:ring-cyan/50',
                isSelected
                  ? 'border-cyan bg-cyan/15 text-white font-medium shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'border-line bg-surface/60 text-slate-300 hover:border-slate-700 hover:bg-surface'
              )}
            >
              {isSelected ? (
                <CheckCircle2 size={18} className="text-cyan shrink-0" />
              ) : (
                <Circle size={18} className="text-slate-500 shrink-0" />
              )}
              <span className="font-mono">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          disabled={disabled || !selected}
          onClick={handleConfirm}
          className="px-6 py-2.5"
        >
          Confirmar Respuesta
        </Button>
      </div>
    </div>
  );
}
