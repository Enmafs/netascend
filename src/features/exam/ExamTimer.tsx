import { useEffect, useState } from 'react';
import { Clock, Infinity as InfinityIcon, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  timed: boolean;
  initialSeconds?: number;
  isFinished?: boolean;
  onTimeUp: () => void;
}

export function ExamTimer({
  timed,
  initialSeconds = 45 * 60,
  isFinished = false,
  onTimeUp,
}: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds, timed]);

  useEffect(() => {
    if (!timed || isFinished) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timed, isFinished, onTimeUp]);

  if (!timed) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300">
        <InfinityIcon className="h-3.5 w-3.5 text-cyan" />
        <span>Modo Sin Límite de Tiempo</span>
      </div>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isCritical = secondsLeft <= 60;
  const isWarning = secondsLeft > 60 && secondsLeft <= 300;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-xs font-bold transition-colors ${
        isCritical
          ? 'border-rose-500/60 bg-rose-500/15 text-rose-300 animate-pulse'
          : isWarning
            ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
            : 'border-cyan/30 bg-slate-900/90 text-cyan'
      }`}
      title="Tiempo restante para finalizar la evaluación"
    >
      {isCritical || isWarning ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" />
      )}
      <span>{formatted}</span>
    </div>
  );
}
