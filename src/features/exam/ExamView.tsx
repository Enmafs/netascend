import { useState } from 'react';
import {
  Award,
  Clock,
  ArrowLeft,
  Infinity as InfinityIcon,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Unlock,
} from 'lucide-react';
import { useProgress } from '../../state/ProgressContext';
import { Card, Button, Badge } from '../../components/ui/primitives';
import { ExamContainer } from './ExamContainer';
import { EXAM_CATEGORIES } from '../../lib/quiz/generator';

export function ExamView() {
  const { state, setActiveView } = useProgress();
  const [started, setStarted] = useState(false);
  const [timedMode, setTimedMode] = useState(true);
  const [directAccessOverride, setDirectAccessOverride] = useState(false);

  const totalCompleted = state.completedModuleIds.length;
  const isEligible = totalCompleted >= 8 || directAccessOverride;

  if (started) {
    return (
      <ExamContainer
        initialTimed={timedMode}
        onExit={() => setStarted(false)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <Button
          variant="ghost"
          onClick={() => setActiveView('modules')}
          className="text-xs py-1.5 px-3"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Volver a la Academia
        </Button>
        <Badge tone="violet">Certificación Oficial NetAscend</Badge>
      </div>

      {!isEligible ? (
        <Card
          title="Acceso al Examen Final"
          icon={<Award className="text-violet" size={20} />}
        >
          <div className="text-center py-8 max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet/40 bg-violet/10 text-violet shadow-lg">
              <Award size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">
              Requisito Recomendado: 8 de 10 Módulos Completados
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Para garantizar el dominio del Método del Salto, el tercer octeto,
              FLSM, VLSM, Sumarización y fundamentos IPv6, se recomienda aprobar
              al menos 8 módulos de la academia antes de rendir el examen global.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2 font-mono text-xs text-cyan">
              <span>Módulos completados en esta sesión:</span>
              <strong>{totalCompleted} / 10</strong>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => setActiveView('modules')}
              >
                Continuar en la Academia
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDirectAccessOverride(true)}
                className="text-xs"
              >
                <Unlock size={14} className="mr-1.5 text-amber-400" />
                Soy Experto: Desbloquear Examen Directamente
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          title="Examen de Certificación NetAscend (25 Preguntas Globales)"
          icon={<Award className="text-cyan" size={20} />}
        >
          <div className="max-w-3xl mx-auto py-4 space-y-6">
            {/* Banner descriptivo */}
            <div className="rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/10 via-slate-950 to-violet/10 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan">
                    <Sparkles className="h-3.5 w-3.5" /> Evaluación Técnica Integral
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Credencial de Especialista en Subnetting &amp; VLSM
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Supera 25 desafíos generados matemáticamente en tiempo real
                    con una precisión mínima del <strong>85% (22/25)</strong> para
                    obtener tu certificado oficial descargable en PNG de alta resolución.
                  </p>
                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-lg">
                  <ShieldCheck className="h-9 w-9" />
                </div>
              </div>
            </div>

            {/* Desglose de los 5 Dominios Evaluados */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estructura del Examen (5 Reactivos por Dominio = 25 Preguntas)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {EXAM_CATEGORIES.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-line bg-slate-950/70 p-3 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan">
                        Dominio 0{idx + 1} • Mód. {cat.moduleIds[0]}–{cat.moduleIds[1]}
                      </span>
                      <h4 className="mt-1 text-xs font-bold text-white">
                        {cat.shortTitle}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                        {cat.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald">
                      <span>5 preguntas</span>
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector de Modalidad de Tiempo */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selecciona tu Modalidad de Evaluación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTimedMode(true)}
                  className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                    timedMode
                      ? 'border-cyan bg-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'border-line bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                      <Clock className="h-4 w-4 text-cyan" />
                      Cronometrado (45 Minutos)
                    </span>
                    {timedMode && <Badge tone="cyan">Recomendado</Badge>}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Simulación real de examen de certificación CCNA/CCNP con
                    reloj regresivo y entrega automática al agotar el tiempo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTimedMode(false)}
                  className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                    !timedMode
                      ? 'border-cyan bg-cyan/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'border-line bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                      <InfinityIcon className="h-4 w-4 text-emerald" />
                      Modo Sin Límite de Tiempo
                    </span>
                    {!timedMode && <Badge tone="emerald">Activo</Badge>}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Evaluación enfocada 100% en exactitud matemática, ideal para
                    resolver cada paquete y tabla VLSM a tu propio ritmo.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setStarted(true)}
                className="w-full py-3.5 text-sm sm:text-base font-extrabold"
              >
                Iniciar Examen de Certificación (25 Reactivos)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
