import { Shield, Terminal, Cpu, Network, Award, Crown } from 'lucide-react';
import { type UserRank } from '../../state/ProgressContext';

export interface RankTierInfo {
  rank: UserRank;
  minXp: number;
  maxXp: number | null;
  colorClass: string;
  glowClass: string;
  badgeBgClass: string;
  description: string;
}

export const RANK_TIERS: RankTierInfo[] = [
  {
    rank: 'Novato',
    minXp: 0,
    maxXp: 250,
    colorClass: 'text-slate-300',
    glowClass: 'border-slate-700/80 shadow-none',
    badgeBgClass: 'bg-slate-800/80',
    description: 'Iniciando en numeración binaria y anatomía de direcciones IPv4.',
  },
  {
    rank: 'Técnico',
    minXp: 251,
    maxXp: 600,
    colorClass: 'text-cyan',
    glowClass: 'border-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.22)]',
    badgeBgClass: 'bg-cyan/10',
    description: 'Dominio operativo de máscaras CIDR y el Método del Salto.',
  },
  {
    rank: 'Analista',
    minXp: 601,
    maxXp: 1200,
    colorClass: 'text-emerald',
    glowClass: 'border-emerald/40 shadow-[0_0_14px_rgba(16,185,129,0.25)]',
    badgeBgClass: 'bg-emerald/10',
    description: 'Capacidad de análisis en subredes de 3er y 2do octeto sin errores.',
  },
  {
    rank: 'Ingeniero',
    minXp: 1201,
    maxXp: 2000,
    colorClass: 'text-violet',
    glowClass: 'border-violet/45 shadow-[0_0_16px_rgba(139,92,246,0.3)]',
    badgeBgClass: 'bg-violet/10',
    description: 'Especialista en planificación FLSM y diseño jerárquico VLSM.',
  },
  {
    rank: 'Arquitecto',
    minXp: 2001,
    maxXp: 3000,
    colorClass: 'text-amber-400',
    glowClass: 'border-amber-400/50 shadow-[0_0_18px_rgba(251,191,36,0.32)]',
    badgeBgClass: 'bg-amber-400/10',
    description: 'Arquitecto de sumarización BGP/OSPF, LPM e infraestructura IPv6.',
  },
  {
    rank: 'CCIE Mode',
    minXp: 3001,
    maxXp: null,
    colorClass: 'text-cyan-300',
    glowClass: 'border-cyan/70 shadow-[0_0_22px_rgba(6,182,212,0.5)] animate-pulse',
    badgeBgClass: 'bg-gradient-to-r from-cyan/20 via-violet/20 to-emerald/20',
    description: 'Maestría absoluta en cálculo de redes de nivel experto.',
  },
];

export function getRankTierInfo(rank: UserRank): RankTierInfo {
  return RANK_TIERS.find((t) => t.rank === rank) ?? RANK_TIERS[0];
}

export function getNextRankTierInfo(xp: number): {
  current: RankTierInfo;
  next: RankTierInfo | null;
  progressPercent: number;
  xpNeeded: number;
} {
  let currentIdx = 0;
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXp) {
      currentIdx = i;
      break;
    }
  }

  const current = RANK_TIERS[currentIdx];
  const next = currentIdx < RANK_TIERS.length - 1 ? RANK_TIERS[currentIdx + 1] : null;

  if (!next) {
    return { current, next: null, progressPercent: 100, xpNeeded: 0 };
  }

  const span = next.minXp - current.minXp;
  const gainedInTier = Math.max(0, xp - current.minXp);
  const progressPercent = Math.min(100, Math.round((gainedInTier / span) * 100));
  const xpNeeded = Math.max(0, next.minXp - xp);

  return { current, next, progressPercent, xpNeeded };
}

function RankIcon({ rank, className }: { rank: UserRank; className?: string }) {
  switch (rank) {
    case 'Novato':
      return <Terminal className={className} />;
    case 'Técnico':
      return <Cpu className={className} />;
    case 'Analista':
      return <Network className={className} />;
    case 'Ingeniero':
      return <Shield className={className} />;
    case 'Arquitecto':
      return <Award className={className} />;
    case 'CCIE Mode':
      return <Crown className={className} />;
  }
}

interface RankBadgeProps {
  rank: UserRank;
  xp: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RankBadge({ rank, xp, showProgress = false, size = 'sm' }: RankBadgeProps) {
  const { current, next, progressPercent, xpNeeded } = getNextRankTierInfo(xp);

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <div className="inline-flex flex-col">
      <div
        title={
          next
            ? `Rango ${rank} (${xp} XP) — Faltan ${xpNeeded} XP para ${next.rank}`
            : `Rango Máximo: ${rank} (${xp} XP)`
        }
        className={`inline-flex items-center rounded-lg border font-semibold transition-all duration-300 ${sizeStyles} ${current.badgeBgClass} ${current.glowClass}`}
      >
        <RankIcon rank={rank} className={`${iconSizes} ${current.colorClass}`} />
        <span className="text-slate-400 font-normal hidden sm:inline">Rango:</span>
        <span className={`font-mono font-bold tracking-tight ${current.colorClass}`}>
          {rank}
        </span>
      </div>

      {showProgress && next && (
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{xp} XP</span>
            <span>
              Próx: {next.rank} ({next.minXp} XP)
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-violet transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
