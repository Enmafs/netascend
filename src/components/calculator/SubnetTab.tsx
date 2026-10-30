import { ChevronDown, Network } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../lib/cn';
import { calculateSubnet } from '../../lib/net/ipv4';
import { parsePrefixOrMask } from '../../lib/net/parse';
import type { IPv4SubnetResult } from '../../lib/net/types';
import { BitsRow } from '../ui/BitsRow';
import { Badge, Button, Card, ErrorBox, Field, ResultRow, TextInput } from '../ui/primitives';
import { StepByStep } from './StepByStep';

function compute(ip: string, prefixText: string): { result?: IPv4SubnetResult; error?: string } {
  try {
    const prefix = parsePrefixOrMask(prefixText);
    return { result: calculateSubnet(ip, prefix) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Entrada inválida.' };
  }
}

export function SubnetTab() {
  const [ip, setIp] = useState('192.168.1.140');
  const [prefixText, setPrefixText] = useState('27');
  const [showSteps, setShowSteps] = useState(false);

  const { result, error } = useMemo(() => compute(ip, prefixText), [ip, prefixText]);
  const sliderValue = (() => {
    try {
      return parsePrefixOrMask(prefixText);
    } catch {
      return result?.prefix ?? 24;
    }
  })();

  return (
    <div className="space-y-5">
      <Card title="Calculadora de subred IPv4" icon={<Network size={16} className="text-cyan" aria-hidden />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dirección IP" htmlFor="subnet-ip" hint="Cualquier IP del segmento: no tiene que ser la dirección de red.">
            <TextInput
              id="subnet-ip"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="192.168.1.140"
              inputMode="decimal"
              aria-invalid={!!error && !result}
            />
          </Field>
          <Field label="Prefijo o máscara" htmlFor="subnet-prefix" hint="Ejemplos: /27 · 27 · 255.255.255.224">
            <TextInput
              id="subnet-prefix"
              value={prefixText}
              onChange={(e) => setPrefixText(e.target.value)}
              placeholder="/27"
              aria-invalid={!!error && !result}
            />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-xs text-slate-500">/0</span>
          <input
            type="range"
            min={0}
            max={32}
            value={sliderValue}
            onChange={(e) => setPrefixText(e.target.value)}
            aria-label="Prefijo CIDR"
            className="h-2 flex-1 cursor-pointer accent-cyan"
          />
          <span className="font-mono text-xs text-slate-500">/32</span>
          <Badge tone="cyan">/{sliderValue}</Badge>
        </div>
      </Card>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">Octeto de trabajo: {result.workingOctet}º</Badge>
            <Badge tone="violet">Salto: {result.salto}</Badge>
            <Badge tone="emerald">Clase {result.ipClass}</Badge>
            <Badge tone={result.scope === 'Pública' ? 'amber' : 'slate'}>{result.scope}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResultRow label="Dirección de red" value={result.networkAddress} tone="cyan" />
            <ResultRow label="Broadcast" value={result.broadcastAddress} tone="violet" />
            <ResultRow label="Siguiente red" value={result.nextNetworkAddress ?? 'No existe'} copy={!!result.nextNetworkAddress} />
            <ResultRow label="Primera IP útil" value={result.firstUsableIP} tone="emerald" />
            <ResultRow label="Última IP útil" value={result.lastUsableIP} tone="emerald" />
            <ResultRow label="Máscara decimal" value={result.maskDecimal} />
            <ResultRow label="Wildcard" value={result.wildcardDecimal} />
            <ResultRow label="Total de IPs" value={result.totalIPs.toLocaleString('es')} hint={`2^${32 - result.prefix}`} />
            <ResultRow label="Hosts útiles" value={result.usableHosts.toLocaleString('es')} tone="emerald" />
          </div>

          <Card title="Máscara e IP en binario">
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs uppercase text-slate-400">Máscara</p>
                <BitsRow binary={result.maskBinary} prefix={result.prefix} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-slate-400">IP {result.ip}</p>
                <BitsRow
                  binary={result.ip
                    .split('.')
                    .map((o) => Number(o).toString(2).padStart(8, '0'))
                    .join('.')}
                  prefix={result.prefix}
                />
              </div>
              <p className="text-xs text-slate-500">
                <span className="text-cyan">Cian</span> = bits de red ({result.prefix}) ·{' '}
                <span className="text-violet">violeta</span> = bits de host ({32 - result.prefix}) · la línea blanca marca el corte.
              </p>
            </div>
          </Card>

          <div>
            <Button variant="ghost" onClick={() => setShowSteps((v) => !v)}>
              <ChevronDown size={16} className={cn('transition-transform', showSteps && 'rotate-180')} aria-hidden />
              {showSteps ? 'Ocultar explicación' : 'Ver explicación paso a paso'}
            </Button>
            {showSteps && (
              <Card className="mt-3" title="El método de los 5 pasos">
                <StepByStep result={result} />
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
