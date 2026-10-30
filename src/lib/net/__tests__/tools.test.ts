import { describe, expect, it } from 'vitest';
import { toCSV } from '../../csv';
import { convertFromFormat, convertIP } from '../converter';
import { MAX_FLSM_SUBNETS, splitByHosts, splitBySubnetCount } from '../flsm';
import { parseCIDR, parsePrefixOrMask } from '../parse';

describe('convertIP', () => {
  it('convierte a binario, hexadecimal y entero', () => {
    const r = convertIP('192.168.1.1');
    expect(r.decimal).toBe('192.168.1.1');
    expect(r.binary).toBe('11000000.10101000.00000001.00000001');
    expect(r.hex).toBe('0xC0A80101');
    expect(r.integer).toBe(3232235777);
    expect(r.octets).toEqual([192, 168, 1, 1]);
  });

  it('maneja los extremos', () => {
    expect(convertIP('0.0.0.0').hex).toBe('0x00000000');
    expect(convertIP('0.0.0.0').integer).toBe(0);
    expect(convertIP('255.255.255.255').hex).toBe('0xFFFFFFFF');
    expect(convertIP('255.255.255.255').integer).toBe(4294967295);
    expect(convertIP('128.0.0.0').integer).toBe(2147483648);
  });

  it('rechaza IPs inválidas', () => {
    expect(() => convertIP('256.0.0.1')).toThrow();
  });
});

describe('convertFromFormat', () => {
  const expected = '192.168.1.1';

  it('lee binario con y sin puntos', () => {
    expect(convertFromFormat('binary', '11000000.10101000.00000001.00000001').decimal).toBe(expected);
    expect(convertFromFormat('binary', '11000000101010000000000100000001').decimal).toBe(expected);
    expect(convertFromFormat('binary', '11000000 10101000 00000001 00000001').decimal).toBe(expected);
  });

  it('lee hexadecimal con 0x, sin 0x y con puntos', () => {
    expect(convertFromFormat('hex', '0xC0A80101').decimal).toBe(expected);
    expect(convertFromFormat('hex', 'c0a80101').decimal).toBe(expected);
    expect(convertFromFormat('hex', 'C0.A8.01.01').decimal).toBe(expected);
    expect(convertFromFormat('hex', '0x1').decimal).toBe('0.0.0.1');
  });

  it('lee enteros', () => {
    expect(convertFromFormat('integer', '3232235777').decimal).toBe(expected);
    expect(convertFromFormat('integer', '0').decimal).toBe('0.0.0.0');
    expect(convertFromFormat('integer', '4294967295').decimal).toBe('255.255.255.255');
  });

  it('lee decimal', () => {
    expect(convertFromFormat('decimal', ' 10.0.0.1 ').integer).toBe(167772161);
  });

  it('rechaza valores inválidos', () => {
    expect(() => convertFromFormat('binary', '1010')).toThrow();
    expect(() => convertFromFormat('binary', '2'.repeat(32))).toThrow();
    expect(() => convertFromFormat('hex', 'xyz')).toThrow();
    expect(() => convertFromFormat('hex', '1FFFFFFFF')).toThrow();
    expect(() => convertFromFormat('integer', '4294967296')).toThrow();
    expect(() => convertFromFormat('integer', '-1')).toThrow();
    expect(() => convertFromFormat('integer', '1.5')).toThrow();
  });
});

describe('parseCIDR / parsePrefixOrMask', () => {
  it('parsea CIDR', () => {
    expect(parseCIDR('192.168.1.0/24')).toEqual({ ip: '192.168.1.0', prefix: 24 });
    expect(parseCIDR(' 10.0.0.0 / 8 ')).toEqual({ ip: '10.0.0.0', prefix: 8 });
    expect(() => parseCIDR('192.168.1.0')).toThrow();
    expect(() => parseCIDR('192.168.1.0/33')).toThrow();
    expect(() => parseCIDR('192.168.1.256/24')).toThrow();
  });

  it('acepta prefijo o máscara', () => {
    expect(parsePrefixOrMask('27')).toBe(27);
    expect(parsePrefixOrMask('/27')).toBe(27);
    expect(parsePrefixOrMask('255.255.255.224')).toBe(27);
    expect(parsePrefixOrMask('0.0.0.0')).toBe(0);
    expect(parsePrefixOrMask('/0')).toBe(0);
    expect(() => parsePrefixOrMask('33')).toThrow();
    expect(() => parsePrefixOrMask('')).toThrow();
    expect(() => parsePrefixOrMask('abc')).toThrow();
    expect(() => parsePrefixOrMask('255.0.255.0')).toThrow();
  });
});

describe('FLSM', () => {
  it('divide un /24 en 4 subredes /26', () => {
    const r = splitBySubnetCount('192.168.1.0', 24, 4);
    expect(r.newPrefix).toBe(26);
    expect(r.borrowedBits).toBe(2);
    expect(r.generated).toBe(4);
    expect(r.hostsPerSubnet).toBe(62);
    expect(r.subnets.map((s) => s.networkAddress)).toEqual([
      '192.168.1.0',
      '192.168.1.64',
      '192.168.1.128',
      '192.168.1.192',
    ]);
    expect(r.subnets[3].broadcastAddress).toBe('192.168.1.255');
  });

  it('redondea hacia arriba a la siguiente potencia de 2', () => {
    const r = splitBySubnetCount('192.168.1.0', 24, 5);
    expect(r.requested).toBe(5);
    expect(r.generated).toBe(8);
    expect(r.newPrefix).toBe(27);
  });

  it('1 subred devuelve la misma red', () => {
    const r = splitBySubnetCount('192.168.1.99', 24, 1);
    expect(r.generated).toBe(1);
    expect(r.subnets[0].networkAddress).toBe('192.168.1.0');
    expect(r.newPrefix).toBe(24);
  });

  it('divide por cantidad de hosts', () => {
    const r = splitByHosts('192.168.1.0', 24, 50);
    expect(r.newPrefix).toBe(26);
    expect(r.generated).toBe(4);
    expect(r.hostsPerSubnet).toBe(62);

    const small = splitByHosts('192.168.1.0', 24, 2);
    expect(small.newPrefix).toBe(30);
    expect(small.generated).toBe(64);
    expect(small.subnets[63].networkAddress).toBe('192.168.1.252');
  });

  it('funciona cruzando octetos', () => {
    const r = splitBySubnetCount('10.0.0.0', 16, 4);
    expect(r.subnets.map((s) => s.networkAddress)).toEqual(['10.0.0.0', '10.0.64.0', '10.0.128.0', '10.0.192.0']);
  });

  it('da error cuando no se puede dividir', () => {
    expect(() => splitBySubnetCount('10.0.0.0', 30, 8)).toThrow(/\/32/);
    expect(() => splitByHosts('192.168.1.0', 24, 1000)).toThrow(/más grandes/);
    expect(() => splitBySubnetCount('10.0.0.0', 24, 0)).toThrow();
    expect(() => splitBySubnetCount('10.0.0.0', 8, MAX_FLSM_SUBNETS * 2)).toThrow(/máximo/);
  });
});

describe('toCSV', () => {
  it('escapa comas y comillas', () => {
    const csv = toCSV(['Nombre', 'Red'], [['Ventas, Norte', '10.0.0.0/24'], ['Dice "hola"', 5]]);
    expect(csv).toBe('Nombre,Red\r\n"Ventas, Norte",10.0.0.0/24\r\n"Dice ""hola""",5');
  });
});
