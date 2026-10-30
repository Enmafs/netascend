import { useRef, useState } from 'react';
import { Download, Award, RotateCcw, Check, AlertCircle, X } from 'lucide-react';
import { CertificateCanvas } from './CertificateCanvas';
import { downloadCertificatePng } from '../../lib/certificate';
import { type UserRank } from '../../state/ProgressContext';

interface CertificateModalProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  verificationCode: string;
  issueDate: string;
  rank: UserRank;
  onClose?: () => void;
  onRetryExam?: () => void;
}

export function CertificateModal({
  score,
  correctCount,
  totalQuestions,
  verificationCode,
  issueDate,
  rank,
  onClose,
  onRetryExam,
}: CertificateModalProps) {
  const [studentName, setStudentName] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadedSuccess, setDownloadedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    setErrorMsg(null);
    setDownloadedSuccess(false);

    try {
      await downloadCertificatePng(
        certRef.current,
        studentName.trim() || 'Estudiante_NetAscend'
      );
      setDownloadedSuccess(true);
    } catch {
      setErrorMsg(
        'No se pudo exportar la imagen automáticamente en este navegador. Intenta nuevamente.'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de controles del diploma */}
      <div className="rounded-2xl border border-emerald/40 bg-card p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald/40 bg-emerald/15 text-emerald">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                ¡Certificación NetAscend Desbloqueada!
              </h2>
              <p className="text-xs text-slate-400">
                Personaliza tu nombre completo y descarga tu diploma oficial en alta resolución (PNG 2x).
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Ver Desglose del Examen
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="flex-1">
            <label
              htmlFor="certificate-student-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2"
            >
              Nombre Completo para el Certificado
            </label>
            <input
              id="certificate-student-name"
              type="text"
              maxLength={48}
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setDownloadedSuccess(false);
              }}
              placeholder="Ej. Ing. Enmanuel Rodríguez"
              className="w-full rounded-xl border border-line bg-slate-950 px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald/20 hover:bg-emerald-400 disabled:opacity-50 transition cursor-pointer"
            >
              {downloadedSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  ¡Descargado en PNG!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {downloading ? 'Generando PNG HD...' : 'Descargar Certificado (PNG)'}
                </>
              )}
            </button>

            {onRetryExam && (
              <button
                type="button"
                onClick={onRetryExam}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Nuevo Intento
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Lienzo del Certificado exportable */}
      <div className="overflow-x-auto pb-2">
        <CertificateCanvas
          ref={certRef}
          studentName={studentName}
          score={score}
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          verificationCode={verificationCode}
          issueDate={issueDate}
          rank={rank}
        />
      </div>
    </div>
  );
}
