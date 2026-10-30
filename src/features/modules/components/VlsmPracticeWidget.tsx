import { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { Card, TextInput, Button } from '../../../components/ui/primitives';
import { calculateVLSM } from '../../../lib/net/vlsm';
import type { VLSMRequirement } from '../../../lib/net/types';

export function VlsmPracticeWidget() {
  const [baseIp, setBaseIp] = useState('192.168.10.0');
  const [basePrefix, setBasePrefix] = useState(24);
  const [allow31, setAllow31] = useState(false);
  const [requirements, setRequirements] = useState<VLSMRequirement[]>([
    { name: 'Ventas', hosts: 100 },
    { name: 'TI & Servidores', hosts: 50 },
    { name: 'Gerencia', hosts: 20 },
    { name: 'Enlace WAN 1', hosts: 2 },
    { name: 'Enlace WAN 2', hosts: 2 },
  ]);

  const [newName, setNewName] = useState('');
  const [newHosts, setNewHosts] = useState('');

  const addReq = () => {
    if (!newName.trim() || !newHosts || Number(newHosts) < 1) return;
    setRequirements([...requirements, { name: newName.trim(), hosts: Number(newHosts) }]);
    setNewName('');
    setNewHosts('');
  };

  const removeReq = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  let vlsmResult = null;
  let error = '';

  try {
    vlsmResult = calculateVLSM(baseIp.trim(), basePrefix, requirements, { allowPointToPoint31: allow31 });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error en cálculo VLSM';
  }

  const allocPercent = vlsmResult
    ? Math.round((vlsmResult.summary.allocatedIPs / vlsmResult.summary.baseTotalIPs) * 100)
    : 0;

  return (
    <Card title="Laboratorio Interactivo: Diseñador VLSM sin Desperdicio" icon={<Layers className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Prueba cómo el algoritmo ordena automáticamente de mayor a menor y asigna las subredes en bloques alineados
        sin colisiones ni solapamientos.
      </p>

      {/* Red Base */}
      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mb-4">
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Red Base:</label>
          <TextInput value={baseIp} onChange={(e) => setBaseIp(e.target.value)} placeholder="192.168.10.0" />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Prefijo Base (/{basePrefix}):</label>
          <input
            type="range"
            min="16"
            max="30"
            value={basePrefix}
            onChange={(e) => setBasePrefix(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-cyan"
            aria-label="Prefijo Base"
          />
        </div>
        <div className="flex items-center pt-5">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={allow31}
              onChange={(e) => setAllow31(e.target.checked)}
              className="rounded accent-cyan"
            />
            Permitir /31 en enlaces (RFC 3021)
          </label>
        </div>
      </div>

      {/* Agregar Requerimiento */}
      <div className="flex flex-wrap items-end gap-2 mb-4 p-3 rounded-xl border border-line bg-base/60">
        <div className="flex-1 min-w-[140px]">
          <label className="text-[10px] uppercase text-slate-400 block mb-1">Departamento / Enlace:</label>
          <TextInput
            placeholder="Ej. Almacén"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="w-28">
          <label className="text-[10px] uppercase text-slate-400 block mb-1">Hosts Pedidos:</label>
          <TextInput
            type="number"
            min="1"
            placeholder="Ej. 30"
            value={newHosts}
            onChange={(e) => setNewHosts(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <Button onClick={addReq} variant="primary" className="h-8 text-xs px-3">
          <Plus size={14} className="mr-1" />
          Añadir
        </Button>
      </div>

      {/* Barra de Requerimientos Actuales */}
      <div className="flex flex-wrap gap-2 mb-4">
        {requirements.map((req, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-slate-200"
          >
            <strong>{req.name}:</strong> {req.hosts} hosts
            <button
              type="button"
              onClick={() => removeReq(idx)}
              className="text-slate-400 hover:text-red-400 ml-1"
              aria-label={`Eliminar ${req.name}`}
            >
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>

      {error && <p className="mb-4 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/30">{error}</p>}

      {vlsmResult && !error && (
        <div className="space-y-4">
          {/* Barra de Progreso de Espacio */}
          <div className="rounded-xl border border-line bg-base/60 p-3">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Espacio Ocupado: <strong>{vlsmResult.summary.allocatedIPs} IPs ({allocPercent}%)</strong></span>
              <span>Libre: <strong>{vlsmResult.summary.freeIPs} IPs</strong></span>
            </div>
            <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-line flex">
              <div
                className="bg-cyan h-full transition-all"
                style={{ width: `${Math.min(allocPercent, 100)}%` }}
              />
              <div
                className="bg-emerald/30 h-full transition-all"
                style={{ width: `${Math.max(0, 100 - allocPercent)}%` }}
              />
            </div>
          </div>

          {/* Tabla de Asignación */}
          <div className="overflow-x-auto rounded-xl border border-line bg-surface/90">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-base/80 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Depto</th>
                  <th className="py-2.5 px-3">Pedidos</th>
                  <th className="py-2.5 px-3">Prefijo</th>
                  <th className="py-2.5 px-3">Red Asignada</th>
                  <th className="py-2.5 px-3">Rango Útil</th>
                  <th className="py-2.5 px-3">Broadcast</th>
                  <th className="py-2.5 px-3">Desperdicio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 font-mono text-slate-300">
                {vlsmResult.subnets.map((sub) => (
                  <tr key={sub.networkAddress} className="hover:bg-cyan/5">
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">{sub.name}</td>
                    <td className="py-2 px-3 text-slate-400">{sub.hostsRequested}</td>
                    <td className="py-2 px-3 font-bold text-cyan">/{sub.prefix}</td>
                    <td className="py-2 px-3 text-cyan">{sub.networkAddress}</td>
                    <td className="py-2 px-3 text-emerald">{sub.firstUsableIP} – {sub.lastUsableIP}</td>
                    <td className="py-2 px-3 text-violet">{sub.broadcastAddress}</td>
                    <td className="py-2 px-3 text-amber-300">{sub.wastedHosts} IPs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
