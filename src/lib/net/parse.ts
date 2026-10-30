import { ipToLong, maskToPrefix } from './ipv4';

export interface ParsedCIDR {
  ip: string;
  prefix: number;
}

/** Convierte "192.168.1.0/24" en `{ ip, prefix }`. Lanza error si el formato no es válido. */
export function parseCIDR(input: string): ParsedCIDR {
  const match = /^\s*(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})\s*$/.exec(input);
  if (!match) {
    throw new Error(`Formato inválido: "${input.trim()}". Usa IP/prefijo, por ejemplo 192.168.1.0/24.`);
  }
  const prefix = Number(match[2]);
  if (prefix > 32) {
    throw new Error(`Prefijo inválido: /${prefix} (debe estar entre 0 y 32).`);
  }
  ipToLong(match[1]); // valida los octetos
  return { ip: match[1], prefix };
}

/** Acepta "27", "/27" o una máscara decimal "255.255.255.224" y devuelve el prefijo. */
export function parsePrefixOrMask(input: string): number {
  const text = input.trim().replace(/^\//, '');
  if (text === '') {
    throw new Error('Escribe un prefijo (por ejemplo /27) o una máscara (255.255.255.224).');
  }
  if (/^\d{1,2}$/.test(text)) {
    const prefix = Number(text);
    if (prefix > 32) throw new Error(`Prefijo inválido: /${prefix} (debe estar entre 0 y 32).`);
    return prefix;
  }
  if (text.includes('.')) return maskToPrefix(text);
  throw new Error(`Prefijo o máscara inválidos: "${input.trim()}".`);
}
