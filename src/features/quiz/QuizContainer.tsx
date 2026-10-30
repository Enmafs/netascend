import { useState, useEffect } from 'react';
import type { Question, EvaluationResult } from '../../lib/quiz/types';
import { generateQuiz } from '../../lib/quiz/generator';
import { evaluateAnswer } from '../../lib/quiz/evaluator';
import { useProgress } from '../../state/ProgressContext';
import { QuestionCard } from './QuestionCard';
import { FeedbackModal } from './FeedbackModal';
import { QuizResultView } from './QuizResultView';
import { Flame, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button, Badge } from '../../components/ui/primitives';

interface Props {
  moduleId: number;
  onExit: () => void;
  onReviewTheory: () => void;
  onModuleUnlockedNext?: () => void;
}

export function QuizContainer({
  moduleId,
  onExit,
  onReviewTheory,
  onModuleUnlockedNext,
}: Props) {
  const { completeModule } = useProgress();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<Question[]>(() => generateQuiz(moduleId, 'medium', 6));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationResult>>({});
  
  // Racha y métricas adaptativas
  const [streak, setStreak] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  // Modales y estados de vista
  const [activeFeedback, setActiveFeedback] = useState<{
    evaluation: EvaluationResult;
    question: Question;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Reiniciar cuestionario con nuevas preguntas generadas
  const handleRestart = () => {
    const fresh = generateQuiz(moduleId, difficulty, 6);
    setQuestions(fresh);
    setCurrentIndex(0);
    setEvaluations({});
    setStreak(0);
    setConsecutiveWrong(0);
    setTotalXP(0);
    setActiveFeedback(null);
    setIsFinished(false);
  };

  // Manejar respuesta del alumno
  const handleAnswer = (userAnswer: any) => {
    const currentQ = questions[currentIndex];
    const evaluation = evaluateAnswer(currentQ, userAnswer);

    setEvaluations((prev) => ({ ...prev, [currentQ.id]: evaluation }));

    // Cálculo adaptativo de XP y Racha
    if (evaluation.isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setConsecutiveWrong(0);

      const baseXP = 30;
      const streakBonus = nextStreak >= 3 ? 15 : 0;
      setTotalXP((prev) => prev + baseXP + streakBonus);

      // Si acierta 3 seguidas, sube dificultad
      if (nextStreak === 3 && difficulty !== 'hard') {
        setDifficulty('hard');
      }
    } else {
      setStreak(0);
      const nextWrong = consecutiveWrong + 1;
      setConsecutiveWrong(nextWrong);

      // Si falla 2 seguidas, baja dificultad
      if (nextWrong >= 2 && difficulty !== 'easy') {
        setDifficulty('easy');
      }
    }

    // Mostrar feedback modal inmediato
    setActiveFeedback({
      evaluation,
      question: currentQ,
    });
  };

  // Pasar a siguiente pregunta tras cerrar feedback
  const handleNextQuestion = () => {
    setActiveFeedback(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Fin del cuestionario
      setIsFinished(true);
    }
  };

  // Al finalizar, computar nota y completar módulo si >= 80%
  const correctCount = Object.values(evaluations).filter((e) => e.isCorrect).length;
  const score = Math.round((correctCount / (questions.length || 1)) * 100);

  useEffect(() => {
    if (isFinished && score >= 80) {
      completeModule(moduleId, score, totalXP);
    }
  }, [isFinished, score, moduleId, totalXP, completeModule]);

  if (isFinished) {
    return (
      <QuizResultView
        moduleId={moduleId}
        score={score}
        totalXP={totalXP}
        correctCount={correctCount}
        totalQuestions={questions.length}
        onRetry={handleRestart}
        onContinue={() => {
          if (onModuleUnlockedNext) onModuleUnlockedNext();
          else onExit();
        }}
        onReviewTheory={onReviewTheory}
      />
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* Barra de progreso y controles superiores */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onExit} className="text-xs py-1.5 px-3">
            <ArrowLeft size={14} className="mr-1.5" />
            Salir del Quiz
          </Button>
          <span className="text-xs font-mono text-slate-400">
            Módulo {moduleId}
          </span>
        </div>

        {/* Indicadores de Racha y XP */}
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <Badge tone="amber" className="animate-pulse">
              <Flame size={14} className="mr-1 inline text-amber-400" />
              Racha x{streak} 🔥
            </Badge>
          )}
          <Badge tone="cyan">
            +{totalXP} XP
          </Badge>
          <Button
            variant="ghost"
            onClick={handleRestart}
            className="text-xs py-1.5 px-2.5 h-auto text-slate-400 hover:text-cyan"
            title="Reiniciar cuestionario con nuevas preguntas"
          >
            <RotateCcw size={13} className="mr-1" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Barra de progreso visual */}
      <div className="w-full bg-surface rounded-full h-2 border border-line overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan to-violet h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Pregunta Activa */}
      {currentQ && (
        <QuestionCard
          key={currentQ.id}
          question={currentQ}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          disabled={activeFeedback !== null}
        />
      )}

      {/* Modal de retroalimentación inmediata */}
      {activeFeedback && (
        <FeedbackModal
          evaluation={activeFeedback.evaluation}
          question={activeFeedback.question}
          isLastQuestion={currentIndex + 1 >= questions.length}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
}
