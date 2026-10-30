import { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowUpRight, X } from 'lucide-react';
import { useProgress, type UserRank } from '../../state/ProgressContext';
import { getRankTierInfo, RANK_TIERS, RankBadge } from './RankBadge';

export function LevelUpModal() {
  const { rank, state } = useProgress();
  const prevRankRef = useRef<UserRank>(rank);
  const [promotedTo, setPromotedTo] = useState<UserRank | null>(null);

  useEffect(() => {
    const prevIdx = RANK_TIERS.findIndex((t) => t.rank === prevRankRef.current);
    const currIdx = RANK_TIERS.findIndex((t) => t.rank === rank);

    if (currIdx > prevIdx && state.xp > 0) {
      setPromotedTo(rank);
    }
    prevRankRef.current = rank;
  }, [rank, state.xp]);

  if (!promotedTo) return null;

  const tier = getRankTierInfo(promotedTo);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan/40 bg-card p-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Glow decorativo superior */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan/20 blur-3xl" />

        <button
          type="button"
          onClick={() => setPromotedTo(null)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Cerrar notificación de rango"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/40 bg-cyan/15 text-cyan shadow-lg shadow-cyan/10">
          <Sparkles className="h-7 w-7" />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-emerald/30 bg-emerald/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald">
          <ArrowUpRight className="h-3.5 w-3.5" /> Ascenso de Rango
        </span>

        <h3 id="levelup-title" className="mt-3 text-2xl font-extrabold text-white">
          ¡Nuevo Rango Desbloqueado!
        </h3>

        <div className="my-5 flex justify-center">
          <RankBadge rank={promotedTo} xp={state.xp} size="lg" />
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{tier.description}</p>

        <div className="mt-4 rounded-xl border border-line bg-slate-950/70 px-4 py-2.5 text-xs font-mono text-slate-400">
          Experiencia acumulada en sesión:{' '}
          <span className="font-bold text-amber-400">{state.xp} XP</span>
        </div>

        <button
          type="button"
          onClick={() => setPromotedTo(null)}
          className="mt-6 w-full rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan/20 hover:bg-cyan-400 transition cursor-pointer"
        >
          Continuar Ascendiendo
        </button>
      </div>
    </div>
  );
}
