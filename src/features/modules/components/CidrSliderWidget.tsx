import { useState } from 'react';
import { Sliders, Zap, Info } from 'lucide-react';
import { Card, Badge } from '../../../components/ui/primitives';
import { prefixToMask, longToIp, prefixToWildcard, getWorkingOctet, getSalto } from '../../../lib/net/ipv4';
import { BitsRow } from '../../../components/ui/BitsRow';

export function CidrSliderWidget() {
  const [prefix, setPrefix] = useState(24);

  const maskLong = prefixToMask(prefix);
  const maskDecimal = longToIp(maskLong);
  const wildcard = prefixToWildcard(prefix);
  const workingOctet = getWorkingOctet(prefix);
  const salto = getSalto(prefix);

  const totalIps = prefix === 0 ? 4294967296 : Math.pow(2, 32 - prefix);
  const usableHosts =
    prefix === 31 ? 2 : prefix === 32 ? 1 : prefix === 0 ? 4294967294 : Math.max(0, totalIps - 2);

  const maskBinary = maskDecimal
    .split('.')
    .map((o) => Number(o).toString(2).padStart(8, '0'))
    .join('.');

  return (
    <Card title="Laboratorio Interactivo: Explorador de Máscaras y CIDR (/0 a /32)" icon={<Sliders className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Mueve el control deslizante para ver cómo cada bit en 1 congela la porción de red y reduce el espacio de hosts.
      </p>

      {/* Slider y Prefijo */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-line bg-base/70 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Prefijo:</span>
          <span className="font-mono text-2xl font-black text-cyan">/{prefix}</span>
        </div>
        <input
          type="range"
          min="0"
          max="32"
          value={prefix}
          onChange={(e) => setPrefix(Number(e.target.value))}
          className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-cyan"
          aria-label="Prefijo CIDR"
        />
        <div className="flex gap-2">
          {prefix === 0 && <Badge tone="violet">Ruta por Defecto (/0)</Badge>}
          {prefix === 31 && <Badge tone="emerald">RFC 3021 Punto a Punto</Badge>}
          {prefix === 32 && <Badge tone="amber">Host Único (/32)</Badge>}
          {prefix >= 24 && prefix <= 30 && <Badge tone="cyan">Subred LAN</Badge>}
        </div>
      </div>

      {/* Visualización Binaria */}
      <div className="mt-4 rounded-xl border border-line bg-base/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase text-slate-400 flex items-center gap-1.5">
            <Zap size={14} className="text-cyan" />
            Máscara en Binario ({prefix} unos de red + {32 - prefix} ceros de host):
          </span>
          <span className="font-mono text-xs text-slate-300">
            Decimal: <strong className="text-white">{maskDecimal}</strong>
          </span>
        </div>
        <div className="p-3 bg-surface rounded-lg border border-line/60 overflow-x-auto">
          <BitsRow binary={maskBinary} prefix={prefix} />
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-base/60 p-3">
          <span className="text-[11px] uppercase text-slate-400">Octeto de Trabajo:</span>
          <p className="mt-1 font-mono text-base font-bold text-cyan">
            {prefix === 0 ? 'Ninguno (/0)' : `${workingOctet}º Octeto`}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {workingOctet === 4 ? '/25 a /32' : workingOctet === 3 ? '/17 a /24' : workingOctet === 2 ? '/9 a /16' : '/1 a /8'}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-base/60 p-3">
          <span className="text-[11px] uppercase text-slate-400">Salto (256 - máscara):</span>
          <p className="mt-1 font-mono text-base font-bold text-emerald">
            {salto}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Tamaño de la caja
          </p>
        </div>

        <div className="rounded-lg border border-line bg-base/60 p-3">
          <span className="text-[11px] uppercase text-slate-400">Total de IPs:</span>
          <p className="mt-1 font-mono text-base font-bold text-violet">
            {totalIps.toLocaleString('es')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            2^{32 - prefix}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-base/60 p-3">
          <span className="text-[11px] uppercase text-slate-400">Hosts Útiles:</span>
          <p className="mt-1 font-mono text-base font-bold text-amber-300">
            {usableHosts.toLocaleString('es')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {prefix === 31 ? 'Ambas útiles (RFC 3021)' : prefix === 32 ? '1 sola IP' : 'Total - 2'}
          </p>
        </div>
      </div>

      {/* Wildcard note */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-base/40 p-2.5 rounded-lg border border-line">
        <span className="flex items-center gap-1.5">
          <Info size={14} className="text-slate-400" />
          Máscara Wildcard (inversa para ACLs/OSPF):
        </span>
        <span className="font-mono font-semibold text-slate-200">{wildcard}</span>
      </div>
    </Card>
  );
}
