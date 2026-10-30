import { calculateSubnet, ipToLong, longToIp, prefixToMask } from './ipv4';
import type { IPv4SubnetResult } from './types';
import { prefixForHosts } from './vlsm';

/** Máximo de subredes que se generan para no congelar el navegador. */
export const MAX_FLSM_SUBNETS = 65536;

export interface FLSMResult {
  baseNetwork: string;
  basePrefix: number;
  newPrefix: number;
  /** Bits que se "piden prestados" a la porción de host. */
  borrowedBits: number;
  /** Cantidad de subredes que existen con ese prefijo (siempre potencia de 2). */
  generated: number;
  /** Cantidad pedida por el usuario (igual a `generated` en el modo por hosts). */
  requested: number;
  hostsPerSubnet: number;
  subnets: IPv4SubnetResult[];
}

function buildSubnets(baseIp: string, basePrefix: number, newPrefix: number, requested: number): FLSMResult {
  if (basePrefix < 0 || basePrefix > 32 || !Number.isInteger(basePrefix)) {
    throw new Error(`Prefijo base inválido: /${basePrefix}`);
  }
  if (newPrefix > 32) {
    throw new Error(`No se puede dividir /${basePrefix} de esa forma: el prefijo resultante (/${newPrefix}) supera /32.`);
  }
  if (newPrefix < basePrefix) {
    throw new Error(`Las subredes serían más grandes que la red base /${basePrefix}.`);
  }
  const borrowedBits = newPrefix - basePrefix;
  const generated = Math.pow(2, borrowedBits);
  if (generated > MAX_FLSM_SUBNETS) {
    throw new Error(
      `Eso generaría ${generated.toLocaleString('es')} subredes (máximo permitido: ${MAX_FLSM_SUBNETS.toLocaleString('es')}).`,
    );
  }

  const baseNetwork = (ipToLong(baseIp) & prefixToMask(basePrefix)) >>> 0;
  const size = Math.pow(2, 32 - newPrefix);
  const subnets: IPv4SubnetResult[] = [];
  for (let i = 0; i < generated; i++) {
    subnets.push(calculateSubnet(longToIp(baseNetwork + i * size), newPrefix));
  }

  return {
    baseNetwork: longToIp(baseNetwork),
    basePrefix,
    newPrefix,
    borrowedBits,
    generated,
    requested,
    hostsPerSubnet: subnets[0].usableHosts,
    subnets,
  };
}

/** Divide una red en N subredes de igual tamaño (se redondea N a la siguiente potencia de 2). */
export function splitBySubnetCount(baseIp: string, basePrefix: number, count: number): FLSMResult {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('La cantidad de subredes debe ser un entero mayor o igual a 1.');
  }
  let borrowed = 0;
  while (Math.pow(2, borrowed) < count) borrowed++;
  return buildSubnets(baseIp, basePrefix, basePrefix + borrowed, count);
}

/** Divide una red en subredes que alojen al menos `hosts` equipos cada una. */
export function splitByHosts(baseIp: string, basePrefix: number, hosts: number): FLSMResult {
  const newPrefix = prefixForHosts(hosts);
  const result = buildSubnets(baseIp, basePrefix, newPrefix, 0);
  return { ...result, requested: result.generated };
}
