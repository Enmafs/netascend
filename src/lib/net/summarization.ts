import { ipToLong, longToIp, prefixToMask } from './ipv4';
import { parseCIDR } from './parse';

export interface SummarizationResult {
  /** Superred mínima (ej. `192.168.0.0/22`) o `null` si hubo error. */
  summaryRoute: string | null;
  error?: string;
  /** Redes de entrada normalizadas (dirección de red real, sin duplicados). */
  coveredRoutes: string[];
  summaryNetwork?: string;
  summaryPrefix?: number;
  /** Total de IPs de la superred. */
  summaryTotalIPs: number;
  /** Total de IPs realmente cubiertas por las redes de entrada (sin contar solapes). */
  inputTotalIPs: number;
  /** `true` si la superred abarca direcciones que no estaban en la lista original. */
  includesExtra: boolean;
  /** Cantidad de IPs extra que cubre la superred. */
  extraIPs: number;
}

function failure(error: string): SummarizationResult {
  return {
    summaryRoute: null,
    error,
    coveredRoutes: [],
    summaryTotalIPs: 0,
    inputTotalIPs: 0,
    includesExtra: false,
    extraIPs: 0,
  };
}

interface Interval {
  start: number;
  end: number;
  prefix: number;
}

/**
 * Calcula la superred mínima que contiene todas las redes dadas (prefijo común más largo).
 * Entrada: redes en formato CIDR. Las IPs de host se normalizan a su dirección de red.
 */
export function summarizeRoutes(routes: string[]): SummarizationResult {
  const cleaned = routes.map((r) => r.trim()).filter((r) => r.length > 0);
  if (cleaned.length === 0) {
    return failure('Ingresa al menos una red en formato CIDR (por ejemplo 192.168.0.0/24).');
  }

  const intervals: Interval[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    try {
      const { ip, prefix } = parseCIDR(cleaned[i]);
      const mask = prefixToMask(prefix);
      const start = (ipToLong(ip) & mask) >>> 0;
      const end = (start | ((~mask) >>> 0)) >>> 0;
      intervals.push({ start, end, prefix });
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'entrada inválida';
      return failure(`Línea ${i + 1}: ${reason}`);
    }
  }

  const minStart = Math.min(...intervals.map((r) => r.start));
  const maxEnd = Math.max(...intervals.map((r) => r.end));
  const minPrefix = Math.min(...intervals.map((r) => r.prefix));

  // Bits comunes entre el primer y el último extremo del rango cubierto.
  const diff = (minStart ^ maxEnd) >>> 0;
  const common = diff === 0 ? 32 : Math.clz32(diff);
  const summaryPrefix = Math.min(common, minPrefix);
  const summaryStart = (minStart & prefixToMask(summaryPrefix)) >>> 0;
  const summaryTotalIPs = Math.pow(2, 32 - summaryPrefix);

  // Unión de intervalos para contar IPs reales (maneja duplicados y solapes).
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  let inputTotalIPs = 0;
  let curStart = sorted[0].start;
  let curEnd = sorted[0].end;
  for (let i = 1; i < sorted.length; i++) {
    const it = sorted[i];
    if (it.start <= curEnd + 1) {
      curEnd = Math.max(curEnd, it.end);
    } else {
      inputTotalIPs += curEnd - curStart + 1;
      curStart = it.start;
      curEnd = it.end;
    }
  }
  inputTotalIPs += curEnd - curStart + 1;

  const coveredRoutes = Array.from(
    new Set(sorted.map((r) => `${longToIp(r.start)}/${r.prefix}`)),
  );
  const extraIPs = summaryTotalIPs - inputTotalIPs;

  return {
    summaryRoute: `${longToIp(summaryStart)}/${summaryPrefix}`,
    coveredRoutes,
    summaryNetwork: longToIp(summaryStart),
    summaryPrefix,
    summaryTotalIPs,
    inputTotalIPs,
    includesExtra: extraIPs > 0,
    extraIPs,
  };
}
