const FULL_MASK = (1n << 128n) - 1n;

export type IPv6Type =
  | 'GUA'
  | 'ULA'
  | 'Link-Local'
  | 'Multicast'
  | 'Loopback'
  | 'Sin especificar'
  | 'Reservada';

export interface IPv6SubnetResult {
  input: string;
  prefix: number;
  expanded: string;
  compressed: string;
  networkExpanded: string;
  networkCompressed: string;
  /** Red en formato CIDR comprimido, ej. `2803:1920:abcd:1200::/56`. */
  networkCIDR: string;
  firstAddress: string;
  lastAddress: string;
  totalAddresses: bigint;
  /** Cantidad de subredes /64 dentro del prefijo (0 si el prefijo es mayor que /64). */
  subnets64: bigint;
  type: IPv6Type;
  /** Registro regional (solo para GUA) o `null` si no se identifica. */
  rir: string | null;
}

function parseIPv4Tail(text: string): [string, string] {
  const parts = text.split('.');
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) {
    throw new Error(`IPv6 inválida: IPv4 incrustada "${text}" no es válida.`);
  }
  const [a, b, c, d] = parts.map(Number);
  const hi = ((a << 8) | b).toString(16);
  const lo = ((c << 8) | d).toString(16);
  return [hi, lo];
}

function parseGroups(ip: string): number[] {
  let text = ip.trim().toLowerCase();
  const zone = text.indexOf('%');
  if (zone !== -1) text = text.slice(0, zone);
  if (text === '') throw new Error('Escribe una dirección IPv6.');

  // IPv4 incrustada al final (ej. ::ffff:192.168.1.1).
  if (text.includes('.')) {
    const lastColon = text.lastIndexOf(':');
    if (lastColon === -1) throw new Error(`IPv6 inválida: "${ip.trim()}".`);
    const [hi, lo] = parseIPv4Tail(text.slice(lastColon + 1));
    text = `${text.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const doubleColon = text.split('::');
  if (doubleColon.length > 2) {
    throw new Error(`IPv6 inválida: "${ip.trim()}" tiene más de un "::".`);
  }

  let groups: string[];
  if (doubleColon.length === 2) {
    const left = doubleColon[0] === '' ? [] : doubleColon[0].split(':');
    const right = doubleColon[1] === '' ? [] : doubleColon[1].split(':');
    const missing = 8 - (left.length + right.length);
    if (missing < 1) throw new Error(`IPv6 inválida: "${ip.trim()}" tiene demasiados grupos.`);
    groups = [...left, ...Array<string>(missing).fill('0'), ...right];
  } else {
    groups = text.split(':');
    if (groups.length !== 8) {
      throw new Error(`IPv6 inválida: se esperaban 8 grupos y hay ${groups.length}.`);
    }
  }

  return groups.map((g) => {
    if (!/^[0-9a-f]{1,4}$/.test(g)) {
      throw new Error(`IPv6 inválida: el grupo "${g}" no es hexadecimal de 1 a 4 dígitos.`);
    }
    return parseInt(g, 16);
  });
}

/** Convierte una IPv6 en texto a un entero de 128 bits. */
export function ipv6ToBigInt(ip: string): bigint {
  return parseGroups(ip).reduce((acc, g) => (acc << 16n) | BigInt(g), 0n);
}

function bigIntToGroups(value: bigint): number[] {
  const groups: number[] = [];
  for (let i = 0; i < 8; i++) {
    groups.push(Number((value >> BigInt(16 * (7 - i))) & 0xffffn));
  }
  return groups;
}

function groupsToExpanded(groups: number[]): string {
  return groups.map((g) => g.toString(16).padStart(4, '0')).join(':');
}

function groupsToCompressed(groups: number[]): string {
  // RFC 5952: se comprime la secuencia MÁS LARGA de ceros (mínimo 2 grupos); en empate, la primera.
  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < 8) {
    if (groups[i] === 0) {
      let j = i;
      while (j < 8 && groups[j] === 0) j++;
      const len = j - i;
      if (len > bestLen) {
        bestStart = i;
        bestLen = len;
      }
      i = j;
    } else {
      i++;
    }
  }
  const hex = groups.map((g) => g.toString(16));
  if (bestLen < 2) return hex.join(':');
  return `${hex.slice(0, bestStart).join(':')}::${hex.slice(bestStart + bestLen).join(':')}`;
}

/** Descomprime una IPv6 a 8 grupos de 4 dígitos hexadecimales. */
export function expandIPv6(ip: string): string {
  return groupsToExpanded(parseGroups(ip));
}

/** Comprime una IPv6 según RFC 5952. */
export function compressIPv6(ip: string): string {
  return groupsToCompressed(parseGroups(ip));
}

function inPrefix(value: bigint, base: bigint, bits: number): boolean {
  const shift = BigInt(128 - bits);
  return value >> shift === base >> shift;
}

function classify(value: bigint): IPv6Type {
  if (value === 0n) return 'Sin especificar';
  if (value === 1n) return 'Loopback';
  if (inPrefix(value, ipv6ToBigInt('ff00::'), 8)) return 'Multicast';
  if (inPrefix(value, ipv6ToBigInt('fe80::'), 10)) return 'Link-Local';
  if (inPrefix(value, ipv6ToBigInt('fc00::'), 7)) return 'ULA';
  if (inPrefix(value, ipv6ToBigInt('2000::'), 3)) return 'GUA';
  return 'Reservada';
}

const RIR_BLOCKS: { base: string; bits: number; name: string }[] = [
  { base: '2800::', bits: 12, name: 'LACNIC (Latinoamérica y Caribe)' },
  { base: '2600::', bits: 12, name: 'ARIN (EE. UU. y Canadá)' },
  { base: '2620::', bits: 23, name: 'ARIN (EE. UU. y Canadá)' },
  { base: '2a00::', bits: 12, name: 'RIPE NCC (Europa y Medio Oriente)' },
  { base: '2400::', bits: 12, name: 'APNIC (Asia y Oceanía)' },
  { base: '2c00::', bits: 12, name: 'AFRINIC (África)' },
];

function detectRIR(value: bigint): string | null {
  if (inPrefix(value, ipv6ToBigInt('2001:db8::'), 32)) return 'Documentación (RFC 3849)';
  for (const block of RIR_BLOCKS) {
    if (inPrefix(value, ipv6ToBigInt(block.base), block.bits)) return block.name;
  }
  if (inPrefix(value, ipv6ToBigInt('2001::'), 16)) return 'Bloque histórico 2001::/16 (varios RIR)';
  return null;
}

/** Calcula red, rango, tipo, RIR y cantidad de /64 para una IPv6 con prefijo. */
export function calculateIPv6Subnet(ipStr: string, prefix: number): IPv6SubnetResult {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) {
    throw new Error(`Prefijo inválido: /${prefix} (debe estar entre 0 y 128).`);
  }
  const value = ipv6ToBigInt(ipStr);
  const hostBits = BigInt(128 - prefix);
  const hostMask = (1n << hostBits) - 1n;
  const network = value & (FULL_MASK ^ hostMask);
  const last = network | hostMask;

  const type = classify(value);
  const networkGroups = bigIntToGroups(network);
  const networkCompressed = groupsToCompressed(networkGroups);

  return {
    input: ipStr.trim(),
    prefix,
    expanded: groupsToExpanded(bigIntToGroups(value)),
    compressed: groupsToCompressed(bigIntToGroups(value)),
    networkExpanded: groupsToExpanded(networkGroups),
    networkCompressed,
    networkCIDR: `${networkCompressed}/${prefix}`,
    firstAddress: networkCompressed,
    lastAddress: groupsToCompressed(bigIntToGroups(last)),
    totalAddresses: 1n << hostBits,
    subnets64: prefix <= 64 ? 1n << BigInt(64 - prefix) : 0n,
    type,
    rir: type === 'GUA' ? detectRIR(value) : null,
  };
}
