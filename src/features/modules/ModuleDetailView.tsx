import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Code2,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Trophy,
  Award,
} from 'lucide-react';
import { MODULES_DATA } from '../../content/modulesData';
import { useProgress } from '../../state/ProgressContext';
import { Card, Badge, Button } from '../../components/ui/primitives';
import { ModuleInteractivePractice } from './components/ModuleInteractivePractice';
import { QuizContainer } from '../quiz/QuizContainer';

interface Props {
  moduleId: number;
  onBack: () => void;
}

type TabType = 'theory' | 'glossary' | 'examples' | 'practice' | 'traps' | 'quiz';

export function ModuleDetailView({ moduleId, onBack }: Props) {
  const { state, setCurrentModule, setActiveView } = useProgress();
  const [activeTab, setActiveTab] = useState<TabType>('theory');

  const module = MODULES_DATA.find((m) => m.id === moduleId) ?? MODULES_DATA[0];
  const isCompleted = state.completedModuleIds.includes(module.id);

  const prevModule = MODULES_DATA.find((m) => m.id === module.id - 1);
  const nextModule = MODULES_DATA.find((m) => m.id === module.id + 1);

  return (
    <div className="space-y-6 pb-16">
      {/* Barra de Navegación Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <Button variant="ghost" onClick={onBack} className="text-xs py-1.5 px-3">
          <ArrowLeft size={14} className="mr-1.5" />
          Volver a la Academia
        </Button>

        <div className="flex items-center gap-2">
          {prevModule && (
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentModule(prevModule.id);
                setActiveTab('theory');
              }}
              className="text-xs py-1.5 px-2.5"
            >
              <ChevronLeft size={14} className="mr-1" />
              Módulo {prevModule.id}
            </Button>
          )}

          {nextModule && state.unlockedModuleIds.includes(nextModule.id) && (
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentModule(nextModule.id);
                setActiveTab('theory');
              }}
              className="text-xs py-1.5 px-2.5"
            >
              Módulo {nextModule.id}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Cabecera del Módulo */}
      <header className="rounded-2xl border border-line bg-surface/90 p-6 sm:p-7 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan/15 border border-cyan/40 px-3 py-1 font-mono text-xs font-bold text-cyan">
              Módulo {module.id} de 10
            </span>
            <Badge tone="violet">{module.category}</Badge>
            <Badge tone="cyan">{module.badge}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{module.estimatedMinutes} min lectura</span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 border border-emerald/40 px-2.5 py-0.5 text-xs font-semibold text-emerald">
                <CheckCircle2 size={14} /> Completado
              </span>
            ) : (
              <Badge tone="amber">+{module.xpReward} XP al aprobar</Badge>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{module.title}</h1>
        <p className="mt-2 text-sm text-cyan/90 font-medium">{module.subtitle}</p>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">{module.summary}</p>
      </header>

      {/* Selector de Pestañas del Módulo */}
      <nav className="flex flex-wrap gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'theory'
              ? 'bg-cyan text-slate-950 shadow-md font-bold'
              : 'border border-line bg-surface/60 text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen size={14} />
          1. Teoría y Conceptos ({module.sections.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'practice'
              ? 'bg-cyan text-slate-950 shadow-md font-bold'
              : 'border border-line bg-surface/60 text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          2. Laboratorio Interactivo
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('examples')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'examples'
              ? 'bg-cyan text-slate-950 shadow-md font-bold'
              : 'border border-line bg-surface/60 text-slate-300 hover:text-white'
          }`}
        >
          <Code2 size={14} />
          3. Ejemplos Resueltos ({module.stepByStepExamples.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('glossary')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'glossary'
              ? 'bg-cyan text-slate-950 shadow-md font-bold'
              : 'border border-line bg-surface/60 text-slate-300 hover:text-white'
          }`}
        >
          <HelpCircle size={14} />
          4. Glosario ({module.glossary.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('traps')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'traps'
              ? 'bg-cyan text-slate-950 shadow-md font-bold'
              : 'border border-line bg-surface/60 text-slate-300 hover:text-white'
          }`}
        >
          <AlertOctagon size={14} />
          5. Trampas Comunes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'quiz'
              ? 'bg-cyan text-slate-950 shadow-md font-bold ring-2 ring-cyan/50'
              : 'border border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20'
          }`}
        >
          <Award size={14} />
          6. Presentar Cuestionario
        </button>
      </nav>

      {/* Contenido según Pestaña */}
      <div className="space-y-6">
        {/* Pestaña: Teoría y Conceptos */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            {module.sections.map((section) => (
              <Card key={section.id} title={section.title} icon={<BookOpen className="text-cyan" size={16} />}>
                <div className="space-y-3 text-sm text-slate-300">
                  {section.content.map((p, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 rounded-xl border border-line bg-base/60 p-4 text-xs font-mono text-slate-300">
                    {section.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan font-bold select-none">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.tips && section.tips.length > 0 && (
                  <div className="mt-4 rounded-xl border border-cyan/30 bg-cyan/5 p-3.5 text-xs text-cyan">
                    {section.tips.map((t, idx) => (
                      <p key={idx} className="leading-relaxed">
                        <strong className="uppercase font-bold tracking-wide mr-1.5">Consejo del Instructor:</strong>
                        {t}
                      </p>
                    ))}
                  </div>
                )}

                {section.alerts && section.alerts.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3.5 text-xs text-amber-200">
                    {section.alerts.map((a, idx) => (
                      <p key={idx} className="leading-relaxed">
                        <strong className="uppercase font-bold tracking-wide mr-1.5">Atención:</strong>
                        {a}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pestaña: Laboratorio Interactivo */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            <ModuleInteractivePractice type={module.interactiveType} />
          </div>
        )}

        {/* Pestaña: Ejemplos Resueltos */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            {module.stepByStepExamples.map((ex, idx) => (
              <Card key={idx} title={ex.title} icon={<Code2 className="text-emerald" size={16} />}>
                <div className="mb-4 inline-block rounded-lg border border-line bg-base px-3 py-1 font-mono text-xs font-bold text-cyan">
                  Entrada: {ex.input}
                </div>

                <div className="space-y-3">
                  {ex.steps.map((st) => (
                    <div key={st.step} className="rounded-lg border border-line bg-base/60 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold uppercase tracking-wider text-cyan">
                          Paso {st.step}: {st.name}
                        </span>
                        {st.highlight && (
                          <span className="font-mono font-bold text-emerald">{st.highlight}</span>
                        )}
                      </div>
                      <p className="text-slate-300 leading-relaxed">{st.description}</p>
                    </div>
                  ))}
                </div>

                {/* Resumen del resultado */}
                <div className="mt-5 rounded-xl border border-emerald/40 bg-emerald/5 p-4">
                  <span className="text-xs uppercase font-bold text-emerald tracking-wide block mb-2">
                    Resultado Final:
                  </span>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Red:</span>
                      <strong className="text-white">{ex.result.network}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Broadcast:</span>
                      <strong className="text-violet">{ex.result.broadcast}</strong>
                    </div>
                    {ex.result.firstUsable && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Primera Útil:</span>
                        <strong className="text-emerald">{ex.result.firstUsable}</strong>
                      </div>
                    )}
                    {ex.result.lastUsable && (
                      <div>
                        <span className="text-slate-400 text-[10px] block">Última Útil:</span>
                        <strong className="text-emerald">{ex.result.lastUsable}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pestaña: Glosario de Términos */}
        {activeTab === 'glossary' && (
          <Card title="Glosario del Módulo" icon={<HelpCircle className="text-violet" size={16} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {module.glossary.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-line bg-base/60 p-3.5">
                  <dt className="font-mono text-sm font-bold text-cyan">{item.term}</dt>
                  <dd className="mt-1 text-xs text-slate-300 leading-relaxed">{item.definition}</dd>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pestaña: Trampas Comunes */}
        {activeTab === 'traps' && (
          <Card title="Trampas Comunes Detectadas en Evaluaciones" icon={<AlertOctagon className="text-amber-400" size={16} />}>
            <p className="text-xs text-slate-400 mb-4">
              Estos son los errores más comunes cometidos por estudiantes en certificaciones CCNA y exámenes de redes.
            </p>
            <div className="space-y-3">
              {module.trapsAndFeedback.map((tf, idx) => (
                <div key={idx} className="rounded-xl border border-line bg-base/60 p-4">
                  <div className="flex items-start gap-2 text-xs font-semibold text-amber-300 mb-1.5">
                    <AlertOctagon size={14} className="mt-0.5 shrink-0" />
                    <span>Trampa: {tf.trap}</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-5 leading-relaxed">
                    <strong className="text-cyan">Cómo evitarlo: </strong>
                    {tf.feedback}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pestaña: Cuestionario Procedural */}
        {activeTab === 'quiz' && (
          <QuizContainer
            key={module.id}
            moduleId={module.id}
            onExit={() => setActiveTab('theory')}
            onReviewTheory={() => setActiveTab('theory')}
            onModuleUnlockedNext={() => {
              if (nextModule) {
                setCurrentModule(nextModule.id);
                setActiveTab('theory');
              } else {
                setActiveView('exam');
              }
            }}
          />
        )}
      </div>

      {/* Barra de Finalización y Desbloqueo */}
      {activeTab !== 'quiz' && (
        <footer className="mt-10 rounded-2xl border border-cyan/40 bg-gradient-to-r from-surface via-base to-surface p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="text-cyan" size={18} />
              {isCompleted ? '¡Módulo Completado!' : '¿Listo para evaluar tus conocimientos?'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCompleted
                ? 'Has demostrado dominio de este tema. Puedes reintentar el cuestionario para practicar o avanzar.'
                : module.id < 10
                  ? `Presenta el cuestionario procedural para ganar +${module.xpReward} XP y desbloquear el Módulo ${module.id + 1}.`
                  : `Presenta el cuestionario procedural para ganar +${module.xpReward} XP y completar toda la Academia.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setActiveTab('quiz')}
              className="text-sm font-bold py-2.5 px-5 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
            >
              <Award size={16} className="mr-1.5 inline" />
              {isCompleted ? 'Repetir Cuestionario' : `Presentar Cuestionario (+${module.xpReward} XP)`}
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
