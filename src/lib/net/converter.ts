import { ipToLong, longToBinaryDotted, longToIp } from './ipv4';

export interface IPConversion {
  /** Decimal con puntos, ej. `192.168.1.1`. */
  decimal: string;
  /** Binario con puntos, ej. `11000000.10101000.00000001.00000001`. */
  binary: string;
  /** Hexadecimal, ej. `0xC0A80101`. */
  hex: string;
  /** Entero de 32 bits sin signo, ej. `3232235777`. */
  integer: number;
  octets: number[];
}

export type IPFormat = 'decimal' | 'binary' | 'hex' | 'integer';

function fromLong(long: number): IPConversion {
  const decimal = longToIp(long);
  return {
    decimal,
    binary: longToBinaryDotted(long),
    hex: `0x${long.toString(16).toUpperCase().padStart(8, '0')}`,
    integer: long,
    octets: decimal.split('.').map(Number),
  };
}

/** Convierte una IPv4 decimal a binario, hexadecimal y entero de 32 bits. */
export function convertIP(ip: string): IPConversion {
  return fromLong(ipToLong(ip));
}

/**
 * Interpreta un valor escrito en un formato concreto y devuelve todas las conversiones.
 * Binario acepta puntos/espacios; hexadecimal acepta prefijo `0x` y puntos.
 */
export function convertFromFormat(format: IPFormat, value: string): IPConversion {
  const text = value.trim();
  switch (format) {
    case 'decimal':
      return convertIP(text);
    case 'binary': {
      const bits = text.replace(/[.\s]/g, '');
      if (!/^[01]{32}$/.test(bits)) {
        throw new Error('El binario debe tener exactamente 32 bits (0 y 1).');
      }
      return fromLong(parseInt(bits, 2));
    }
    case 'hex': {
      const digits = text.replace(/^0x/i, '').replace(/[.\s]/g, '');
      if (!/^[0-9a-fA-F]{1,8}$/.test(digits)) {
        throw new Error('El hexadecimal debe tener de 1 a 8 dígitos (0-9, A-F).');
      }
      return fromLong(parseInt(digits, 16));
    }
    case 'integer': {
      if (!/^\d{1,10}$/.test(text)) {
        throw new Error('El entero debe ser un número entre 0 y 4294967295.');
      }
      const n = Number(text);
      if (n > 4294967295) throw new Error('El entero no puede superar 4294967295.');
      return fromLong(n);
    }
  }
}
