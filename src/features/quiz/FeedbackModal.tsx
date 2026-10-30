import type { EvaluationResult, Question } from '../../lib/quiz/types';
import { Card, Button, Badge } from '../../components/ui/primitives';
import { StepByStep } from '../../components/calculator/StepByStep';
import { BoxVisualizer } from '../../components/visualizer/BoxVisualizer';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

interface Props {
  evaluation: EvaluationResult;
  question: Question;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function FeedbackModal({ evaluation, question, isLastQuestion, onNext }: Props) {
  const { isCorrect, scoreRatio, feedbackMessage, trap } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl my-8">
        <Card
          className={cn(
            'border-2 shadow-2xl overflow-hidden',
            isCorrect ? 'border-emerald/60 bg-surface' : 'border-rose-500/60 bg-surface'
          )}
        >
          {/* Encabezado del feedback */}
          <div className="flex items-center gap-3 border-b border-line pb-4 mb-4">
            {isCorrect ? (
              <div className="w-10 h-10 rounded-full bg-emerald/20 flex items-center justify-center text-emerald shrink-0">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <XCircle size={24} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
                {isCorrect && (
                  <Badge tone="emerald" className="ml-auto">
                    +XP ganado <Sparkles size={12} className="ml-1 inline" />
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {isCorrect
                  ? 'Has demostrado dominio preciso de este cálculo.'
                  : `Precisión obtenida: ${Math.round(scoreRatio * 100)}%`}
              </p>
            </div>
          </div>

          {/* Detección de trampa conceptual */}
          {trap?.isTrap && (
            <div className="mb-4 p-4 rounded-xl border border-amber-400/50 bg-amber-400/10 text-amber-200 flex items-start gap-3">
              <AlertTriangle size={20} className="shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1 text-xs">
                <strong className="text-amber-300 font-bold block uppercase tracking-wider">
                  Trampa Conceptual Detectada
                </strong>
                <p className="leading-relaxed">{trap.message}</p>
              </div>
            </div>
          )}

          {/* Mensaje de retroalimentación general */}
          <div className="mb-5 p-3.5 rounded-xl border border-line bg-base/60 text-sm text-slate-200 leading-relaxed font-sans">
            {feedbackMessage}
          </div>

          {/* Explicación y resolución con los 5 Pasos si hay subnetData */}
          {question.subnetData && (
            <div className="mb-6 space-y-3">
              <h4 className="text-xs uppercase font-bold text-cyan tracking-wider">
                Resolución Detallada con el Método de los 5 Pasos:
              </h4>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-line bg-base/80 p-4">
                <StepByStep result={question.subnetData} />
              </div>
            </div>
          )}

          {/* Si no hay subnetData pero hay stepByStepDetails */}
          {!question.subnetData && question.stepByStepDetails && (
            <div className="mb-6 space-y-2">
              <h4 className="text-xs uppercase font-bold text-cyan tracking-wider">
                Visualizador de Cajas de Subred:
              </h4>
              <BoxVisualizer
                ip={question.stepByStepDetails.ip}
                prefix={question.stepByStepDetails.prefix}
                network={question.stepByStepDetails.network}
                salto={question.stepByStepDetails.salto}
                workingOctet={question.stepByStepDetails.workingOctet}
              />
            </div>
          )}

          {/* Botón de continuación */}
          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={onNext}
              className="px-6 py-3 font-bold text-sm"
              autoFocus
            >
              {isLastQuestion ? 'Ver Resultados del Cuestionario' : 'Siguiente Pregunta'}
              <ArrowRight size={16} className="ml-2 inline" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
