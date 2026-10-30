import { CheckCircle2, Lock, Play, BookOpen, Award, Flame, Zap, Trophy } from 'lucide-react';
import { MODULES_DATA } from '../../content/modulesData';
import { useProgress } from '../../state/ProgressContext';
import { Badge, Button } from '../../components/ui/primitives';

export function ModuleListView() {
  const { state, rank, openModule, setActiveView } = useProgress();

  const totalCompleted = state.completedModuleIds.length;
  const progressPercent = Math.round((totalCompleted / MODULES_DATA.length) * 100);

  const categories = Array.from(new Set(MODULES_DATA.map((m) => m.category)));

  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Bienvenida y Progreso */}
      <section className="relative overflow-hidden rounded-2xl border border-cyan/40 bg-gradient-to-r from-cyan/15 via-surface to-violet/10 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
              <Zap size={14} /> Academia NetAscend
            </span>
            <Badge tone="violet">Rango Actual: {rank}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              <Flame size={14} /> Racha: {state.streak}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Domina el Subnetting y Redes IPv4 / IPv6 sin Dolor
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Aprende paso a paso con el <strong>método del salto y las cajas</strong> en lugar de conversiones binarias
            eternas. Avanza linealmente aprobando cada módulo para desbloquear el siguiente hasta obtener tu
            Certificación NetAscend.
          </p>

          {/* Barra de progreso global */}
          <div className="mt-6 rounded-xl border border-line bg-base/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Progreso del Curso: {totalCompleted} de {MODULES_DATA.length} módulos completados</span>
              <span className="font-mono text-cyan">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface border border-line">
              <div
                className="h-full bg-gradient-to-r from-cyan to-violet transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Puntos XP acumulados: <strong className="text-cyan">{state.xp} XP</strong></span>
              {totalCompleted === 10 ? (
                <span className="text-emerald font-semibold flex items-center gap-1">
                  <Trophy size={14} /> ¡Listo para el Examen Final!
                </span>
              ) : (
                <span>Siguiente desbloqueo: Módulo {totalCompleted + 1}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Listado de Módulos agrupados por Categoría */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryModules = MODULES_DATA.filter((m) => m.category === category);
          return (
            <div key={category} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-line pb-2">
                <BookOpen size={16} className="text-cyan" />
                {category}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {categoryModules.map((module) => {
                  const isUnlocked = state.unlockedModuleIds.includes(module.id);
                  const isCompleted = state.completedModuleIds.includes(module.id);
                  const score = state.moduleQuizScores[module.id];

                  return (
                    <article
                      key={module.id}
                      className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
                        isCompleted
                          ? 'border-emerald/40 bg-surface/90 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : isUnlocked
                          ? 'border-cyan/50 bg-surface/90 hover:border-cyan shadow-lg'
                          : 'border-line/60 bg-base/40 opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="rounded-full bg-base/80 border border-line px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan">
                            Módulo {module.id}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">{module.estimatedMinutes} min</span>
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 border border-emerald/40 px-2 py-0.5 text-xs font-semibold text-emerald">
                                <CheckCircle2 size={13} /> Completado
                              </span>
                            ) : isUnlocked ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan/15 border border-cyan/40 px-2 py-0.5 text-xs font-semibold text-cyan">
                                Desbloqueado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-line px-2 py-0.5 text-xs text-slate-500">
                                <Lock size={12} /> Bloqueado
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-cyan transition-colors">
                          {module.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{module.summary}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge tone={isCompleted ? 'emerald' : 'cyan'}>+{module.xpReward} XP</Badge>
                          {score !== undefined && (
                            <span className="text-xs font-mono text-emerald">Nota: {score}%</span>
                          )}
                        </div>

                        {isUnlocked ? (
                          <Button
                            variant={isCompleted ? 'ghost' : 'primary'}
                            onClick={() => openModule(module.id)}
                            className="text-xs py-1.5 px-3"
                          >
                            <Play size={14} className="mr-1 inline" />
                            {isCompleted ? 'Repasar' : 'Estudiar'}
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Lock size={12} /> Requiere Módulo {module.id - 1}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Banner de Examen Final */}
        <section
          className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
            totalCompleted >= 8
              ? 'border-violet/60 bg-gradient-to-r from-violet/20 via-surface to-cyan/15 shadow-xl'
              : 'border-line bg-base/50 opacity-70'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-violet" size={24} />
                <h3 className="text-lg font-bold text-white">Certificación NetAscend (Examen Final)</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                25 preguntas aleatorias generadas por computadora que integran cálculo de subredes IPv4, saltos mágicos,
                FLSM, VLSM, sumarización e IPv6. Obtén ≥ 85% para generar tu certificado oficial descargable.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setActiveView('exam')}
              className="bg-violet hover:bg-violet/80 text-white shrink-0"
            >
              <Trophy size={16} className="mr-1.5" />
              {totalCompleted >= 8 ? 'Iniciar Certificación' : 'Ir al Examen Final'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
