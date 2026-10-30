import { useState } from 'react';
import type { MatchingPair } from '../../../lib/quiz/types';
import { Button } from '../../../components/ui/primitives';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Props {
  pairs?: MatchingPair[];
  disabled?: boolean;
  onSubmit: (userPairs: Record<string, string>) => void;
}

export function MatchingQuestion({ pairs = [], disabled = false, onSubmit }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const leftItems = pairs.map((p) => p.left);
  const [rightItems] = useState<string[]>(() => {
    const arr = pairs.map((p) => p.right);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Evitar que queden exactamente en el mismo orden original si hay más de 1 par
    if (arr.length > 1 && arr.every((val, idx) => val === pairs[idx].right)) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  });

  const handleLeftClick = (left: string) => {
    if (disabled) return;
    setSelectedLeft(left);
  };

  const handleRightClick = (right: string) => {
    if (disabled || !selectedLeft) return;
    setMatches((prev) => ({ ...prev, [selectedLeft]: right }));
    setSelectedLeft(null);
  };

  const handleResetPair = (left: string) => {
    if (disabled) return;
    setMatches((prev) => {
      const copy = { ...prev };
      delete copy[left];
      return copy;
    });
  };

  const isComplete = leftItems.every((item) => matches[item]);

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-400">
        Haz clic en un elemento de la columna izquierda y luego en su correspondiente de la derecha:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna Izquierda */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-cyan tracking-wider">Prefijo / Concepto</span>
          {leftItems.map((left) => {
            const isSelected = selectedLeft === left;
            const matchedRight = matches[left];
            return (
              <div key={left} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleLeftClick(left)}
                  className={cn(
                    'flex-1 p-3 rounded-lg border font-mono text-sm text-left transition-all',
                    isSelected
                      ? 'border-cyan bg-cyan/20 text-white font-bold ring-2 ring-cyan/40'
                      : matchedRight
                      ? 'border-emerald/50 bg-emerald/10 text-emerald'
                      : 'border-line bg-surface hover:border-slate-700 text-slate-200'
                  )}
                >
                  {left}
                  {matchedRight && (
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      → <strong className="text-white">{matchedRight}</strong>
                    </span>
                  )}
                </button>
                {matchedRight && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleResetPair(left)}
                    className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1"
                    title="Desvincular"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Columna Derecha */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-violet tracking-wider">Salto / Máscara</span>
          {rightItems.map((right) => {
            const isUsed = Object.values(matches).includes(right);
            return (
              <button
                key={right}
                type="button"
                disabled={disabled}
                onClick={() => handleRightClick(right)}
                className={cn(
                  'w-full p-3 rounded-lg border font-mono text-sm text-left transition-all',
                  isUsed
                    ? 'border-emerald/40 bg-emerald/5 text-slate-400 opacity-60'
                    : selectedLeft
                    ? 'border-violet/60 bg-violet/10 text-violet hover:bg-violet/20 ring-1 ring-violet/40'
                    : 'border-line bg-surface text-slate-300'
                )}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="primary"
          disabled={disabled || !isComplete}
          onClick={() => onSubmit(matches)}
          className="px-6 py-2.5 font-bold"
        >
          <Check size={16} className="mr-1.5" />
          Confirmar Emparejamiento
        </Button>
      </div>
    </div>
  );
}
