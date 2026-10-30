import { useState } from 'react';
import { Box, ArrowRight } from 'lucide-react';
import { Card, TextInput } from '../../../components/ui/primitives';
import { BoxVisualizer } from '../../../components/visualizer/BoxVisualizer';
import { calculateSubnet } from '../../../lib/net/ipv4';

interface BoxPracticeWidgetProps {
  defaultIp?: string;
  defaultPrefix?: number;
  presets?: { label: string; ip: string; prefix: number }[];
  title?: string;
}

export function BoxPracticeWidget({
  defaultIp = '192.168.1.140',
  defaultPrefix = 27,
  presets = [
    { label: '192.168.1.140 /27', ip: '192.168.1.140', prefix: 27 },
    { label: '10.0.0.14 /30', ip: '10.0.0.14', prefix: 30 },
    { label: '172.16.5.70 /26', ip: '172.16.5.70', prefix: 26 },
    { label: '192.168.0.200 /28', ip: '192.168.0.200', prefix: 28 },
  ],
  title = 'Laboratorio Interactivo: El Método de las Cajas',
}: BoxPracticeWidgetProps) {
  const [ip, setIp] = useState(defaultIp);
  const [prefix, setPrefix] = useState(defaultPrefix);

  let subnet = null;
  let error = '';

  try {
    subnet = calculateSubnet(ip.trim(), prefix);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al calcular subred';
  }

  return (
    <Card title={title} icon={<Box className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Prueba diferentes direcciones y prefijos para ver en tiempo real cómo la IP se ubica dentro de su "caja" y
        cómo el salto determina las fronteras de red y broadcast.
      </p>

      {/* Selector de Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {presets.map((p) => (
          <button
            key={`${p.ip}/${p.prefix}`}
            type="button"
            onClick={() => {
              setIp(p.ip);
              setPrefix(p.prefix);
            }}
            className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
              ip === p.ip && prefix === p.prefix
                ? 'border-cyan bg-cyan/20 text-cyan font-bold'
                : 'border-line bg-base/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-2 max-w-md mb-5">
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Dirección IP:</label>
          <TextInput value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Ej. 192.168.1.140" />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-400 font-medium block mb-1">Prefijo (/{prefix}):</label>
          <input
            type="range"
            min="1"
            max="32"
            value={prefix}
            onChange={(e) => setPrefix(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-line rounded-lg appearance-none cursor-pointer accent-cyan"
            aria-label="Prefijo CIDR"
          />
        </div>
      </div>

      {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

      {subnet && !error && (
        <div className="space-y-5">
          {/* Visualizador de Cajas */}
          <div className="rounded-xl border border-line bg-surface/90 p-4">
            <BoxVisualizer
              ip={subnet.ip}
              prefix={subnet.prefix}
              network={subnet.networkAddress}
              salto={subnet.salto}
              workingOctet={subnet.workingOctet}
            />
          </div>

          {/* Pasos explicados */}
          <div className="rounded-xl border border-line bg-base/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
              Resolución con el Método de los 5 Pasos:
            </span>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <p className="flex items-center gap-2">
                <span className="text-cyan font-bold">1. Octeto de trabajo:</span> Octeto {subnet.workingOctet} (máscara: {subnet.maskDecimal})
              </p>
              <p className="flex items-center gap-2">
                <span className="text-cyan font-bold">2. Salto mágico:</span> 256 − {subnet.maskDecimal.split('.')[subnet.workingOctet - 1]} = {subnet.salto}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-cyan font-bold">3. Dirección de Red:</span> La caja empieza en {subnet.networkAddress}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-cyan font-bold">4. Siguiente Red:</span> {subnet.nextNetworkAddress} (red + salto {subnet.salto})
              </p>
              <p className="flex items-center gap-2">
                <span className="text-cyan font-bold">5. Broadcast y Rango:</span> {subnet.broadcastAddress} (siguiente − 1). Útiles: {subnet.firstUsableIP} <ArrowRight size={12} className="inline text-slate-500" /> {subnet.lastUsableIP}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
