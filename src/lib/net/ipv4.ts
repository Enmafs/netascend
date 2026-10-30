import type { IPClass, IPScope, IPv4SubnetResult, WorkingOctet } from './types';

const MAX_LONG = 0xffffffff;

/** Convierte una IPv4 en texto a entero sin signo de 32 bits. Lanza error si es inválida. */
export function ipToLong(ip: string): number {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) {
    throw new Error(`IPv4 inválida: "${ip}"`);
  }
  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      throw new Error(`IPv4 inválida: "${ip}"`);
    }
    const octet = Number(part);
    if (octet > 255) {
      throw new Error(`IPv4 inválida: "${ip}"`);
    }
    result = ((result << 8) | octet) >>> 0;
  }
  return result >>> 0;
}

/** Convierte un entero sin signo de 32 bits a IPv4 en texto. */
export function longToIp(long: number): string {
  if (!Number.isInteger(long) || long < 0 || long > MAX_LONG) {
    throw new Error(`Valor fuera del rango de 32 bits: ${long}`);
  }
  return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');
}

function assertPrefix(prefix: number): void {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Prefijo inválido: ${prefix} (debe estar entre 0 y 32)`);
  }
}

/** Máscara como entero sin signo de 32 bits para un prefijo de 0 a 32. */
export function prefixToMask(prefix: number): number {
  assertPrefix(prefix);
  if (prefix === 0) return 0;
  // `<<` en JS opera en 32 bits con signo y desplazar 32 es un no-op; por eso se trata /0 aparte.
  return (MAX_LONG << (32 - prefix)) >>> 0;
}

/** Convierte una máscara decimal (ej. 255.255.255.224) a prefijo. Lanza error si no es contigua. */
export function maskToPrefix(mask: string): number {
  const long = ipToLong(mask);
  let prefix = 0;
  let seenZero = false;
  for (let bit = 31; bit >= 0; bit--) {
    const isOne = ((long >>> bit) & 1) === 1;
    if (isOne) {
      if (seenZero) throw new Error(`Máscara no contigua: "${mask}"`);
      prefix++;
    } else {
      seenZero = true;
    }
  }
  return prefix;
}

export function longToBinaryDotted(long: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((long >>> shift) & 255).toString(2).padStart(8, '0'))
    .join('.');
}

/** Octeto de trabajo: 1 si /1–/8, 2 si /9–/16, 3 si /17–/24, 4 si /25–/32. El /0 se trata como 1. */
export function getWorkingOctet(prefix: number): WorkingOctet {
  assertPrefix(prefix);
  if (prefix <= 8) return 1;
  if (prefix <= 16) return 2;
  if (prefix <= 24) return 3;
  return 4;
}

function getIpClass(ipLong: number): IPClass {
  const first = ipLong >>> 24;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

function inRange(ipLong: number, base: string, prefix: number): boolean {
  const mask = prefixToMask(prefix);
  return ((ipLong & mask) >>> 0) === ((ipToLong(base) & mask) >>> 0);
}

export function getIpScope(ipLong: number): IPScope {
  if (inRange(ipLong, '127.0.0.0', 8)) return 'Loopback';
  if (inRange(ipLong, '10.0.0.0', 8)) return 'Privada (RFC 1918)';
  if (inRange(ipLong, '172.16.0.0', 12)) return 'Privada (RFC 1918)';
  if (inRange(ipLong, '192.168.0.0', 16)) return 'Privada (RFC 1918)';
  if (inRange(ipLong, '100.64.0.0', 10)) return 'CGNAT (RFC 6598)';
  if (inRange(ipLong, '169.254.0.0', 16)) return 'Link-Local';
  if (inRange(ipLong, '224.0.0.0', 4)) return 'Multicast';
  if (inRange(ipLong, '240.0.0.0', 4)) return 'Reservada (Clase E)';
  return 'Pública';
}

/** Valor de la máscara en el octeto de trabajo y salto (256 - máscara). */
export function computeSalto(maskLong: number, workingOctet: WorkingOctet): number {
  const shift = (4 - workingOctet) * 8;
  const maskOctet = (maskLong >>> shift) & 255;
  return 256 - maskOctet;
}

export function getSalto(prefix: number): number {
  return computeSalto(prefixToMask(prefix), getWorkingOctet(prefix));
}

export function prefixToWildcard(prefix: number): string {
  return longToIp((~prefixToMask(prefix)) >>> 0);
}

export function classifyIpv4(ipStr: string) {
  const ipLong = ipToLong(ipStr);
  const scope = getIpScope(ipLong);
  const classful = getIpClass(ipLong);
  return {
    scope,
    classful,
    isRoutablePublicly: scope === 'Pública',
    rfc:
      scope === 'Privada (RFC 1918)'
        ? 'RFC 1918'
        : scope.includes('CGNAT')
        ? 'RFC 6598'
        : scope.includes('Loopback')
        ? 'RFC 1122'
        : scope.includes('Link-Local')
        ? 'RFC 3927'
        : scope.includes('Multicast')
        ? 'RFC 5771'
        : 'Pública Global',
  };
}

/**
 * Calcula todos los datos de una subred IPv4.
 * Usa operaciones de bits sin signo (`>>> 0`) para evitar errores de signo en JavaScript.
 */
export function calculateSubnet(ipStr: string, prefix: number): IPv4SubnetResult {
  assertPrefix(prefix);
  const ipLong = ipToLong(ipStr);
  const maskLong = prefixToMask(prefix);
  const wildcardLong = (~maskLong) >>> 0;

  const networkLong = (ipLong & maskLong) >>> 0;
  const broadcastLong = (networkLong | wildcardLong) >>> 0;
  // 2^(32 - prefix): se usa Math.pow porque `1 << 32` desborda en JS.
  const totalIPs = Math.pow(2, 32 - prefix);

  const nextLong = networkLong + totalIPs;
  const nextNetworkAddress = nextLong > MAX_LONG ? null : longToIp(nextLong);

  let firstLong: number;
  let lastLong: number;
  let usableHosts: number;
  if (prefix === 32) {
    firstLong = networkLong;
    lastLong = networkLong;
    usableHosts = 1;
  } else if (prefix === 31) {
    firstLong = networkLong;
    lastLong = broadcastLong;
    usableHosts = 2;
  } else {
    firstLong = networkLong + 1;
    lastLong = broadcastLong - 1;
    usableHosts = totalIPs - 2;
  }

  const workingOctet = getWorkingOctet(prefix);

  return {
    ip: longToIp(ipLong),
    prefix,
    maskDecimal: longToIp(maskLong),
    maskBinary: longToBinaryDotted(maskLong),
    wildcardDecimal: longToIp(wildcardLong),
    workingOctet,
    salto: computeSalto(maskLong, workingOctet),
    networkAddress: longToIp(networkLong),
    firstUsableIP: longToIp(firstLong),
    lastUsableIP: longToIp(lastLong),
    broadcastAddress: longToIp(broadcastLong),
    nextNetworkAddress,
    totalIPs,
    usableHosts,
    ipClass: getIpClass(ipLong),
    scope: getIpScope(ipLong),
  };
}
