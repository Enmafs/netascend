import { useState } from 'react';
import { Search, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { Card, TextInput, Badge } from '../../../components/ui/primitives';
import { classifyIpv4 } from '../../../lib/net/ipv4';

const PRESETS = [
  { label: 'Privada (192.168)', ip: '192.168.1.1' },
  { label: 'Privada (10.x)', ip: '10.50.14.3' },
  { label: 'Privada (172.16-31)', ip: '172.24.8.1' },
  { label: 'CGNAT (ISP)', ip: '100.64.45.10' },
  { label: 'Loopback', ip: '127.0.0.1' },
  { label: 'APIPA (Sin DHCP)', ip: '169.254.120.5' },
  { label: 'Pública (DNS)', ip: '8.8.8.8' },
  { label: 'Multicast', ip: '224.0.0.5' },
];

export function SpecialRangesWidget() {
  const [ip, setIp] = useState('172.20.105.77');

  let result = null;
  let error = '';

  try {
    const parts = ip.trim().split('.');
    if (parts.length === 4 && parts.every((p) => p !== '' && Number(p) >= 0 && Number(p) <= 255)) {
      result = classifyIpv4(ip.trim());
    } else {
      error = 'Ingresa una IPv4 válida (4 octetos de 0 a 255).';
    }
  } catch {
    error = 'Formato de IP inválido.';
  }

  return (
    <Card title="Laboratorio Interactivo: Clasificador de Rangos Especiales" icon={<Search className="text-cyan" size={18} />}>
      <p className="text-xs text-slate-400 mb-4">
        Prueba cualquier dirección IP o selecciona un preset para verificar su clasificación, RFC aplicable,
        enrutabilidad pública y clase histórica.
      </p>

      {/* Selector de Presets */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.ip}
            type="button"
            onClick={() => setIp(p.ip)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
              ip === p.ip
                ? 'border-cyan bg-cyan/20 text-cyan font-bold'
                : 'border-line bg-base/60 text-slate-400 hover:border-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="max-w-md">
        <TextInput
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Ej. 172.20.105.77"
          aria-label="Dirección IP a clasificar"
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      {/* Resultados */}
      {result && !error && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-line bg-base/60 p-3">
            <span className="text-xs uppercase text-slate-400">Ámbito / Tipo:</span>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={result.scope === 'Privada (RFC 1918)' ? 'emerald' : result.scope.includes('CGNAT') ? 'amber' : 'cyan'}>
                {result.scope}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-slate-400">{result.rfc}</p>
          </div>

          <div className="rounded-lg border border-line bg-base/60 p-3">
            <span className="text-xs uppercase text-slate-400">Enrutabilidad en Internet:</span>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold">
              {result.isRoutablePublicly ? (
                <>
                  <Globe size={16} className="text-cyan" />
                  <span className="text-cyan">Pública Global</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} className="text-emerald" />
                  <span className="text-emerald">No enrutable (Filtrada)</span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {result.isRoutablePublicly ? 'Requiere ASN/BGP' : 'Requiere traducción NAT'}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-base/60 p-3">
            <span className="text-xs uppercase text-slate-400">Clase Histórica (pre-CIDR):</span>
            <p className="mt-1 font-mono text-base font-bold text-violet">Clase {result.classful}</p>
            <p className="mt-2 text-xs text-slate-500">
              {result.classful === 'A'
                ? '0-127 (Máscara fija /8)'
                : result.classful === 'B'
                ? '128-191 (Máscara fija /16)'
                : result.classful === 'C'
                ? '192-223 (Máscara fija /24)'
                : result.classful === 'D'
                ? '224-239 (Multicast)'
                : '240-255 (Experimental)'}
            </p>
          </div>

          <div className="rounded-lg border border-line bg-base/60 p-3">
            <span className="text-xs uppercase text-slate-400">Uso Típico:</span>
            <p className="mt-1 text-xs text-slate-200 flex items-start gap-1">
              <HelpCircle size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <span>
                {result.scope === 'Privada (RFC 1918)'
                  ? 'Redes de área local (LAN), WiFi de hogares y oficinas.'
                  : result.scope.includes('CGNAT')
                  ? 'Red de distribución del operador hacia el módem de clientes.'
                  : result.scope.includes('Loopback')
                  ? 'Pila TCP/IP interna del equipo (localhost).'
                  : result.scope.includes('Link-Local')
                  ? 'Autoconfiguración automática de Windows/Linux si no hay DHCP.'
                  : result.scope.includes('Multicast')
                  ? 'Streaming de video en red, OSPF, EIGRP o mDNS.'
                  : 'Servidores web, balanceadores y firewalls perimetrales.'}
              </span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
