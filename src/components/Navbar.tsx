import { Flame, Zap, Moon, Sun, Terminal, Calculator, BookOpen, Award, Network, Split, Layers, Route, Globe, ArrowLeftRight } from 'lucide-react';
import type { ComponentType } from 'react';
import { useProgress } from '../state/ProgressContext';
import { RankBadge } from '../features/gamification/RankBadge';
import { cn } from '../lib/cn';

export type TabId = 'subnet' | 'flsm' | 'vlsm' | 'summary' | 'ipv6' | 'converter';

export const TABS: { id: TabId; label: string; icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }> }[] = [
  { id: 'subnet', label: 'Subred IPv4', icon: Network },
  { id: 'flsm', label: 'Subnetting FLSM', icon: Split },
  { id: 'vlsm', label: 'VLSM', icon: Layers },
  { id: 'summary', label: 'Sumarización', icon: Route },
  { id: 'ipv6', label: 'IPv6', icon: Globe },
  { id: 'converter', label: 'Conversor', icon: ArrowLeftRight },
];

interface NavbarProps {
  active?: TabId;
  onChange?: (id: TabId) => void;
}

export function Navbar({ active, onChange }: NavbarProps = {}) {
  const { state, rank, setActiveView, toggleDarkMode, setCalculatorTab } = useProgress();

  const handleCalculatorTabClick = (id: TabId) => {
    if (onChange) {
      onChange(id);
    } else {
      const mappedTab = id === 'summary' ? 'summarize' : id;
      setCalculatorTab(mappedTab as 'subnet' | 'flsm' | 'vlsm' | 'summarize' | 'ipv6' | 'converter');
      setActiveView('calculator');
    }
  };

  const currentTab = active ?? (state.calculatorTab === 'summarize' ? 'summary' : state.calculatorTab);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveView('modules')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan/50 bg-cyan/10 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:bg-cyan/20 transition-colors">
              <Terminal size={20} className="text-cyan" />
            </div>
            <div>
              <span className="font-mono text-lg font-black tracking-wider text-white flex items-center gap-1.5">
                Net<span className="text-cyan">Ascend</span>
                <span className="text-[10px] rounded bg-line px-1.5 py-0.2 font-sans font-semibold text-slate-400">
                  v1.0
                </span>
              </span>
            </div>
          </button>

          {/* Vistas Principales */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveView('modules')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                state.activeView === 'modules'
                  ? 'bg-surface text-cyan border border-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              Academia (10 Módulos)
            </button>

            <button
              type="button"
              onClick={() => setActiveView('calculator')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                state.activeView === 'calculator'
                  ? 'bg-surface text-cyan border border-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator size={14} />
              Calculadora Pro
            </button>

            <button
              type="button"
              onClick={() => setActiveView('exam')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                state.activeView === 'exam'
                  ? 'bg-surface text-violet border border-violet/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award size={14} />
              Examen Final
            </button>
          </nav>
        </div>

        {/* Estadísticas de Gamificación & Ajustes */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Racha */}
          <div
            className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300"
            title={`Racha activa: ${state.streak}`}
          >
            <Flame size={14} className="text-amber-400 fill-amber-400" />
            <span>{state.streak}</span>
          </div>

          {/* XP acumulado */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan"
            title="Puntos de experiencia acumulados"
          >
            <Zap size={13} className="fill-cyan" />
            <span>{state.xp} XP</span>
          </div>

          {/* Rango */}
          <div className="hidden sm:block">
            <RankBadge rank={rank} xp={state.xp} size="sm" />
          </div>

          {/* Selector Oscuro / Claro */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-lg border border-line bg-surface p-2 text-slate-400 hover:text-slate-200"
            aria-label="Cambiar tema claro/oscuro"
          >
            {state.darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Barra de herramientas de la calculadora siempre accesible sin bloqueo */}
      <div className="border-t border-line/60 bg-surface/40 px-4 py-1.5">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-2 shrink-0 hidden sm:inline">
            Calculadora Pro:
          </span>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleCalculatorTabClick(id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                state.activeView === 'calculator' && currentTab === id
                  ? 'bg-cyan/15 text-cyan ring-1 ring-cyan/40 font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )}
            >
              <Icon size={13} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación móvil secundaria */}
      <div className="flex md:hidden border-t border-line px-4 py-2 gap-2 bg-surface/50 text-xs">
        <button
          type="button"
          onClick={() => setActiveView('modules')}
          className={`flex-1 text-center py-1 rounded font-semibold ${
            state.activeView === 'modules' ? 'bg-cyan/15 text-cyan' : 'text-slate-400'
          }`}
        >
          Academia
        </button>
        <button
          type="button"
          onClick={() => setActiveView('calculator')}
          className={`flex-1 text-center py-1 rounded font-semibold ${
            state.activeView === 'calculator' ? 'bg-cyan/15 text-cyan' : 'text-slate-400'
          }`}
        >
          Calculadora
        </button>
        <button
          type="button"
          onClick={() => setActiveView('exam')}
          className={`flex-1 text-center py-1 rounded font-semibold ${
            state.activeView === 'exam' ? 'bg-violet/15 text-violet' : 'text-slate-400'
          }`}
        >
          Examen
        </button>
      </div>
    </header>
  );
}
