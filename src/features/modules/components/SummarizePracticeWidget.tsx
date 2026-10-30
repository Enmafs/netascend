import { useState } from 'react';
import { Route, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, TextArea, Badge } from '../../../components/ui/primitives';
import { summarizeRoutes } from '../../../lib/net/summarization';

const PRESET_ROUTES = [
  '192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24',
  '10.1.0.0/24\n10.1.1.0/24\n10.1.2.0/24\n10.1.3.0/24\n10.1.4.0/24',
  '172.16.0.0/16\n172.17.0.0/16\n172.18.0.0/16\n172.19.0.0/16',
];

export function SummarizePracticeWidget() {
  const [text, setText] = useState(PRESET_ROUTES[0]);

  const lines = text.split('\n');
  const result = summarizeRoutes(lines);

  return (
    <Card title="Laboratorio Interactivo: Sumarización de Rutas (Superredes)" icon={<Route className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Ingresa varias redes contiguas en formato CIDR (una por línea) para encontrar el prefijo común más largo
        que las engloba y detectar si cubre redes extra.
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setText(PRESET_ROUTES[0])}
          className="rounded-lg border border-line bg-base/60 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-cyan"
        >
          4 redes /24 contiguas
        </button>
        <button
          type="button"
          onClick={() => setText(PRESET_ROUTES[1])}
          className="rounded-lg border border-line bg-base/60 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-cyan"
        >
          5 redes (con hueco extra)
        </button>
        <button
          type="button"
          onClick={() => setText(PRESET_ROUTES[2])}
          className="rounded-lg border border-line bg-base/60 px-2.5 py-1 text-xs font-mono text-slate-300 hover:border-cyan"
        >
          4 redes /16 de Clase B
        </button>
      </div>

      <div className="max-w-md mb-4">
        <TextArea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="192.168.0.0/24&#10;192.168.1.0/24"
          aria-label="Lista de redes CIDR a sumarizar"
        />
      </div>

      {result.error && (
        <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/30 mb-4">
          {result.error}
        </p>
      )}

      {result.summaryRoute && !result.error && (
        <div className="space-y-4">
          <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase text-slate-400">Superred Sumarizada Mínima:</span>
                <p className="font-mono text-2xl font-bold text-cyan mt-0.5">{result.summaryRoute}</p>
              </div>
              <div className="flex items-center gap-2">
                {result.includesExtra ? (
                  <Badge tone="amber">
                    <AlertTriangle size={14} className="mr-1 inline" />
                    +{result.extraIPs} IPs extra incluidas
                  </Badge>
                ) : (
                  <Badge tone="emerald">
                    <CheckCircle2 size={14} className="mr-1 inline" />
                    Ajuste 100% Exacto
                  </Badge>
                )}
              </div>
            </div>
            {result.includesExtra && (
              <p className="text-xs text-amber-200/90 mt-2">
                Advertencia de enrutamiento: La superred engloba {result.summaryTotalIPs} IPs en total, pero tus redes originales solo suman {result.inputTotalIPs}. Cuidado con generar agujeros negros de tráfico hacia subredes no existentes.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-base/60 p-3 text-xs text-slate-300">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Redes Cubiertas ({result.coveredRoutes.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              {result.coveredRoutes.map((r) => (
                <span key={r} className="rounded bg-surface px-2 py-0.5 border border-line text-slate-200">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
