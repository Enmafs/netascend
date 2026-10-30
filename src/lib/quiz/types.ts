import type { IPv4SubnetResult } from '../net/types';

export type QuestionType =
  | 'open-input'
  | 'full-packet'
  | 'multiple-choice'
  | 'true-false'
  | 'same-network'
  | 'matching'
  | 'binary';

export interface FullPacketAnswer {
  maskDecimal: string;
  salto: string;
  workingOctet: string;
  networkAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  broadcastAddress: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  moduleId: number;
  title: string;
  prompt: string;
  hint?: string;
  explanation: string;
  
  // Datos específicos según tipo
  targetValue?: string; // Para open-input y binary
  expectedAnswer?: string | boolean | FullPacketAnswer | Record<string, string>;
  options?: string[]; // Para multiple-choice
  
  // Para same-network
  ipA?: string;
  ipB?: string;
  prefix?: number;
  sameNetwork?: boolean;
  
  // Para matching
  pairs?: MatchingPair[];
  
  // Para full-packet y feedback con los 5 pasos
  subnetData?: IPv4SubnetResult;
  stepByStepDetails?: {
    ip: string;
    prefix: number;
    network: string;
    salto: number;
    workingOctet: number;
  };

  // Metadatos adaptativos
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TrapDetection {
  isTrap: boolean;
  trapType?:
    | 'host-as-network'
    | 'drag-host-octets'
    | 'salto-vs-exponent'
    | 'missed-minus-two'
    | 'wrong-octet-salto'
    | 'bad-mask-sequence'
    | 'dot-zero-is-valid-host'
    | 'off-by-one';
  message: string;
}

export interface EvaluationResult {
  isCorrect: boolean;
  scoreRatio: number; // 0 a 1
  userAnswer: any;
  expectedAnswer: any;
  feedbackMessage: string;
  trap?: TrapDetection;
}

export interface QuizAttemptState {
  moduleId: number;
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, any>;
  evaluations: Record<string, EvaluationResult>;
  streak: number;
  correctCount: number;
  totalXP: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
  showFeedbackModal: boolean;
  activeFeedback?: EvaluationResult & { question: Question };
}
