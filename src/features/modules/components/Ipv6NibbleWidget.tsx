import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Card, TextInput, Badge } from '../../../components/ui/primitives';
import { calculateIPv6Subnet } from '../../../lib/net/ipv6';

const PRESETS = [
  { label: 'LACNIC (Latinoamérica)', ip: '2800:3f0:4001:815::200e', prefix: 64 },
  { label: 'ARIN (EE. UU.)', ip: '2607:f8b0:4005:809::200e', prefix: 64 },
  { label: 'ULA (Privada interna)', ip: 'fd00:cafe:1234:5678::1', prefix: 48 },
  { label: 'Link-Local (Enlace)', ip: 'fe80::1ff:fe00:3a60', prefix: 64 },
  { label: 'Loopback (Localhost)', ip: '::1', prefix: 128 },
];

export function Ipv6NibbleWidget() {
  const [ip, setIp] = useState(PRESETS[0].ip);
  const [prefix, setPrefix] = useState(PRESETS[0].prefix);

  let result = null;
  let error = '';

  try {
    result = calculateIPv6Subnet(ip.trim(), prefix);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error en IPv6';
  }

  return (
    <Card title="Laboratorio Interactivo: Compresión RFC 5952 y Subnetting /64" icon={<Globe className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Prueba direcciones IPv6 para ver cómo se comprimen y expanden según la norma RFC 5952, y cuántas subredes /64
        contiene un prefijo corporativo.
      </p>

      {/* Selector de Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.ip}
            type="button"
            onClick={() => {
              setIp(p.ip);
              setPrefix(p.prefix);
            }}
            className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
              ip === p.ip
                ? 'border-cyan bg-cyan/20 text-cyan font-bold'
                : 'border-line bg-base/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mb-4">
        <div className="sm:col-span-2">
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Dirección IPv6:</label>
          <TextInput value={ip} onChange={(e) => setIp(e.target.value)} placeholder="2001:db8::1" />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Prefijo (/{prefix}):</label>
          <input
            type="range"
            min="0"
            max="128"
            value={prefix}
            onChange={(e) => setPrefix(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-cyan"
            aria-label="Prefijo IPv6"
          />
        </div>
      </div>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {result && !error && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-base/60 p-3">
              <span className="text-[10px] uppercase text-slate-400">Tipo de Dirección:</span>
              <div className="mt-1">
                <Badge tone={result.type === 'GUA' ? 'cyan' : result.type === 'ULA' ? 'emerald' : 'violet'}>
                  {result.type} ({result.type === 'GUA' ? 'Pública Global' : result.type === 'ULA' ? 'Privada Local' : 'Enlace'})
                </Badge>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-base/60 p-3">
              <span className="text-[10px] uppercase text-slate-400">Registro Regional (RIR):</span>
              <p className="mt-1 font-mono text-xs font-bold text-slate-200">
                {result.rir || 'No aplicable (Privada o Especial)'}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-base/60 p-3">
              <span className="text-[10px] uppercase text-slate-400">Subredes /64 Disponibles:</span>
              <p className="mt-1 font-mono text-base font-bold text-emerald">
                {result.subnets64 > 0n ? result.subnets64.toLocaleString('es') : 'Menor a /64'}
              </p>
            </div>
          </div>

          {/* Comparativa Expandida vs Comprimida */}
          <div className="rounded-xl border border-line bg-surface/90 p-4 space-y-3">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                Forma Comprimida Estándar (RFC 5952):
              </span>
              <p className="font-mono text-base font-bold text-cyan break-all">{result.compressed}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                Forma Expandida Completa (32 caracteres hex, 8 hextetos):
              </span>
              <p className="font-mono text-xs text-slate-400 break-all">{result.expanded}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                Red IPv6 resultante:
              </span>
              <p className="font-mono text-sm font-semibold text-emerald">{result.networkCIDR}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
