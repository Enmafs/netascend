import { ipToLong, longToIp, prefixToMask } from './ipv4';
import type {
  VLSMOptions,
  VLSMRequirement,
  VLSMResult,
  VLSMSubnetResult,
} from './types';

const MAX_LONG = 0xffffffff;

/**
 * Prefijo mínimo que cubre `hosts` equipos: 32 - ceil(log2(hosts + 2)).
 * Con `allowPointToPoint31` y exactamente 2 hosts se usa /31 (RFC 3021).
 * Con 1 host se usa /32 solo si `allowPointToPoint31` está activo; si no, /30 (mínimo clásico).
 */
export function prefixForHosts(hosts: number, allowPointToPoint31 = false): number {
  if (!Number.isInteger(hosts) || hosts < 1) {
    throw new Error(`Cantidad de hosts inválida: ${hosts}`);
  }
  if (allowPointToPoint31 && hosts === 2) return 31;
  if (allowPointToPoint31 && hosts === 1) return 32;
  // Math.ceil(Math.log2()) puede fallar por precisión; se calcula con enteros.
  let hostBits = 2;
  while (Math.pow(2, hostBits) - 2 < hosts) hostBits++;
  return 32 - hostBits;
}

function parseBaseNetwork(baseIpStr: string, basePrefix: number) {
  if (!Number.isInteger(basePrefix) || basePrefix < 0 || basePrefix > 32) {
    throw new Error(`Prefijo base inválido: ${basePrefix}`);
  }
  const mask = prefixToMask(basePrefix);
  const network = (ipToLong(baseIpStr) & mask) >>> 0;
  const total = Math.pow(2, 32 - basePrefix);
  return { network, total };
}

/**
 * Reparte una red base en subredes de tamaño variable (VLSM).
 * Ordena de mayor a menor, asigna bloques contiguos alineados y lanza error si no caben.
 */
export function calculateVLSM(
  baseIpStr: string,
  basePrefix: number,
  requirements: VLSMRequirement[],
  options: VLSMOptions = {},
): VLSMResult {
  const { allowPointToPoint31 = false } = options;
  const { network: baseNetwork, total: baseTotal } = parseBaseNetwork(baseIpStr, basePrefix);

  if (requirements.length === 0) {
    throw new Error('Debes indicar al menos un requerimiento.');
  }

  // Orden estable: mayor a menor cantidad de hosts (se conserva el orden original en empates).
  const sorted = requirements
    .map((req, index) => ({ req, index }))
    .sort((a, b) => b.req.hosts - a.req.hosts || a.index - b.index)
    .map(({ req }) => req);

  const baseEnd = baseNetwork + baseTotal; // exclusivo
  let cursor = baseNetwork;
  const subnets: VLSMSubnetResult[] = [];
  let allocated = 0;
  let wastedHosts = 0;

  for (const req of sorted) {
    const prefix = prefixForHosts(req.hosts, allowPointToPoint31);
    if (prefix < basePrefix) {
      throw new Error(
        `"${req.name}" necesita un /${prefix}, que es más grande que la red base /${basePrefix}.`,
      );
    }
    const size = Math.pow(2, 32 - prefix);

    // Alinear el cursor al tamaño del bloque. Como se ordena de mayor a menor, normalmente ya está alineado.
    const aligned = Math.ceil((cursor - baseNetwork) / size) * size + baseNetwork;
    if (aligned + size > baseEnd) {
      throw new Error(
        `No hay espacio suficiente en ${longToIp(baseNetwork)}/${basePrefix} para "${req.name}" (${req.hosts} hosts, /${prefix}).`,
      );
    }

    const network = aligned;
    const broadcast = network + size - 1;
    let first: number;
    let last: number;
    let available: number;
    if (prefix === 32) {
      first = last = network;
      available = 1;
    } else if (prefix === 31) {
      first = network;
      last = broadcast;
      available = 2;
    } else {
      first = network + 1;
      last = broadcast - 1;
      available = size - 2;
    }

    const wasted = available - req.hosts;
    wastedHosts += wasted;
    allocated += size;

    subnets.push({
      name: req.name,
      hostsRequested: req.hosts,
      hostsAvailable: available,
      prefix,
      maskDecimal: longToIp(prefixToMask(prefix)),
      networkAddress: longToIp(network),
      firstUsableIP: longToIp(first),
      lastUsableIP: longToIp(last),
      broadcastAddress: longToIp(broadcast),
      totalIPs: size,
      wastedHosts: wasted,
    });

    cursor = network + size;
  }

  return {
    subnets,
    summary: {
      baseNetwork: `${longToIp(baseNetwork)}/${basePrefix}`,
      baseTotalIPs: baseTotal,
      allocatedIPs: allocated,
      freeIPs: baseTotal - (cursor - baseNetwork),
      wastedHosts,
      nextFreeAddress: cursor > MAX_LONG || cursor >= baseEnd ? null : longToIp(cursor),
    },
  };
}
