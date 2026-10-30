import { useState, useCallback } from 'react';
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Award,
  RotateCcw,
  FileCheck2,
  XCircle,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { Question, EvaluationResult } from '../../lib/quiz/types';
import {
  generateCertificationExam,
  EXAM_CATEGORIES,
} from '../../lib/quiz/generator';
import { evaluateAnswer } from '../../lib/quiz/evaluator';
import { QuestionCard } from '../quiz/QuestionCard';
import { ExamTimer } from './ExamTimer';
import { CertificateModal } from './CertificateModal';
import { fireCertificationConfetti } from '../gamification/ConfettiBurst';
import { generateVerificationCode } from '../../lib/certificate';
import { useProgress } from '../../state/ProgressContext';
import { Badge, Button } from '../../components/ui/primitives';

interface ExamContainerProps {
  initialTimed?: boolean;
  onExit: () => void;
}

function formatAnswerValue(val: unknown): string {
  if (val === undefined || val === null) return 'Sin respuesta';
  if (typeof val === 'boolean') return val ? 'Sí / Verdadero' : 'No / Falso';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if ('networkAddress' in obj && 'broadcastAddress' in obj) {
      return `Red: ${obj.networkAddress} | 1ra: ${obj.firstUsableIP} | Últ: ${obj.lastUsableIP} | Bcast: ${obj.broadcastAddress}`;
    }
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(', ');
  }
  return String(val);
}

export function ExamContainer({ initialTimed = true, onExit }: ExamContainerProps) {
  const { addXp, rank } = useProgress();

  const [timed] = useState<boolean>(initialTimed);
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateCertificationExam()
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResult>>({});
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showCertificateView, setShowCertificateView] = useState<boolean>(true);
  const [verificationCode, setVerificationCode] = useState<string>(() =>
    generateVerificationCode()
  );
  const [issueDate] = useState<string>(() =>
    new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  );

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(evaluations).length;
  const flaggedCount = Object.values(flaggedIds).filter(Boolean).length;

  const finalizeExam = useCallback(
    (currentEvals: Record<string, EvaluationResult>) => {
      setIsSubmitted(true);
      setShowConfirmModal(false);

      const totalCorrect = Object.values(currentEvals).filter(
        (e) => e.isCorrect
      ).length;
      const pct = Math.round((totalCorrect / questions.length) * 100);

      if (pct >= 85) {
        addXp(500);
        fireCertificationConfetti();
        setShowCertificateView(true);
      } else {
        addXp(120);
        setShowCertificateView(false);
      }
    },
    [addXp, questions.length]
  );

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
      finalizeExam(evaluations);
    }
  }, [isSubmitted, evaluations, finalizeExam]);

  const handleAnswer = (userAnswer: unknown) => {
    if (!currentQ || isSubmitted) return;
    const result = evaluateAnswer(currentQ, userAnswer);
    const updated = { ...evaluations, [currentQ.id]: result };
    setEvaluations(updated);

    // Buscar la siguiente pregunta sin responder
    let nextIdx = -1;
    for (let offset = 1; offset < questions.length; offset++) {
      const candidateIdx = (currentIndex + offset) % questions.length;
      const candidateQ = questions[candidateIdx];
      if (!updated[candidateQ.id]) {
        nextIdx = candidateIdx;
        break;
      }
    }

    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
    } else if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleRetryExam = () => {
    setQuestions(generateCertificationExam());
    setCurrentIndex(0);
    setEvaluations({});
    setFlaggedIds({});
    setIsSubmitted(false);
    setShowConfirmModal(false);
    setVerificationCode(generateVerificationCode());
  };

  // Determinar categoría actual según el módulo de la pregunta
  const currentCategory = EXAM_CATEGORIES.find((c) =>
    currentQ ? c.moduleIds.includes(currentQ.moduleId) : false
  );

  // Vista de resultados finales tras entregar el examen
  if (isSubmitted) {
    const correctCount = Object.values(evaluations).filter(
      (e) => e.isCorrect
    ).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 85;

    return (
      <div className="space-y-8 pb-12">
        {/* Banner superior de resultado */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 shadow-2xl ${
            passed
              ? 'border-emerald/40 bg-gradient-to-br from-emerald/15 via-card to-cyan/10'
              : 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-rose-500/10'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-slate-950/80 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-cyan">
                <Sparkles className="h-3.5 w-3.5" />
                Resultado Oficial — Certificación NetAscend
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {passed
                  ? '¡Examen Aprobado con Grado de Excelencia!'
                  : 'Puntaje Insuficiente para la Certificación'}
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                {passed
                  ? 'Has superado el umbral mínimo del 85% (22/25 aciertos). Tu certificado oficial está listo para personalizarse y descargarse en formato PNG.'
                  : 'Se requiere un mínimo de 85% (22 de 25 respuestas correctas) para emitir el diploma oficial. Revisa el desglose por categoría abajo e inténtalo de nuevo.'}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="rounded-2xl border border-line bg-slate-950/90 px-6 py-4 text-center">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Calificación Final
                </span>
                <span
                  className={`mt-1 block font-mono text-4xl font-black ${
                    passed ? 'text-emerald' : 'text-amber-400'
                  }`}
                >
                  {score}%
                </span>
                <span className="mt-0.5 block text-xs font-mono text-slate-400">
                  {correctCount} / {questions.length} correctas
                </span>
              </div>
            </div>
          </div>

          {/* Botones de alternancia si aprobó */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line/60 pt-5">
            {passed && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCertificateView(true)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    showCertificateView
                      ? 'bg-cyan text-slate-950 shadow-lg shadow-cyan/20'
                      : 'border border-line bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  Diploma Oficial (PNG)
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateView(false)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    !showCertificateView
                      ? 'bg-cyan text-slate-950 shadow-lg shadow-cyan/20'
                      : 'border border-line bg-slate-900 text-slate-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Desglose por Categorías (25 Reactivos)
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleRetryExam}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Generar Nuevo Examen (25 Preguntas Nuevas)
            </button>

            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer ml-auto"
            >
              Volver a la Portada del Examen
            </button>
          </div>
        </div>

        {/* Vista del Certificado si aprobó y está activa */}
        {passed && showCertificateView && (
          <CertificateModal
            score={score}
            correctCount={correctCount}
            totalQuestions={questions.length}
            verificationCode={verificationCode}
            issueDate={issueDate}
            rank={rank}
            onClose={() => setShowCertificateView(false)}
            onRetryExam={handleRetryExam}
          />
        )}

        {/* Desglose por Categorías */}
        {(!passed || !showCertificateView) && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Desglose de Rendimiento por Dominio Técnico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {EXAM_CATEGORIES.map((cat) => {
                  const catQuestions = questions.filter((q) =>
                    cat.moduleIds.includes(q.moduleId)
                  );
                  const catCorrect = catQuestions.filter(
                    (q) => evaluations[q.id]?.isCorrect
                  ).length;
                  const catPct = Math.round(
                    (catCorrect / (catQuestions.length || 1)) * 100
                  );

                  return (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-line bg-slate-950/70 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan">
                          Módulos {cat.moduleIds[0]} y {cat.moduleIds[1]}
                        </span>
                        <h4 className="mt-1 text-sm font-bold text-white">
                          {cat.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                          <span className="text-slate-300">
                            {catCorrect}/{catQuestions.length} aciertos
                          </span>
                          <span
                            className={`font-bold ${
                              catPct >= 80
                                ? 'text-emerald'
                                : catPct >= 60
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                            }`}
                          >
                            {catPct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
                          <div
                            className={`h-full rounded-full ${
                              catPct >= 80
                                ? 'bg-emerald'
                                : catPct >= 60
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                            }`}
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revisión detallada de los 25 reactivos */}
            <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">
                Auditoría de las 25 Preguntas del Examen
              </h3>
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const ev = evaluations[q.id];
                  const isOk = ev?.isCorrect ?? false;
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border p-4 ${
                        isOk
                          ? 'border-emerald/30 bg-emerald/5'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isOk ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-slate-300">
                            #{idx + 1} (Módulo {q.moduleId})
                          </span>
                          <span className="text-sm font-bold text-white">
                            {q.title}
                          </span>
                        </div>
                        <Badge tone={isOk ? 'emerald' : 'amber'}>
                          {isOk ? 'Correcta' : ev ? 'Incorrecta' : 'Sin responder'}
                        </Badge>
                      </div>

                      <p className="mt-2 text-xs text-slate-300">{q.prompt}</p>

                      {!isOk && (
                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs space-y-1">
                          {ev && (
                            <p className="text-rose-300 font-mono">
                              Tu respuesta: {formatAnswerValue(ev.userAnswer)}
                            </p>
                          )}
                          <p className="text-emerald font-mono">
                            Respuesta correcta: {formatAnswerValue(ev?.expectedAnswer ?? q.expectedAnswer)}
                          </p>
                          <p className="text-slate-400 pt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentEval = currentQ ? evaluations[currentQ.id] : undefined;
  const isCurrentFlagged = currentQ ? Boolean(flaggedIds[currentQ.id]) : false;

  return (
    <div className="space-y-6 pb-12">
      {/* Barra de control superior del Examen */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="cyan">Certificación NetAscend</Badge>
          {currentCategory && (
            <span className="text-xs font-medium text-slate-300">
              Dominio: <strong className="text-white">{currentCategory.title}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-mono text-slate-400">
            Respondidas:{' '}
            <span className="font-bold text-emerald">{answeredCount}</span>/
            {questions.length}
            {flaggedCount > 0 && (
              <span className="ml-2 text-amber-300">
                • {flaggedCount} en revisión
              </span>
            )}
          </div>

          <ExamTimer
            timed={timed}
            initialSeconds={45 * 60}
            isFinished={isSubmitted}
            onTimeUp={handleTimeUp}
          />

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald/20 hover:bg-emerald-400 transition cursor-pointer"
          >
            <FileCheck2 className="h-4 w-4" />
            Finalizar y Calificar
          </button>
        </div>
      </div>

      {/* Navegador rápido de 25 preguntas */}
      <div className="rounded-2xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mapa de Navegación Rápida (25 Reactivos)
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan" /> Actual
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald/60" /> Respondida
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Para revisar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-800 border border-slate-700" /> Pendiente
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-[repeat(25,minmax(0,1fr))] gap-1.5">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = Boolean(evaluations[q.id]);
            const isFlagged = Boolean(flaggedIds[q.id]);

            let btnStyle =
              'border-slate-800 bg-slate-900/90 text-slate-400 hover:border-slate-700 hover:text-white';
            if (isCurrent) {
              btnStyle =
                'border-cyan bg-cyan text-slate-950 font-black ring-2 ring-cyan/40';
            } else if (isFlagged) {
              btnStyle =
                'border-amber-400/70 bg-amber-400/15 text-amber-300 font-bold';
            } else if (isAnswered) {
              btnStyle =
                'border-emerald/50 bg-emerald/15 text-emerald font-bold';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-9 rounded-lg border font-mono text-xs transition cursor-pointer flex items-center justify-center ${btnStyle}`}
                title={`Pregunta ${idx + 1}${isFlagged ? ' (Marcada para revisar)' : ''}${isAnswered ? ' (Respondida)' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estado de la pregunta actual y botón de marcar para revisión */}
      {currentQ && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentEval ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald/40 bg-emerald/10 px-3.5 py-1.5 text-xs text-emerald">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Respuesta guardada ({formatAnswerValue(currentEval.userAnswer)}). Puedes enviar otra si deseas cambiarla.
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Ingresa o selecciona tu respuesta para guardarla en tu hoja de examen.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => toggleFlag(currentQ.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                isCurrentFlagged
                  ? 'border-amber-400/60 bg-amber-400/15 text-amber-300'
                  : 'border-line bg-slate-900 text-slate-300 hover:border-amber-400/40 hover:text-amber-200'
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {isCurrentFlagged ? 'Marcada para revisar' : 'Marcar para revisar'}
            </button>
          </div>

          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />

          {/* Controles de navegación Anterior / Siguiente */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Pregunta Anterior
            </Button>

            <div className="flex items-center gap-3">
              {currentIndex < questions.length - 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                >
                  Siguiente Pregunta
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowConfirmModal(true)}
                >
                  <FileCheck2 className="h-4 w-4 mr-1.5" />
                  Finalizar Examen
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para entregar el examen */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/15 text-cyan">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  ¿Finalizar y Calificar Examen?
                </h3>
                <p className="text-xs text-slate-400">
                  Has respondido {answeredCount} de {questions.length} preguntas.
                </p>
              </div>
            </div>

            {answeredCount < questions.length && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Aún tienes{' '}
                  <strong>{questions.length - answeredCount} preguntas sin responder</strong>.
                  Las preguntas en blanco se calificarán como incorrectas.
                </span>
              </div>
            )}

            {flaggedCount > 0 && (
              <p className="text-xs text-amber-300 font-mono">
                Nota: Tienes {flaggedCount} pregunta(s) marcada(s) para revisión.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowConfirmModal(false)}
              >
                Seguir Revisando
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => finalizeExam(evaluations)}
              >
                Calificar Ahora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
