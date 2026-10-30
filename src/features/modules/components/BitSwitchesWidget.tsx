import { useState } from 'react';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { Card, Button, Badge } from '../../../components/ui/primitives';

const POWERS = [128, 64, 32, 16, 8, 4, 2, 1];

export function BitSwitchesWidget() {
  const [bits, setBits] = useState<number[]>([1, 1, 0, 0, 0, 0, 0, 0]); // 192 por defecto
  const [challengeTarget, setChallengeTarget] = useState<number | null>(168);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  const decimalValue = bits.reduce((acc, bit, idx) => acc + bit * POWERS[idx], 0);

  const toggleBit = (idx: number) => {
    const next = [...bits];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setBits(next);

    const nextDecimal = next.reduce((acc, bit, i) => acc + bit * POWERS[i], 0);
    if (challengeTarget !== null && nextDecimal === challengeTarget) {
      setChallengeSuccess(true);
    } else {
      setChallengeSuccess(false);
    }
  };

  const newChallenge = () => {
    const randomTargets = [10, 42, 77, 105, 140, 168, 192, 224, 240, 252];
    const pick = randomTargets[Math.floor(Math.random() * randomTargets.length)];
    setChallengeTarget(pick);
    setChallengeSuccess(decimalValue === pick);
  };

  const resetBits = () => {
    setBits([0, 0, 0, 0, 0, 0, 0, 0]);
    setChallengeSuccess(false);
  };

  return (
    <Card title="Laboratorio Interactivo: Interruptores de Bits" icon={<Sparkles className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Haz clic en cada interruptor para encender o apagar los bits de este octeto. Observa cómo la suma posicional
        calcula el decimal en tiempo real.
      </p>

      {/* Reto Interactivo */}
      {challengeTarget !== null && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan/40 bg-cyan/5 p-3">
          <div className="flex items-center gap-2">
            <Trophy className={challengeSuccess ? 'text-emerald' : 'text-amber-400'} size={20} />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Reto de Práctica: </span>
              <span className="font-mono text-sm font-bold text-white">Forma el decimal {challengeTarget}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {challengeSuccess ? (
              <Badge tone="emerald">¡Correcto! +25 XP</Badge>
            ) : (
              <Badge tone="slate">Actual: {decimalValue}</Badge>
            )}
            <Button variant="ghost" onClick={newChallenge} className="text-xs py-1 px-2.5">
              Otro reto
            </Button>
          </div>
        </div>
      )}

      {/* Fila de Interruptores */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {POWERS.map((power, idx) => {
          const isOn = bits[idx] === 1;
          return (
            <button
              key={power}
              onClick={() => toggleBit(idx)}
              type="button"
              className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all ${
                isOn
                  ? 'border-cyan bg-cyan/15 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-white'
                  : 'border-line bg-base/80 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400">2^{7 - idx}</span>
              <span className="font-mono text-base font-bold my-1 text-cyan">{power}</span>
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-lg font-black transition-colors ${
                  isOn ? 'bg-cyan text-slate-950 font-black' : 'bg-line text-slate-500'
                }`}
              >
                {bits[idx]}
              </span>
              <span className="text-[10px] mt-1 text-slate-400 font-medium">{isOn ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
      </div>

      {/* Resultados de la suma */}
      <div className="mt-5 rounded-lg border border-line bg-base/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Suma Ponderada:</span>
            <p className="font-mono text-xs text-slate-300 mt-0.5">
              {POWERS.filter((_, i) => bits[i] === 1).join(' + ') || '0'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wide text-slate-400">Valor Decimal:</span>
            <p className="font-mono text-2xl font-bold text-cyan">{decimalValue}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-3">
          <span className="font-mono text-xs text-slate-400">
            Binario: <span className="font-bold text-violet">{bits.join('')}</span>
          </span>
          <Button variant="ghost" onClick={resetBits} className="text-xs py-1 px-2.5">
            <RotateCcw size={12} className="mr-1" />
            Apagar todos (0)
          </Button>
        </div>
      </div>
    </Card>
  );
}
