import { calculateSubnet } from '../../lib/net/ipv4';
import { cn } from '../../lib/cn';

interface BoxVisualizerProps {
  ip: string;
  prefix: number;
  network: string;
  salto: number;
  workingOctet: number;
}

interface BoxInfo {
  start: number;
  end: number;
  kind: 'prev' | 'current' | 'next' | 'other';
}

const ORDINALS = ['1er', '2do', '3er', '4to'];

/**
 * Visualiza la metáfora de "las cajas": el octeto de trabajo (0–255) dividido en bloques del tamaño
 * del salto, con la caja donde vive la IP resaltada y un pin con su posición exacta.
 */
export function BoxVisualizer({ ip, prefix, network, salto, workingOctet }: BoxVisualizerProps) {
  const idx = workingOctet - 1;
  const ipOctet = Number(ip.split('.')[idx]);
  const netOctet = Number(network.split('.')[idx]);
  const detail = calculateSubnet(network, prefix);

  // Salto >= 16 → caben ≤ 16 cajas y se muestran todas; si no, solo anterior / actual / siguiente.
  const showAll = salto >= 16;
  const boxes: BoxInfo[] = [];
  if (showAll) {
    for (let s = 0; s < 256; s += salto) {
      boxes.push({ start: s, end: Math.min(s + salto - 1, 255), kind: s === netOctet ? 'current' : 'other' });
    }
  } else {
    if (netOctet - salto >= 0) boxes.push({ start: netOctet - salto, end: netOctet - 1, kind: 'prev' });
    boxes.push({ start: netOctet, end: netOctet + salto - 1, kind: 'current' });
    if (netOctet + salto <= 255) boxes.push({ start: netOctet + salto, end: netOctet + 2 * salto - 1, kind: 'next' });
  }

  const compactBoxes = boxes.length > 8;
  const pinPct = ((ipOctet - netOctet + 0.5) / salto) * 100;
  const summary = `Octeto ${ORDINALS[idx]}: la IP cae en la caja que va de ${netOctet} a ${netOctet + salto - 1}.`;

  return (
    <div className="space-y-4" role="img" aria-label={summary}>
      <p className="text-xs text-slate-400">
        Trabajamos en el <strong className="text-cyan">{ORDINALS[idx]} octeto</strong> (0–255), partido en cajas de{' '}
        <strong className="text-cyan">{salto}</strong>.
        {!showAll && ' Como el salto es pequeño, se muestran la caja anterior, la actual y la siguiente.'}
      </p>

      <div className="flex gap-1.5 pt-9">
        {boxes.map((box) => {
          const isCurrent = box.kind === 'current';
          const number = Math.floor(box.start / salto) + 1;
          return (
            <div
              key={box.start}
              className={cn(
                'relative flex h-20 min-w-0 flex-1 flex-col items-center justify-center rounded-lg border text-center',
                isCurrent
                  ? 'z-10 border-cyan bg-[#1e293b] shadow-[0_0_22px_rgba(6,182,212,0.55)]'
                  : 'border-line bg-base/60 text-slate-500',
              )}
            >
              {isCurrent && (
                <div
                  className="absolute -top-9 flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${Math.min(Math.max(pinPct, 6), 94)}%` }}
                >
                  <span className="rounded bg-cyan px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-950">
                    IP .{ipOctet}
                  </span>
                  <span className="h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-cyan" />
                </div>
              )}
              <span className={cn('text-[10px] uppercase tracking-wide', isCurrent ? 'text-cyan' : 'text-slate-500')}>
                Caja {number}
              </span>
              <span className={cn('font-mono', compactBoxes ? 'text-[10px]' : 'text-xs', isCurrent ? 'font-bold text-white' : '')}>
                {compactBoxes ? box.start : `${box.start}–${box.end}`}
              </span>
              {isCurrent && (
                <span
                  className="absolute bottom-2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan"
                  style={{ left: `${pinPct}%` }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-2.5">
          <dt className="text-xs uppercase text-slate-400">Inicio de la caja (Red)</dt>
          <dd className="font-mono text-cyan">{detail.networkAddress}</dd>
        </div>
        <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-2.5">
          <dt className="text-xs uppercase text-slate-400">Rango útil</dt>
          <dd className="break-all font-mono text-emerald">
            {detail.firstUsableIP} → {detail.lastUsableIP}
          </dd>
        </div>
        <div className="rounded-lg border border-violet/30 bg-violet/5 p-2.5">
          <dt className="text-xs uppercase text-slate-400">Techo de la caja (Broadcast)</dt>
          <dd className="font-mono text-violet">{detail.broadcastAddress}</dd>
        </div>
      </dl>
    </div>
  );
}
