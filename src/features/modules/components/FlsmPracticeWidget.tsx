import { useState } from 'react';
import { Split } from 'lucide-react';
import { Card, TextInput } from '../../../components/ui/primitives';
import { splitBySubnetCount, splitByHosts } from '../../../lib/net/flsm';

export function FlsmPracticeWidget() {
  const [baseIp, setBaseIp] = useState('192.168.1.0');
  const [basePrefix, setBasePrefix] = useState(24);
  const [mode, setMode] = useState<'count' | 'hosts'>('count');
  const [value, setValue] = useState(4);

  let result = null;
  let error = '';

  try {
    if (mode === 'count') {
      result = splitBySubnetCount(baseIp.trim(), basePrefix, value);
    } else {
      result = splitByHosts(baseIp.trim(), basePrefix, value);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error en cálculo FLSM';
  }

  return (
    <Card title="Laboratorio Interactivo: Simulador FLSM en Vivo" icon={<Split className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Divide una red base en porciones idénticas indicando la cantidad de subredes deseadas o la cantidad de hosts
        por subred.
      </p>

      {/* Inputs Base */}
      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mb-4">
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Red Base:</label>
          <TextInput value={baseIp} onChange={(e) => setBaseIp(e.target.value)} placeholder="192.168.1.0" />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Prefijo Base (/{basePrefix}):</label>
          <input
            type="range"
            min="8"
            max="30"
            value={basePrefix}
            onChange={(e) => setBasePrefix(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-cyan"
            aria-label="Prefijo Base"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">
            {mode === 'count' ? 'Nº de Subredes:' : 'Hosts por subred:'}
          </label>
          <TextInput
            type="number"
            min="1"
            max="1024"
            value={value}
            onChange={(e) => setValue(Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>

      {/* Modo */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('count');
            setValue(4);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'count' ? 'border-cyan bg-cyan/20 text-cyan' : 'border-line bg-base/60 text-slate-400'
          }`}
        >
          Dividir por Nº de Subredes
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('hosts');
            setValue(30);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'hosts' ? 'border-cyan bg-cyan/20 text-cyan' : 'border-line bg-base/60 text-slate-400'
          }`}
        >
          Dividir por Cantidad de Hosts
        </button>
      </div>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {result && !error && (
        <div className="space-y-4">
          {/* Métricas FLSM */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-lg border border-line bg-base/60 p-2.5">
              <span className="text-[10px] uppercase text-slate-400">Bits Prestados:</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-cyan">+{result.borrowedBits} bits</p>
            </div>
            <div className="rounded-lg border border-line bg-base/60 p-2.5">
              <span className="text-[10px] uppercase text-slate-400">Nuevo Prefijo:</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-emerald">/{result.newPrefix}</p>
            </div>
            <div className="rounded-lg border border-line bg-base/60 p-2.5">
              <span className="text-[10px] uppercase text-slate-400">Subredes Creadas:</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-violet">{result.generated}</p>
            </div>
            <div className="rounded-lg border border-line bg-base/60 p-2.5">
              <span className="text-[10px] uppercase text-slate-400">Hosts Útiles c/u:</span>
              <p className="mt-0.5 font-mono text-sm font-bold text-amber-300">{result.hostsPerSubnet}</p>
            </div>
          </div>

          {/* Tabla de Subredes */}
          <div className="overflow-x-auto rounded-xl border border-line bg-surface/90">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-base/80 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Red / Prefijo</th>
                  <th className="py-2.5 px-3">Rango Útil</th>
                  <th className="py-2.5 px-3">Broadcast</th>
                  <th className="py-2.5 px-3">Total IPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 font-mono text-slate-300">
                {result.subnets.slice(0, 16).map((sub, idx) => (
                  <tr key={sub.networkAddress} className="hover:bg-cyan/5">
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-cyan">
                      {sub.networkAddress}/{sub.prefix}
                    </td>
                    <td className="py-2 px-3 text-emerald">
                      {sub.firstUsableIP} – {sub.lastUsableIP}
                    </td>
                    <td className="py-2 px-3 text-violet">{sub.broadcastAddress}</td>
                    <td className="py-2 px-3 text-slate-400">{sub.totalIPs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.generated > 16 && (
              <p className="p-2 text-center text-[11px] text-slate-500">
                Mostrando 16 de {result.generated} subredes generadas.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
