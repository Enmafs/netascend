import { ProgressProvider, useProgress } from './state/ProgressContext';
import { Navbar } from './components/Navbar';
import { ModuleListView } from './features/modules/ModuleListView';
import { ModuleDetailView } from './features/modules/ModuleDetailView';
import { CalculatorView } from './features/calculator/CalculatorView';
import { ExamView } from './features/exam/ExamView';
import { LevelUpModal } from './features/gamification/LevelUpModal';

function AppContent() {
  const { state, closeModule } = useProgress();

  return (
    <div className="min-h-screen bg-base text-slate-100 flex flex-col selection:bg-cyan selection:text-slate-950 font-sans">
      <Navbar />
      <LevelUpModal />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {state.activeView === 'modules' && (
          <>
            {state.viewingModuleId !== null ? (
              <ModuleDetailView
                moduleId={state.viewingModuleId}
                onBack={closeModule}
              />
            ) : (
              <ModuleListView />
            )}
          </>
        )}

        {state.activeView === 'calculator' && <CalculatorView />}

        {state.activeView === 'exam' && <ExamView />}
      </main>

      <footer className="border-t border-line/60 bg-base py-6 text-center text-xs text-slate-500">
        <p>
          NetAscend — Domina el direccionamiento IPv4/IPv6, el Método del Salto y VLSM. 100% en memoria.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}
