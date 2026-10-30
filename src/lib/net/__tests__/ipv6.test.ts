import { describe, expect, it } from 'vitest';
import { calculateIPv6Subnet, compressIPv6, expandIPv6, ipv6ToBigInt } from '../ipv6';

describe('expandIPv6', () => {
  it('descomprime ::', () => {
    expect(expandIPv6('::1')).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(expandIPv6('::')).toBe('0000:0000:0000:0000:0000:0000:0000:0000');
    expect(expandIPv6('2001:db8::ff00:42:8329')).toBe('2001:0db8:0000:0000:0000:ff00:0042:8329');
    expect(expandIPv6('fe80::')).toBe('fe80:0000:0000:0000:0000:0000:0000:0000');
    expect(expandIPv6('1:2:3:4:5:6:7::')).toBe('0001:0002:0003:0004:0005:0006:0007:0000');
  });

  it('acepta mayúsculas, ceros omitidos y direcciones completas', () => {
    expect(expandIPv6('2001:DB8:0:0:0:0:0:1')).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(expandIPv6('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe(
      '2001:0db8:0000:0000:0000:0000:0000:0001',
    );
  });

  it('acepta IPv4 incrustada', () => {
    expect(expandIPv6('::ffff:192.168.1.1')).toBe('0000:0000:0000:0000:0000:ffff:c0a8:0101');
  });

  it('rechaza direcciones inválidas', () => {
    expect(() => expandIPv6('1::2::3')).toThrow();
    expect(() => expandIPv6('12345::1')).toThrow();
    expect(() => expandIPv6('g::1')).toThrow();
    expect(() => expandIPv6('1:2:3:4:5:6:7')).toThrow();
    expect(() => expandIPv6('1:2:3:4:5:6:7:8:9')).toThrow();
    expect(() => expandIPv6(':::')).toThrow();
    expect(() => expandIPv6('')).toThrow();
    expect(() => expandIPv6('::ffff:999.1.1.1')).toThrow();
  });
});

describe('compressIPv6 (RFC 5952)', () => {
  it('quita ceros a la izquierda y comprime la secuencia más larga', () => {
    expect(compressIPv6('2001:0db8:0000:0000:0000:ff00:0042:8329')).toBe('2001:db8::ff00:42:8329');
    expect(compressIPv6('0000:0000:0000:0000:0000:0000:0000:0001')).toBe('::1');
    expect(compressIPv6('0:0:0:0:0:0:0:0')).toBe('::');
    expect(compressIPv6('FE80:0:0:0:0:0:0:1')).toBe('fe80::1');
  });

  it('en empate comprime la primera secuencia', () => {
    expect(compressIPv6('2001:db8:0:0:1:0:0:1')).toBe('2001:db8::1:0:0:1');
  });

  it('comprime la más larga aunque no sea la primera', () => {
    expect(compressIPv6('1:0:0:2:0:0:0:3')).toBe('1:0:0:2::3');
  });

  it('no comprime un único grupo de ceros', () => {
    expect(compressIPv6('2001:db8:0:1:1:1:1:1')).toBe('2001:db8:0:1:1:1:1:1');
  });

  it('comprimir y expandir son inversas', () => {
    for (const ip of ['::', '::1', 'fe80::1', '2001:db8::1', '2803:1920:abcd:1200::', '1:2:3:4:5:6:7:8']) {
      expect(compressIPv6(expandIPv6(ip))).toBe(compressIPv6(ip));
      expect(ipv6ToBigInt(expandIPv6(ip))).toBe(ipv6ToBigInt(ip));
    }
  });
});

describe('calculateIPv6Subnet', () => {
  it('calcula una /56 delegada por el ISP', () => {
    const r = calculateIPv6Subnet('2803:1920:abcd:1234:5678::1', 56);
    expect(r.networkCompressed).toBe('2803:1920:abcd:1200::');
    expect(r.networkCIDR).toBe('2803:1920:abcd:1200::/56');
    expect(r.networkExpanded).toBe('2803:1920:abcd:1200:0000:0000:0000:0000');
    expect(r.lastAddress).toBe('2803:1920:abcd:12ff:ffff:ffff:ffff:ffff');
    expect(r.compressed).toBe('2803:1920:abcd:1234:5678::1');
    expect(r.subnets64).toBe(256n);
    expect(r.totalAddresses).toBe(1n << 72n);
    expect(r.type).toBe('GUA');
    expect(r.rir).toMatch(/LACNIC/);
  });

  it('una /64 contiene exactamente una subred /64', () => {
    const r = calculateIPv6Subnet('2800:370:1:2::5', 64);
    expect(r.subnets64).toBe(1n);
    expect(r.networkCIDR).toBe('2800:370:1:2::/64');
    expect(r.totalAddresses).toBe(1n << 64n);
  });

  it('prefijos más largos que /64 no tienen subredes /64', () => {
    const r = calculateIPv6Subnet('2001:db8::1', 128);
    expect(r.subnets64).toBe(0n);
    expect(r.totalAddresses).toBe(1n);
    expect(r.networkCompressed).toBe('2001:db8::1');
    expect(r.lastAddress).toBe('2001:db8::1');
  });

  it('/0 abarca todo', () => {
    const r = calculateIPv6Subnet('2800::1', 0);
    expect(r.networkCompressed).toBe('::');
    expect(r.subnets64).toBe(1n << 64n);
    expect(r.totalAddresses).toBe(1n << 128n);
    expect(r.lastAddress).toBe('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff');
  });

  it('clasifica los tipos de dirección', () => {
    expect(calculateIPv6Subnet('fe80::1', 64).type).toBe('Link-Local');
    expect(calculateIPv6Subnet('febf::1', 64).type).toBe('Link-Local');
    expect(calculateIPv6Subnet('fec0::1', 64).type).toBe('Reservada');
    expect(calculateIPv6Subnet('fd12:3456:789a::1', 48).type).toBe('ULA');
    expect(calculateIPv6Subnet('fc00::1', 48).type).toBe('ULA');
    expect(calculateIPv6Subnet('ff02::1', 128).type).toBe('Multicast');
    expect(calculateIPv6Subnet('::1', 128).type).toBe('Loopback');
    expect(calculateIPv6Subnet('::', 128).type).toBe('Sin especificar');
    expect(calculateIPv6Subnet('2001:4860:4860::8888', 64).type).toBe('GUA');
    expect(calculateIPv6Subnet('3fff::1', 64).type).toBe('GUA');
    expect(calculateIPv6Subnet('4000::1', 64).type).toBe('Reservada');
  });

  it('solo las GUA tienen RIR', () => {
    expect(calculateIPv6Subnet('fe80::1', 64).rir).toBeNull();
    expect(calculateIPv6Subnet('fd00::1', 64).rir).toBeNull();
  });

  it('detecta el RIR por prefijo regional', () => {
    expect(calculateIPv6Subnet('2800:370::1', 64).rir).toMatch(/LACNIC/);
    expect(calculateIPv6Subnet('2803:1920::1', 64).rir).toMatch(/LACNIC/);
    expect(calculateIPv6Subnet('2806::1', 64).rir).toMatch(/LACNIC/);
    expect(calculateIPv6Subnet('2600::1', 64).rir).toMatch(/ARIN/);
    expect(calculateIPv6Subnet('2620:0:1::1', 64).rir).toMatch(/ARIN/);
    expect(calculateIPv6Subnet('2a02:26f0::1', 64).rir).toMatch(/RIPE/);
    expect(calculateIPv6Subnet('2400:cb00::1', 64).rir).toMatch(/APNIC/);
    expect(calculateIPv6Subnet('2c0f:f248::1', 64).rir).toMatch(/AFRINIC/);
    expect(calculateIPv6Subnet('2001:db8::1', 64).rir).toMatch(/Documentación/);
    expect(calculateIPv6Subnet('2001:4860::1', 64).rir).toMatch(/2001::\/16/);
  });

  it('rechaza prefijos inválidos', () => {
    expect(() => calculateIPv6Subnet('2001:db8::1', 129)).toThrow();
    expect(() => calculateIPv6Subnet('2001:db8::1', -1)).toThrow();
    expect(() => calculateIPv6Subnet('2001:db8::1', 64.5)).toThrow();
  });
});
