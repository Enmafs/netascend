import { Globe } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calculateIPv6Subnet, type IPv6SubnetResult } from '../../lib/net/ipv6';
import { Badge, Card, ErrorBox, Field, ResultRow, TextInput } from '../ui/primitives';

const TYPE_INFO: Record<IPv6SubnetResult['type'], string> = {
  GUA: 'Global Unicast: dirección pública enrutable en internet (2000::/3).',
  ULA: 'Unique Local: privada, equivalente a RFC 1918 en IPv4 (fc00::/7).',
  'Link-Local': 'Solo válida dentro del enlace local; no se enruta (fe80::/10).',
  Multicast: 'Una a muchos (ff00::/8). IPv6 no tiene broadcast.',
  Loopback: 'Este mismo equipo (::1), como 127.0.0.1.',
  'Sin especificar': 'Dirección "ninguna" (::), usada antes de obtener IP.',
  Reservada: 'Rango reservado o aún no asignado por la IANA.',
};

function compute(ip: string, prefixText: string): { result?: IPv6SubnetResult; error?: string } {
  try {
    const clean = prefixText.trim().replace(/^\//, '');
    if (!/^\d{1,3}$/.test(clean)) throw new Error('El prefijo debe ser un número entre 0 y 128.');
    return { result: calculateIPv6Subnet(ip, Number(clean)) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Entrada inválida.' };
  }
}

export function IPv6Tab() {
  const [ip, setIp] = useState('2803:1920:abcd:1234:5678::1');
  const [prefixText, setPrefixText] = useState('56');
  const { result, error } = useMemo(() => compute(ip, prefixText), [ip, prefixText]);

  const slider = (() => {
    const n = Number(prefixText.trim().replace(/^\//, ''));
    return Number.isInteger(n) && n >= 0 && n <= 128 ? n : 64;
  })();

  return (
    <div className="space-y-5">
      <Card title="Calculadora IPv6" icon={<Globe size={16} className="text-cyan" aria-hidden />}>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <Field label="Dirección IPv6" htmlFor="v6-ip" hint="Acepta formas abreviadas (::), mayúsculas y IPv4 incrustada.">
            <TextInput id="v6-ip" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="2803:1920::1" aria-invalid={!!error && !result} />
          </Field>
          <Field label="Prefijo" htmlFor="v6-prefix">
            <TextInput id="v6-prefix" value={prefixText} onChange={(e) => setPrefixText(e.target.value)} placeholder="/56" aria-invalid={!!error && !result} />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-xs text-slate-500">/0</span>
          <input type="range" min={0} max={128} value={slider} onChange={(e) => setPrefixText(e.target.value)} aria-label="Prefijo IPv6" className="h-2 flex-1 cursor-pointer accent-cyan" />
          <span className="font-mono text-xs text-slate-500">/128</span>
          <Badge tone="cyan">/{slider}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            ['/32', 'ISP'],
            ['/48', 'sitio'],
            ['/56', 'casa (DHCPv6-PD)'],
            ['/64', 'subred estándar'],
          ].map(([p, label]) => (
            <button key={p} type="button" onClick={() => setPrefixText(p.slice(1))} className="rounded-full border border-line px-2.5 py-1 text-slate-400 hover:border-cyan/60 hover:text-cyan">
              {p} · {label}
            </button>
          ))}
        </div>
      </Card>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={result.type === 'GUA' ? 'emerald' : 'violet'}>{result.type}</Badge>
            {result.rir && <Badge tone="cyan">{result.rir}</Badge>}
          </div>
          <p className="text-sm text-slate-400">{TYPE_INFO[result.type]}</p>

          <div className="grid gap-3 lg:grid-cols-2">
            <ResultRow label="Forma comprimida (RFC 5952)" value={result.compressed} tone="cyan" />
            <ResultRow label="Forma expandida" value={result.expanded} />
            <ResultRow label="Red (CIDR)" value={result.networkCIDR} tone="emerald" />
            <ResultRow label="Red expandida" value={result.networkExpanded} />
            <ResultRow label="Primera dirección" value={result.firstAddress} />
            <ResultRow label="Última dirección" value={result.lastAddress} tone="violet" />
            <ResultRow label="Direcciones totales" value={result.totalAddresses.toLocaleString('es')} copy={false} hint={`2^${128 - result.prefix}`} />
            <ResultRow
              label="Subredes /64 disponibles"
              value={result.prefix <= 64 ? result.subnets64.toLocaleString('es') : 'Menor que una /64'}
              tone="emerald"
              copy={false}
              hint={result.prefix <= 64 ? `2^${64 - result.prefix}` : 'Las subredes de usuarios deberían ser /64'}
            />
          </div>
        </>
      )}
    </div>
  );
}
