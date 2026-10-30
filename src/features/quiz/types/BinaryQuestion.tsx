import { useState } from 'react';
import { Button, TextInput } from '../../../components/ui/primitives';
import { Send } from 'lucide-react';
import { cn } from '../../../lib/cn';

interface Props {
  disabled?: boolean;
  onSubmit: (ans: string) => void;
}

export function BinaryQuestion({ disabled = false, onSubmit }: Props) {
  // 8 bits interactivos con interruptores + input directo
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [textVal, setTextVal] = useState('');

  const weights = [128, 64, 32, 16, 8, 4, 2, 1];

  const toggleBit = (index: number) => {
    if (disabled) return;
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    setBits(next);
    setTextVal(next.join(''));
  };

  const handleTextChange = (val: string) => {
    setTextVal(val);
    const clean = val.replace(/[^01]/g, '').slice(0, 8);
    if (clean.length === 8) {
      setBits(clean.split('').map(Number));
    }
  };

  const currentBinary = textVal.trim() || bits.join('');

  return (
    <div className="space-y-5">
      {/* Botones de bits interactivos */}
      <div>
        <span className="text-xs uppercase font-bold text-slate-400 block mb-2">
          Haz clic para alternar los 8 bits (o escribe directamente abajo):
        </span>
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {weights.map((weight, i) => {
            const isOn = bits[i] === 1;
            return (
              <button
                key={weight}
                type="button"
                disabled={disabled}
                onClick={() => toggleBit(i)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border font-mono transition-all',
                  isOn
                    ? 'border-cyan bg-cyan/20 text-cyan shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'border-line bg-surface/80 text-slate-500 hover:text-slate-300'
                )}
              >
                <span className="text-[10px] text-slate-400">{weight}</span>
                <span className="text-base font-bold mt-0.5">{bits[i]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <TextInput
          value={currentBinary}
          onChange={(e) => handleTextChange(e.target.value)}
          disabled={disabled}
          placeholder="ej. 10101000"
          className="text-center font-mono tracking-widest text-base py-2"
        />
        <Button
          type="button"
          variant="primary"
          disabled={disabled || !currentBinary}
          onClick={() => onSubmit(currentBinary)}
          className="shrink-0 px-5"
        >
          <Send size={16} className="mr-1.5" />
          Responder
        </Button>
      </div>
    </div>
  );
}
