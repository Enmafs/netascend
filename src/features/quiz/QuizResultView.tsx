import { useEffect } from 'react';
import { Trophy, RotateCcw, ArrowRight, BookOpen, Sparkles, XCircle } from 'lucide-react';
import { Card, Button } from '../../components/ui/primitives';
import { fireModuleConfetti } from '../gamification/ConfettiBurst';

interface Props {
  moduleId: number;
  score: number; // 0 a 100
  totalXP: number;
  correctCount: number;
  totalQuestions: number;
  onRetry: () => void;
  onContinue: () => void;
  onReviewTheory: () => void;
}

export function QuizResultView({
  moduleId,
  score,
  totalXP,
  correctCount,
  totalQuestions,
  onRetry,
  onContinue,
  onReviewTheory,
}: Props) {
  const isPassed = score >= 80;

  useEffect(() => {
    if (isPassed) {
      fireModuleConfetti();
    }
  }, [isPassed]);

  return (
    <Card className="max-w-2xl mx-auto border-cyan/40 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Icono de resultado */}
      <div className="flex justify-center">
        {isPassed ? (
          <div className="w-20 h-20 rounded-full bg-cyan/15 border-2 border-cyan flex items-center justify-center text-cyan shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-bounce">
            <Trophy size={40} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-500 flex items-center justify-center text-rose-400">
            <XCircle size={40} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isPassed ? '¡Cuestionario Aprobado!' : 'Cuestionario No Superado'}
        </h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          {isPassed
            ? moduleId < 10
              ? `¡Excelente trabajo! Has demostrado dominio sólido del Módulo ${moduleId} y desbloqueado el Módulo ${moduleId + 1}.`
              : `¡Felicidades! Has completado el Módulo 10 y estás listo para rendir el Examen de Certificación NetAscend.`
            : `Obtuviste un ${score}%. Se requiere al menos un 80% para desbloquear el siguiente módulo. ¡No te desanimes y vuelve a intentarlo!`}
        </p>
      </div>

      {/* Puntuación y Métricas */}
      <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-2">
        <div className="p-3.5 rounded-xl border border-line bg-base/60">
          <span className="text-xs uppercase text-slate-400 font-semibold block">Nota Final</span>
          <span className={`text-2xl font-mono font-bold ${isPassed ? 'text-emerald' : 'text-rose-400'}`}>
            {score}%
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-line bg-base/60">
          <span className="text-xs uppercase text-slate-400 font-semibold block">Aciertos</span>
          <span className="text-2xl font-mono font-bold text-cyan">
            {correctCount}/{totalQuestions}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border border-line bg-base/60">
          <span className="text-xs uppercase text-slate-400 font-semibold block">XP Ganado</span>
          <span className="text-2xl font-mono font-bold text-amber-300 flex items-center justify-center gap-1">
            +{totalXP} <Sparkles size={16} />
          </span>
        </div>
      </div>

      {/* Consejos si no aprobó */}
      {!isPassed && (
        <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-400/5 text-left text-xs text-slate-300 space-y-2">
          <span className="font-bold text-amber-300 uppercase tracking-wide block">
            Puntos clave para repasar antes de reintentar:
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Recuerda: <strong>Salto = 256 − Máscara</strong> del octeto de trabajo.</li>
            <li>La dirección de red siempre es un <strong>múltiplo exacto del salto</strong>.</li>
            <li>En la red, todos los octetos a la derecha del octeto de trabajo se rellenan con <strong>0</strong>.</li>
            <li>Hosts útiles = <strong>Total IPs − 2</strong> (restando Red y Broadcast).</li>
          </ul>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        {isPassed ? (
          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            className="w-full sm:w-auto px-8 py-3 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            {moduleId < 10 ? 'Avanzar al Siguiente Módulo' : 'Ir a la Certificación NetAscend'}
            <ArrowRight size={16} className="ml-2 inline" />
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              onClick={onRetry}
              className="w-full sm:w-auto px-6 py-3 font-bold text-sm"
            >
              <RotateCcw size={16} className="mr-2 inline" />
              Reintentar Cuestionario (Nuevas Preguntas)
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onReviewTheory}
              className="w-full sm:w-auto px-6 py-3 text-sm"
            >
              <BookOpen size={16} className="mr-2 inline" />
              Repasar Teoría del Módulo
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
