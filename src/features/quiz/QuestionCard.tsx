import { useState } from 'react';
import type { Question } from '../../lib/quiz/types';
import { Card, Badge, Button } from '../../components/ui/primitives';
import { InputQuestion } from './types/InputQuestion';
import { FullPacketQuestion } from './types/FullPacketQuestion';
import { MultipleChoice } from './types/MultipleChoice';
import { TrueFalseQuestion } from './types/TrueFalseQuestion';
import { SameNetworkQuestion } from './types/SameNetworkQuestion';
import { MatchingQuestion } from './types/MatchingQuestion';
import { BinaryQuestion } from './types/BinaryQuestion';
import { Lightbulb, HelpCircle } from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: any) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  disabled = false,
}: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <Card className="border-cyan/30 shadow-2xl relative overflow-hidden">
      {/* Barra superior con metadatos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge tone="cyan">
            Pregunta {questionIndex + 1} de {totalQuestions}
          </Badge>
          <Badge
            tone={
              question.difficulty === 'hard'
                ? 'violet'
                : question.difficulty === 'medium'
                ? 'emerald'
                : 'slate'
            }
          >
            {question.difficulty.toUpperCase()}
          </Badge>
        </div>

        {question.hint && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowHint((prev) => !prev)}
            className="text-xs py-1 px-2.5 h-auto text-amber-300 hover:text-amber-200 hover:border-amber-400/40"
          >
            <Lightbulb size={13} className="mr-1 text-amber-300" />
            {showHint ? 'Ocultar Pista' : 'Ver Pista'}
          </Button>
        )}
      </div>

      {showHint && question.hint && (
        <div className="mb-4 p-3 rounded-lg border border-amber-400/30 bg-amber-400/10 text-xs text-amber-200 flex items-start gap-2">
          <Lightbulb size={16} className="shrink-0 mt-0.5" />
          <span>{question.hint}</span>
        </div>
      )}

      {/* Título y Enunciado */}
      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle size={18} className="text-cyan shrink-0" />
          {question.title}
        </h3>
        <p className="text-base text-slate-200 leading-relaxed font-sans">
          {question.prompt}
        </p>
      </div>

      {/* Renderizado del tipo específico de pregunta */}
      <div className="pt-2">
        {question.type === 'open-input' && (
          <InputQuestion disabled={disabled} onSubmit={onAnswer} />
        )}

        {question.type === 'full-packet' && (
          <FullPacketQuestion disabled={disabled} onSubmit={onAnswer} />
        )}

        {question.type === 'multiple-choice' && (
          <MultipleChoice
            options={question.options ?? []}
            disabled={disabled}
            onSubmit={onAnswer}
          />
        )}

        {question.type === 'true-false' && (
          <TrueFalseQuestion disabled={disabled} onSubmit={onAnswer} />
        )}

        {question.type === 'same-network' && (
          <SameNetworkQuestion
            ipA={question.ipA}
            ipB={question.ipB}
            prefix={question.prefix}
            disabled={disabled}
            onSubmit={onAnswer}
          />
        )}

        {question.type === 'matching' && (
          <MatchingQuestion
            pairs={question.pairs}
            disabled={disabled}
            onSubmit={onAnswer}
          />
        )}

        {question.type === 'binary' && (
          <BinaryQuestion disabled={disabled} onSubmit={onAnswer} />
        )}
      </div>
    </Card>
  );
}
