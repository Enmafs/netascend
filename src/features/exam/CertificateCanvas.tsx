import { forwardRef } from 'react';
import { Award, ShieldCheck, Network, CheckCircle2 } from 'lucide-react';
import { type UserRank } from '../../state/ProgressContext';

export interface CertificateCanvasProps {
  studentName: string;
  score: number;
  correctCount?: number;
  totalQuestions?: number;
  verificationCode: string;
  issueDate: string;
  rank?: UserRank;
}

export const CertificateCanvas = forwardRef<HTMLDivElement, CertificateCanvasProps>(
  function CertificateCanvas(
    {
      studentName,
      score,
      correctCount = 24,
      totalQuestions = 25,
      verificationCode,
      issueDate,
      rank = 'Arquitecto',
    },
    ref
  ) {
    const displayName = studentName.trim() || 'ESTUDIANTE DESTACADO';

    return (
      <div
        ref={ref}
        style={{ backgroundColor: '#0b0f19' }}
        className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border-2 border-cyan/50 bg-[#0b0f19] p-3 sm:p-5 text-slate-100 shadow-2xl"
      >
        {/* Marco ornamental interior doble */}
        <div
          style={{ backgroundColor: '#111827' }}
          className="relative overflow-hidden rounded-xl border border-violet/40 bg-[#111827] px-6 py-8 sm:px-12 sm:py-10"
        >
          {/* Patrón de cuadrícula sutil cyber/terminal */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.45) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Esquinas ornamentales */}
          <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-cyan" />
          <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-cyan" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-violet" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-violet" />

          {/* Cabecera de la Academia */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan/40 bg-slate-950/90 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-cyan">
              <Network className="h-4 w-4 text-cyan" />
              <span>NetAscend — Network Engineering Academy</span>
            </div>

            <p className="mt-4 text-[11px] font-mono uppercase tracking-[0.28em] text-amber-400">
              Credencial Oficial de Dominio Matemático de Redes
            </p>

            <h1 className="mt-2 max-w-2xl text-lg sm:text-2xl font-extrabold tracking-tight text-white uppercase leading-snug">
              CERTIFICADO DE EXCELENCIA TÉCNICA EN SUBNETTING &amp; DIRECCIONAMIENTO IP
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-cyan/60" />
              <Award className="h-5 w-5 text-amber-400" />
              <span className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-violet/60" />
            </div>

            <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">
              Se otorga el presente reconocimiento de honor a:
            </p>

            {/* Nombre del estudiante */}
            <div className="mt-2 border-b-2 border-cyan/40 px-8 pb-2">
              <h2 className="font-mono text-2xl sm:text-4xl font-black tracking-wide text-cyan">
                {displayName}
              </h2>
            </div>

            {/* Descripción de competencias */}
            <p className="mt-5 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Por haber superado con rigor matemático la evaluación integral de ingeniería de redes,
              demostrando dominio práctico y velocidad de cálculo en:
            </p>

            {/* Chips de competencias validadas */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl">
              {[
                'Cálculo Binario Octeto a Octeto',
                'Método del Salto y las Cajas (/1 a /32)',
                'Diseño Jerárquico FLSM & VLSM sin Solapamiento',
                'Sumarización BGP/OSPF & Longest Prefix Match',
                'Arquitectura IPv6 & EUI-64',
              ].map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/90 bg-slate-900/90 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald" />
                  {skill}
                </span>
              ))}
            </div>

            {/* Métricas y Sello de Nivel */}
            <div className="mt-6 grid w-full max-w-2xl grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-left">
              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Calificación
                </span>
                <span className="mt-0.5 block font-mono text-sm sm:text-base font-extrabold text-emerald">
                  {score}% — Experto
                </span>
                <span className="block text-[10px] font-mono text-slate-500">
                  ({correctCount}/{totalQuestions} aciertos)
                </span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nivel Validado
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs sm:text-sm font-bold text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  CCNA / CCNP
                </span>
                <span className="block text-[10px] font-mono text-slate-500">
                  Rango: {rank}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Fecha de Emisión
                </span>
                <span className="mt-0.5 block font-mono text-xs sm:text-sm font-bold text-slate-200">
                  {issueDate}
                </span>
                <span className="block text-[10px] font-mono text-slate-500">
                  Sesión Verificada
                </span>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ID de Verificación
                </span>
                <span className="mt-0.5 block font-mono text-xs sm:text-sm font-bold text-cyan">
                  {verificationCode}
                </span>
                <span className="block text-[10px] font-mono text-slate-500">
                  RFC 1918 / 4291
                </span>
              </div>
            </div>

            {/* Firmas digitales y Sello Oficial */}
            <div className="mt-7 grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 items-center gap-6 pt-3">
              <div className="text-center">
                <p className="font-mono text-sm italic tracking-wider text-cyan/90">
                  A. Turing-CIDR
                </p>
                <div className="mx-auto my-1.5 h-px w-36 bg-slate-700" />
                <p className="text-[11px] font-bold text-slate-300">
                  Lead Network Architect
                </p>
                <p className="text-[10px] text-slate-500">
                  División de Protocolos IPv4/IPv6
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-amber-400/70 bg-amber-400/10 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-tighter">
                    VERIFIED
                  </span>
                </div>
                <span className="mt-1 text-[9px] font-mono uppercase tracking-widest text-amber-400/90">
                  Verified CCNA / CCNP Level
                </span>
              </div>

              <div className="text-center">
                <p className="font-mono text-sm italic tracking-wider text-violet-300">
                  E. Radia-VLSM
                </p>
                <div className="mx-auto my-1.5 h-px w-36 bg-slate-700" />
                <p className="text-[11px] font-bold text-slate-300">
                  Director of Instructional Engineering
                </p>
                <p className="text-[10px] text-slate-500">
                  NetAscend Certification Board
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
