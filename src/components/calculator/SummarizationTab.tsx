import { Route } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ipToLong, longToBinaryDotted } from '../../lib/net/ipv4';
import { parseCIDR } from '../../lib/net/parse';
import { summarizeRoutes } from '../../lib/net/summarization';
import { BitsRow } from '../ui/BitsRow';
import { Badge, Card, ErrorBox, Field, ResultRow, TextArea, WarnBox } from '../ui/primitives';

const DEFAULT_ROUTES = ['192.168.0.0/24', '192.168.1.0/24', '192.168.2.0/24', '192.168.3.0/24'].join('\n');

export function SummarizationTab() {
  const [text, setText] = useState(DEFAULT_ROUTES);
  const result = useMemo(() => summarizeRoutes(text.split(/\r?\n/)), [text]);

  const routeBits = useMemo(() => {
    if (!result.summaryRoute) return [];
    return result.coveredRoutes.map((route) => {
      const { ip, prefix } = parseCIDR(route);
      return { route, binary: longToBinaryDotted(ipToLong(ip)), prefix };
    });
  }, [result]);

  const summaryPrefix = result.summaryPrefix ?? 0;
  const summaryBinary = result.summaryNetwork ? longToBinaryDotted(ipToLong(result.summaryNetwork)) : '';

  return (
    <div className="space-y-5">
      <Card title="Sumarización de rutas (superred)" icon={<Route size={16} className="text-cyan" aria-hidden />}>
        <Field label="Redes en formato CIDR (una por línea)" htmlFor="summ-input" hint="Encuentra el prefijo común más largo de todas las redes.">
          <TextArea id="summ-input" rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'192.168.0.0/24\n192.168.1.0/24'} aria-invalid={!!result.error} />
        </Field>
      </Card>

      {result.error && <ErrorBox>{result.error}</ErrorBox>}

      {result.summaryRoute && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <ResultRow label="Superred resumida" value={result.summaryRoute} tone="cyan" />
            </div>
            <ResultRow label="IPs de la superred" value={result.summaryTotalIPs.toLocaleString('es')} copy={false} />
            <ResultRow label="IPs de tus redes" value={result.inputTotalIPs.toLocaleString('es')} copy={false} />
          </div>

          {result.includesExtra ? (
            <WarnBox>
              <strong>Cuidado:</strong> la superred cubre {result.extraIPs.toLocaleString('es')} direcciones que NO están en tu lista. Anunciarla
              podría atraer tráfico de redes que no son tuyas.
            </WarnBox>
          ) : (
            <Badge tone="emerald">Sumarización exacta: no cubre redes de más</Badge>
          )}

          <Card title="Comparación en binario">
            <div className="space-y-3">
              {routeBits.map((r) => (
                <div key={r.route}>
                  <p className="mb-1 font-mono text-xs text-slate-400">{r.route}</p>
                  <BitsRow binary={r.binary} prefix={summaryPrefix} variableUntil={r.prefix} />
                </div>
              ))}
              <div className="border-t border-line pt-3">
                <p className="mb-1 font-mono text-xs text-cyan">{result.summaryRoute} (superred)</p>
                <BitsRow binary={summaryBinary} prefix={summaryPrefix} />
              </div>
              <p className="text-xs text-slate-500">
                <span className="text-cyan">Cian</span> = {summaryPrefix} bits comunes a todas las redes · la línea blanca es el punto exacto donde
                empiezan a diferir · <span className="text-amber-300">ámbar</span> = bits que distinguen cada red · el resto es espacio de host.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
