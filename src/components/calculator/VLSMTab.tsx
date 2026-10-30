import { Download, Layers, Plus, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { downloadCSV } from '../../lib/csv';
import { parseCIDR } from '../../lib/net/parse';
import type { VLSMResult } from '../../lib/net/types';
import { calculateVLSM } from '../../lib/net/vlsm';
import { cn } from '../../lib/cn';
import { Badge, Button, Card, ErrorBox, Field, TextInput } from '../ui/primitives';

interface Row {
  id: number;
  name: string;
  hosts: string;
}

const SEGMENT_COLORS = ['bg-cyan', 'bg-violet', 'bg-emerald', 'bg-sky-400', 'bg-fuchsia-400', 'bg-teal-400'];

function compute(base: string, rows: Row[], allow31: boolean): { result?: VLSMResult; error?: string } {
  try {
    const { ip, prefix } = parseCIDR(base);
    const reqs = rows.map((r, i) => {
      if (!/^\d+$/.test(r.hosts.trim()) || Number(r.hosts) < 1) {
        throw new Error(`La fila ${i + 1} necesita una cantidad de hosts entera mayor o igual a 1.`);
      }
      return { name: r.name.trim() || `Subred ${i + 1}`, hosts: Number(r.hosts) };
    });
    return { result: calculateVLSM(ip, prefix, reqs, { allowPointToPoint31: allow31 }) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Entrada inválida.' };
  }
}

export function VLSMTab() {
  const nextId = useRef(6);
  const [base, setBase] = useState('192.168.1.0/24');
  const [allow31, setAllow31] = useState(false);
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: 'Ventas', hosts: '100' },
    { id: 2, name: 'TI', hosts: '50' },
    { id: 3, name: 'Gerencia', hosts: '20' },
    { id: 4, name: 'WAN-1', hosts: '2' },
    { id: 5, name: 'WAN-2', hosts: '2' },
  ]);

  const { result, error } = useMemo(() => compute(base, rows, allow31), [base, rows, allow31]);

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { id: nextId.current++, name: '', hosts: '10' }]);
  const removeRow = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));

  const exportCSV = () => {
    if (!result) return;
    downloadCSV(
      'vlsm.csv',
      ['Nombre', 'Hosts pedidos', 'Hosts disponibles', 'Prefijo', 'Máscara', 'Red', 'Primera útil', 'Última útil', 'Broadcast', 'Desperdicio'],
      result.subnets.map((s) => [s.name, s.hostsRequested, s.hostsAvailable, `/${s.prefix}`, s.maskDecimal, s.networkAddress, s.firstUsableIP, s.lastUsableIP, s.broadcastAddress, s.wastedHosts]),
    );
  };

  const usedPct = result ? (result.summary.allocatedIPs / result.summary.baseTotalIPs) * 100 : 0;

  return (
    <div className="space-y-5">
      <Card title="VLSM: máscaras de longitud variable" icon={<Layers size={16} className="text-cyan" aria-hidden />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Red base (CIDR)" htmlFor="vlsm-base">
            <TextInput id="vlsm-base" value={base} onChange={(e) => setBase(e.target.value)} placeholder="10.0.0.0/16" />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-line px-3 py-2 text-sm text-slate-300">
            <input type="checkbox" checked={allow31} onChange={(e) => setAllow31(e.target.checked)} className="h-4 w-4 accent-cyan" />
            Permitir /31 en enlaces punto a punto (RFC 3021)
          </label>
        </div>

        <div className="mt-5 space-y-2">
          <div className="hidden grid-cols-[1fr_8rem_2.5rem] gap-2 text-xs uppercase text-slate-400 sm:grid">
            <span>Departamento / enlace</span>
            <span>Hosts</span>
            <span />
          </div>
          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-[1fr_6rem_2.5rem] items-center gap-2 sm:grid-cols-[1fr_8rem_2.5rem]">
              <TextInput value={row.name} onChange={(e) => update(row.id, { name: e.target.value })} placeholder={`Subred ${i + 1}`} aria-label={`Nombre de la fila ${i + 1}`} className="font-sans" />
              <TextInput value={row.hosts} onChange={(e) => update(row.id, { hosts: e.target.value })} inputMode="numeric" aria-label={`Hosts de la fila ${i + 1}`} aria-invalid={!/^\d+$/.test(row.hosts.trim()) || Number(row.hosts) < 1} />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                aria-label={`Eliminar fila ${i + 1}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-slate-400 transition-colors hover:border-red-500/60 hover:text-red-400 disabled:opacity-30"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          ))}
          <Button variant="ghost" onClick={addRow}>
            <Plus size={15} aria-hidden /> Agregar subred
          </Button>
        </div>
      </Card>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <>
          <Card
            title="Uso de la red base"
            action={
              <div className="flex items-center gap-2">
                <Badge tone="cyan">{usedPct.toFixed(1)} % usado</Badge>
                <Badge tone="emerald">{result.summary.freeIPs.toLocaleString('es')} IPs libres</Badge>
              </div>
            }
          >
            <div className="flex h-5 w-full overflow-hidden rounded-full border border-line bg-base" role="img" aria-label={`${usedPct.toFixed(1)} por ciento de ${result.summary.baseNetwork} asignado`}>
              {result.subnets.map((s, i) => (
                <div
                  key={`${s.networkAddress}-${i}`}
                  className={cn('h-full border-r border-base/70', SEGMENT_COLORS[i % SEGMENT_COLORS.length])}
                  style={{ width: `${(s.totalIPs / result.summary.baseTotalIPs) * 100}%` }}
                  title={`${s.name}: ${s.networkAddress}/${s.prefix}`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Red base {result.summary.baseNetwork} ({result.summary.baseTotalIPs.toLocaleString('es')} IPs) · asignadas {result.summary.allocatedIPs.toLocaleString('es')} · desperdicio de hosts: {result.summary.wastedHosts.toLocaleString('es')}
              {result.summary.nextFreeAddress && <> · siguiente libre: <span className="font-mono text-cyan">{result.summary.nextFreeAddress}</span></>}
            </p>
          </Card>

          <Card
            title="Resultado (ordenado de mayor a menor)"
            action={
              <Button variant="ghost" onClick={exportCSV}>
                <Download size={15} aria-hidden /> Exportar CSV
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase text-slate-400">
                    {['Nombre', 'Pedidos', 'Disponibles', 'Prefijo', 'Máscara', 'Red', 'Rango útil', 'Broadcast', 'Desperdicio'].map((h) => (
                      <th key={h} className="py-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.subnets.map((s, i) => (
                    <tr key={`${s.networkAddress}-${i}`} className="border-b border-line/50 hover:bg-white/5">
                      <td className="py-2 pr-3 font-sans font-medium text-slate-100">
                        <span className={cn('mr-2 inline-block h-2 w-2 rounded-full', SEGMENT_COLORS[i % SEGMENT_COLORS.length])} aria-hidden />
                        {s.name}
                      </td>
                      <td className="pr-3">{s.hostsRequested.toLocaleString('es')}</td>
                      <td className="pr-3">{s.hostsAvailable.toLocaleString('es')}</td>
                      <td className="pr-3">/{s.prefix}</td>
                      <td className="pr-3">{s.maskDecimal}</td>
                      <td className="pr-3 text-cyan">{s.networkAddress}</td>
                      <td className="pr-3 text-emerald">{s.firstUsableIP} – {s.lastUsableIP}</td>
                      <td className="pr-3 text-violet">{s.broadcastAddress}</td>
                      <td className={s.wastedHosts > 0 ? 'text-amber-300' : 'text-slate-500'}>{s.wastedHosts.toLocaleString('es')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
