import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

export type UserRank = 'Novato' | 'Técnico' | 'Analista' | 'Ingeniero' | 'Arquitecto' | 'CCIE Mode';

export interface ProgressState {
  unlockedModuleIds: number[];
  completedModuleIds: number[];
  currentModuleId: number;
  viewingModuleId: number | null;
  moduleQuizScores: Record<number, number>;
  xp: number;
  streak: number;
  darkMode: boolean;
  activeView: 'modules' | 'calculator' | 'exam';
  calculatorTab: 'subnet' | 'flsm' | 'vlsm' | 'summarize' | 'ipv6' | 'converter';
}

export type ProgressAction =
  | { type: 'UNLOCK_MODULE'; moduleId: number }
  | { type: 'COMPLETE_MODULE'; moduleId: number; score: number; xpEarned: number }
  | { type: 'SET_CURRENT_MODULE'; moduleId: number }
  | { type: 'OPEN_MODULE'; moduleId: number }
  | { type: 'CLOSE_MODULE' }
  | { type: 'SET_ACTIVE_VIEW'; view: 'modules' | 'calculator' | 'exam' }
  | { type: 'SET_CALCULATOR_TAB'; tab: 'subnet' | 'flsm' | 'vlsm' | 'summarize' | 'ipv6' | 'converter' }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'RESET_ALL' };

export function calculateRank(xp: number): UserRank {
  if (xp >= 3001) return 'CCIE Mode';
  if (xp >= 2001) return 'Arquitecto';
  if (xp >= 1201) return 'Ingeniero';
  if (xp >= 601) return 'Analista';
  if (xp >= 251) return 'Técnico';
  return 'Novato';
}

const initialState: ProgressState = {
  unlockedModuleIds: [1],
  completedModuleIds: [],
  currentModuleId: 1,
  viewingModuleId: null,
  moduleQuizScores: {},
  xp: 0,
  streak: 1,
  darkMode: true,
  activeView: 'modules',
  calculatorTab: 'subnet',
};

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'UNLOCK_MODULE': {
      if (state.unlockedModuleIds.includes(action.moduleId)) return state;
      return {
        ...state,
        unlockedModuleIds: [...state.unlockedModuleIds, action.moduleId].sort((a, b) => a - b),
      };
    }
    case 'COMPLETE_MODULE': {
      const alreadyCompleted = state.completedModuleIds.includes(action.moduleId);
      const nextUnlocked =
        action.moduleId < 10 && !state.unlockedModuleIds.includes(action.moduleId + 1)
          ? [...state.unlockedModuleIds, action.moduleId + 1].sort((a, b) => a - b)
          : state.unlockedModuleIds;

      return {
        ...state,
        completedModuleIds: alreadyCompleted ? state.completedModuleIds : [...state.completedModuleIds, action.moduleId],
        unlockedModuleIds: nextUnlocked,
        moduleQuizScores: {
          ...state.moduleQuizScores,
          [action.moduleId]: Math.max(state.moduleQuizScores[action.moduleId] ?? 0, action.score),
        },
        xp: state.xp + (alreadyCompleted ? Math.round(action.xpEarned * 0.3) : action.xpEarned),
        streak: state.streak + 1,
      };
    }
    case 'SET_CURRENT_MODULE': {
      return { ...state, currentModuleId: action.moduleId, viewingModuleId: action.moduleId, activeView: 'modules' };
    }
    case 'OPEN_MODULE': {
      return { ...state, viewingModuleId: action.moduleId, currentModuleId: action.moduleId, activeView: 'modules' };
    }
    case 'CLOSE_MODULE': {
      return { ...state, viewingModuleId: null };
    }
    case 'SET_ACTIVE_VIEW': {
      return { ...state, activeView: action.view, viewingModuleId: action.view === 'modules' ? state.viewingModuleId : null };
    }
    case 'SET_CALCULATOR_TAB': {
      return { ...state, calculatorTab: action.tab, activeView: 'calculator', viewingModuleId: null };
    }
    case 'ADD_XP': {
      return { ...state, xp: state.xp + action.amount };
    }
    case 'INCREMENT_STREAK': {
      return { ...state, streak: state.streak + 1 };
    }
    case 'RESET_STREAK': {
      return { ...state, streak: 1 };
    }
    case 'TOGGLE_DARK_MODE': {
      return { ...state, darkMode: !state.darkMode };
    }
    case 'RESET_ALL': {
      return { ...initialState, darkMode: state.darkMode };
    }
    default:
      return state;
  }
}

interface ProgressContextValue {
  state: ProgressState;
  rank: UserRank;
  dispatch: React.Dispatch<ProgressAction>;
  unlockModule: (id: number) => void;
  completeModule: (id: number, score: number, xpEarned: number) => void;
  setCurrentModule: (id: number) => void;
  openModule: (id: number) => void;
  closeModule: () => void;
  setActiveView: (view: 'modules' | 'calculator' | 'exam') => void;
  setCalculatorTab: (tab: 'subnet' | 'flsm' | 'vlsm' | 'summarize' | 'ipv6' | 'converter') => void;
  addXp: (amount: number) => void;
  toggleDarkMode: () => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const rank = calculateRank(state.xp);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.xp > 0 || state.completedModuleIds.length > 0) {
        e.preventDefault();
        e.returnValue = 'Tienes progreso en memoria que se perderá si recargas la página.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.xp, state.completedModuleIds.length]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const value: ProgressContextValue = {
    state,
    rank,
    dispatch,
    unlockModule: (id: number) => dispatch({ type: 'UNLOCK_MODULE', moduleId: id }),
    completeModule: (id: number, score: number, xpEarned: number) =>
      dispatch({ type: 'COMPLETE_MODULE', moduleId: id, score, xpEarned }),
    setCurrentModule: (id: number) => dispatch({ type: 'SET_CURRENT_MODULE', moduleId: id }),
    openModule: (id: number) => dispatch({ type: 'OPEN_MODULE', moduleId: id }),
    closeModule: () => dispatch({ type: 'CLOSE_MODULE' }),
    setActiveView: (view: 'modules' | 'calculator' | 'exam') => dispatch({ type: 'SET_ACTIVE_VIEW', view }),
    setCalculatorTab: (tab) => dispatch({ type: 'SET_CALCULATOR_TAB', tab }),
    addXp: (amount: number) => dispatch({ type: 'ADD_XP', amount }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    return {
      state: initialState,
      rank: 'Novato' as UserRank,
      dispatch: () => {},
      unlockModule: () => {},
      completeModule: () => {},
      setCurrentModule: () => {},
      openModule: () => {},
      closeModule: () => {},
      setActiveView: () => {},
      setCalculatorTab: () => {},
      addXp: () => {},
      toggleDarkMode: () => {},
      resetAll: () => {},
    };
  }
  return ctx;
}
