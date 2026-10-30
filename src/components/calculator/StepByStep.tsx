import type { ReactNode } from 'react';
import type { IPv4SubnetResult } from '../../lib/net/types';
import { BoxVisualizer } from '../visualizer/BoxVisualizer';

const ORDINALS = ['1er', '2do', '3er', '4to'];
const PREFIX_RANGES = ['/1 a /8', '/9 a /16', '/17 a /24', '/25 a /32'];

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan/15 font-mono text-sm font-bold text-cyan ring-1 ring-cyan/40">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-1.5 pb-1">
        <h3 className="font-semibold text-slate-100">{title}</h3>
        <div className="space-y-1.5 text-sm text-slate-300">{children}</div>
      </div>
    </li>
  );
}

const M = ({ children }: { children: ReactNode }) => <code className="rounded bg-base px-1.5 py-0.5 font-mono text-cyan">{children}</code>;

/** Explica el cálculo con el Método de los 5 Pasos aplicado a un resultado concreto. */
export function StepByStep({ result }: { result: IPv4SubnetResult }) {
  const { prefix, workingOctet: n, salto } = result;
  const idx = n - 1;
  const ipOctets = result.ip.split('.').map(Number);
  const netOctets = result.networkAddress.split('.').map(Number);
  const ipOctet = ipOctets[idx];
  const netOctet = netOctets[idx];
  const maskOctet = 256 - salto;
  const nextOctet = netOctet + salto;
  const hostBits = 32 - prefix;
  const rightCount = 4 - n;
  const fixed = netOctets.slice(0, idx).join('.');
  const withFill = (value: number | string, fill: number) =>
    [...(fixed ? [fixed] : []), String(value), ...Array<number>(rightCount).fill(fill)].join('.');

  // Múltiplos del salto alrededor de la IP.
  const multiples: string[] = [];
  if (salto < 256) {
    for (let k = -2; k <= 2; k++) {
      const v = netOctet + k * salto;
      if (v >= 0 && v <= 256) multiples.push(v === netOctet ? `[${v}]` : String(v));
    }
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-4">
        <Step n={1} title="Octeto de trabajo">
          <p>
            El prefijo <M>/{prefix}</M> cae en el rango {PREFIX_RANGES[idx]}, así que trabajamos en el{' '}
            <strong>{ORDINALS[idx]} octeto</strong>. Su valor en la máscara es <M>{maskOctet === 256 ? 0 : maskOctet}</M>.
          </p>
          {prefix === 0 && <p className="text-slate-400">Con /0 no hay bits de red: toda internet es una sola "caja".</p>}
        </Step>

        <Step n={2} title="Salto (tamaño de la caja)">
          <p>
            <M>256 − {maskOctet === 256 ? 0 : maskOctet} = {salto}</M>
          </p>
          <p className="text-slate-400">
            Las redes avanzan de {salto} en {salto} dentro del {ORDINALS[idx]} octeto.
            {prefix % 8 === 0 && prefix > 0 && ' (Como la máscara llena el octeto con 255, cada red ocupa un único valor.)'}
          </p>
        </Step>

        <Step n={3} title="Buscar la caja donde vive la IP">
          {salto < 256 ? (
            <>
              <p>
                Múltiplos de {salto}: <M>{multiples.join(', ')}</M>
              </p>
              <p>
                El valor <M>{ipOctet}</M> cae en la caja que empieza en <M>{netOctet}</M>.
              </p>
            </>
          ) : (
            <p>
              Con salto 256 solo existe una caja: empieza en <M>0</M>.
            </p>
          )}
          <p>
            Dirección de red: se copia lo que está a la izquierda, se pone <M>{netOctet}</M>
            {rightCount > 0 && (
              <>
                {' '}
                y los {rightCount} octeto(s) siguientes se llenan con <M>0</M>
              </>
            )}{' '}
            → <M>{result.networkAddress}</M>
          </p>
        </Step>

        <Step n={4} title="Siguiente red y broadcast">
          <p>
            Siguiente red = <M>{netOctet} + {salto} = {nextOctet}</M>
            {result.nextNetworkAddress ? (
              <>
                {' '}
                → <M>{withFill(nextOctet, 0)}</M>
              </>
            ) : (
              <> → no existe (es la última red posible)</>
            )}
          </p>
          <p>
            Broadcast = una antes de la siguiente: <M>{nextOctet} − 1 = {nextOctet - 1}</M>
            {rightCount > 0 && (
              <>
                {' '}
                y los octetos a la derecha se llenan con <M>255</M>
              </>
            )}{' '}
            → <M>{result.broadcastAddress}</M>
          </p>
          <p>
            Rango útil: <M>{result.firstUsableIP}</M> → <M>{result.lastUsableIP}</M>
          </p>
          {prefix === 31 && (
            <p className="text-slate-400">En /31 (RFC 3021, enlaces punto a punto) las 2 IPs son utilizables.</p>
          )}
          {prefix === 32 && <p className="text-slate-400">/32 es un único host: red, broadcast e IP útil coinciden.</p>}
        </Step>

        <Step n={5} title="Visualiza las cajas">
          <BoxVisualizer
            ip={result.ip}
            prefix={prefix}
            network={result.networkAddress}
            salto={salto}
            workingOctet={n}
          />
        </Step>
      </ol>

      <div className="rounded-lg border border-line bg-base/60 p-3 text-sm text-slate-300">
        <p className="mb-1 font-semibold text-slate-100">Cantidad de direcciones</p>
        <p>
          Bits de host: <M>32 − {prefix} = {hostBits}</M> → Total: <M>2^{hostBits} = {result.totalIPs.toLocaleString('es')}</M>
        </p>
        <p>
          Hosts útiles:{' '}
          <M>
            {prefix >= 31
              ? `${result.usableHosts}`
              : `${result.totalIPs.toLocaleString('es')} − 2 = ${result.usableHosts.toLocaleString('es')}`}
          </M>
        </p>
      </div>
    </div>
  );
}
