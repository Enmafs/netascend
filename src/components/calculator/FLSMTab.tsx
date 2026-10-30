import { Download, Split } from 'lucide-react';
import { useMemo, useState } from 'react';
import { downloadCSV } from '../../lib/csv';
import { splitByHosts, splitBySubnetCount, type FLSMResult } from '../../lib/net/flsm';
import { parseCIDR } from '../../lib/net/parse';
import { Badge, Button, Card, ErrorBox, Field, TextInput, WarnBox } from '../ui/primitives';
import { cn } from '../../lib/cn';

type Mode = 'subnets' | 'hosts';
const PAGE_SIZE = 25;

function compute(base: string, mode: Mode, amountText: string): { result?: FLSMResult; error?: string } {
  try {
    const { ip, prefix } = parseCIDR(base);
    if (!/^\d+$/.test(amountText.trim())) throw new Error('Escribe un número entero positivo.');
    const amount = Number(amountText);
    return { result: mode === 'subnets' ? splitBySubnetCount(ip, prefix, amount) : splitByHosts(ip, prefix, amount) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Entrada inválida.' };
  }
}

export function FLSMTab() {
  const [base, setBase] = useState('192.168.1.0/24');
  const [mode, setMode] = useState<Mode>('subnets');
  const [amount, setAmount] = useState('4');
  const [page, setPage] = useState(0);

  const { result, error } = useMemo(() => compute(base, mode, amount), [base, mode, amount]);
  const pages = result ? Math.ceil(result.subnets.length / PAGE_SIZE) : 0;
  const currentPage = Math.min(page, Math.max(pages - 1, 0));
  const visible = result ? result.subnets.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE) : [];

  const exportCSV = () => {
    if (!result) return;
    downloadCSV(
      'subnetting-flsm.csv',
      ['#', 'Red', 'Prefijo', 'Primera útil', 'Última útil', 'Broadcast', 'Total IPs'],
      result.subnets.map((s, i) => [i + 1, s.networkAddress, `/${s.prefix}`, s.firstUsableIP, s.lastUsableIP, s.broadcastAddress, s.totalIPs]),
    );
  };

  return (
    <div className="space-y-5">
      <Card title="Subnetting FLSM (subredes de igual tamaño)" icon={<Split size={16} className="text-cyan" aria-hidden />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Red base (CIDR)" htmlFor="flsm-base">
            <TextInput id="flsm-base" value={base} onChange={(e) => { setBase(e.target.value); setPage(0); }} placeholder="192.168.1.0/24" />
          </Field>
          <Field label={mode === 'subnets' ? 'Cantidad de subredes' : 'Hosts por subred'} htmlFor="flsm-amount">
            <TextInput id="flsm-amount" value={amount} onChange={(e) => { setAmount(e.target.value); setPage(0); }} inputMode="numeric" />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Modo de división">
          {([
            ['subnets', 'Quiero N subredes de igual tamaño'],
            ['hosts', 'Quiero subredes para N hosts cada una'],
          ] as const).map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => { setMode(value); setPage(0); }}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm transition-colors',
                mode === value ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line text-slate-400 hover:text-slate-200',
              )}
            >
              {text}
            </button>
          ))}
        </div>
      </Card>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">Nuevo prefijo: /{result.newPrefix}</Badge>
            <Badge tone="violet">Bits prestados: {result.borrowedBits}</Badge>
            <Badge tone="emerald">{result.generated.toLocaleString('es')} subredes</Badge>
            <Badge>{result.hostsPerSubnet.toLocaleString('es')} hosts útiles c/u</Badge>
          </div>
          {mode === 'subnets' && result.generated !== result.requested && (
            <WarnBox>
              Pediste {result.requested} subredes, pero las subredes son siempre potencias de 2: con {result.borrowedBits} bits prestados
              se generan {result.generated}. Las {result.generated - result.requested} sobrantes quedan libres para crecer.
            </WarnBox>
          )}

          <Card
            title="Subredes resultantes"
            action={
              <Button variant="ghost" onClick={exportCSV}>
                <Download size={15} aria-hidden /> Exportar CSV
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase text-slate-400">
                    <th className="py-2 pr-3">#</th>
                    <th className="pr-3">Red</th>
                    <th className="pr-3">Prefijo</th>
                    <th className="pr-3">Rango útil</th>
                    <th className="pr-3">Broadcast</th>
                    <th>Total IPs</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s, i) => (
                    <tr key={s.networkAddress} className="border-b border-line/50 hover:bg-white/5">
                      <td className="py-2 pr-3 text-slate-500">{currentPage * PAGE_SIZE + i + 1}</td>
                      <td className="pr-3 text-cyan">{s.networkAddress}</td>
                      <td className="pr-3">/{s.prefix}</td>
                      <td className="pr-3 text-emerald">
                        {s.firstUsableIP} – {s.lastUsableIP}
                      </td>
                      <td className="pr-3 text-violet">{s.broadcastAddress}</td>
                      <td>{s.totalIPs.toLocaleString('es')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <Button variant="ghost" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                  Anterior
                </Button>
                <span>
                  Página {currentPage + 1} de {pages}
                </span>
                <Button variant="ghost" disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
