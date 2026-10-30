import { describe, expect, it } from 'vitest';
import {
  calculateSubnet,
  getWorkingOctet,
  ipToLong,
  longToIp,
  maskToPrefix,
  prefixToMask,
} from '../ipv4';
import { calculateVLSM, prefixForHosts } from '../vlsm';

describe('ipToLong / longToIp', () => {
  it('convierte ida y vuelta sin errores de signo', () => {
    expect(ipToLong('0.0.0.0')).toBe(0);
    expect(ipToLong('255.255.255.255')).toBe(4294967295);
    expect(ipToLong('128.0.0.0')).toBe(2147483648);
    expect(ipToLong('192.168.1.1')).toBe(3232235777);
    for (const ip of ['0.0.0.0', '10.0.0.1', '128.0.0.1', '185.120.45.19', '255.255.255.255']) {
      expect(longToIp(ipToLong(ip))).toBe(ip);
    }
  });

  it('rechaza IPs inválidas', () => {
    expect(() => ipToLong('256.1.1.1')).toThrow();
    expect(() => ipToLong('1.1.1')).toThrow();
    expect(() => ipToLong('1.1.1.1.1')).toThrow();
    expect(() => ipToLong('a.b.c.d')).toThrow();
    expect(() => ipToLong('1.1.1.-1')).toThrow();
  });
});

describe('prefixToMask / maskToPrefix', () => {
  it('genera las 33 máscaras correctamente', () => {
    expect(prefixToMask(0)).toBe(0);
    expect(longToIp(prefixToMask(1))).toBe('128.0.0.0');
    expect(longToIp(prefixToMask(8))).toBe('255.0.0.0');
    expect(longToIp(prefixToMask(11))).toBe('255.224.0.0');
    expect(longToIp(prefixToMask(20))).toBe('255.255.240.0');
    expect(longToIp(prefixToMask(27))).toBe('255.255.255.224');
    expect(longToIp(prefixToMask(32))).toBe('255.255.255.255');
  });

  it('maskToPrefix es la inversa de prefixToMask', () => {
    for (let p = 0; p <= 32; p++) {
      expect(maskToPrefix(longToIp(prefixToMask(p)))).toBe(p);
    }
  });

  it('rechaza máscaras no contiguas y prefijos fuera de rango', () => {
    expect(() => maskToPrefix('255.255.255.251')).toThrow();
    expect(() => prefixToMask(33)).toThrow();
    expect(() => prefixToMask(-1)).toThrow();
  });
});

describe('getWorkingOctet', () => {
  it('asigna el octeto de trabajo por rango de prefijo', () => {
    expect(getWorkingOctet(6)).toBe(1);
    expect(getWorkingOctet(8)).toBe(1);
    expect(getWorkingOctet(9)).toBe(2);
    expect(getWorkingOctet(16)).toBe(2);
    expect(getWorkingOctet(17)).toBe(3);
    expect(getWorkingOctet(24)).toBe(3);
    expect(getWorkingOctet(25)).toBe(4);
    expect(getWorkingOctet(32)).toBe(4);
  });
});

describe('calculateSubnet: 8 casos de control', () => {
  const cases = [
    { ip: '192.168.1.140', prefix: 27, net: '192.168.1.128', bc: '192.168.1.159', next: '192.168.1.160', salto: 32, octet: 4, usable: 30 },
    { ip: '10.0.0.14', prefix: 30, net: '10.0.0.12', bc: '10.0.0.15', next: '10.0.0.16', salto: 4, octet: 4, usable: 2 },
    { ip: '172.16.67.85', prefix: 22, net: '172.16.64.0', bc: '172.16.67.255', next: '172.16.68.0', salto: 4, octet: 3, usable: 1022 },
    { ip: '10.200.173.45', prefix: 20, net: '10.200.160.0', bc: '10.200.175.255', next: '10.200.176.0', salto: 16, octet: 3, usable: 4094 },
    { ip: '172.20.105.77', prefix: 19, net: '172.20.96.0', bc: '172.20.127.255', next: '172.20.128.0', salto: 32, octet: 3, usable: 8190 },
    { ip: '10.75.140.23', prefix: 13, net: '10.72.0.0', bc: '10.79.255.255', next: '10.80.0.0', salto: 8, octet: 2, usable: 524286 },
    { ip: '10.145.200.89', prefix: 11, net: '10.128.0.0', bc: '10.159.255.255', next: '10.160.0.0', salto: 32, octet: 2, usable: 2097150 },
    { ip: '185.120.45.19', prefix: 6, net: '184.0.0.0', bc: '187.255.255.255', next: '188.0.0.0', salto: 4, octet: 1, usable: 67108862 },
  ];

  for (const c of cases) {
    it(`${c.ip}/${c.prefix}`, () => {
      const r = calculateSubnet(c.ip, c.prefix);
      expect(r.networkAddress).toBe(c.net);
      expect(r.broadcastAddress).toBe(c.bc);
      expect(r.nextNetworkAddress).toBe(c.next);
      expect(r.salto).toBe(c.salto);
      expect(r.workingOctet).toBe(c.octet);
      expect(r.usableHosts).toBe(c.usable);
      expect(r.totalIPs).toBe(Math.pow(2, 32 - c.prefix));
    });
  }

  it('devuelve primera/última útil, máscara y wildcard del /27', () => {
    const r = calculateSubnet('192.168.1.140', 27);
    expect(r.firstUsableIP).toBe('192.168.1.129');
    expect(r.lastUsableIP).toBe('192.168.1.158');
    expect(r.maskDecimal).toBe('255.255.255.224');
    expect(r.maskBinary).toBe('11111111.11111111.11111111.11100000');
    expect(r.wildcardDecimal).toBe('0.0.0.31');
  });

  it('devuelve el rango útil de los casos de octetos 2 y 1', () => {
    const a = calculateSubnet('10.145.200.89', 11);
    expect(a.firstUsableIP).toBe('10.128.0.1');
    expect(a.lastUsableIP).toBe('10.159.255.254');
    const b = calculateSubnet('185.120.45.19', 6);
    expect(b.firstUsableIP).toBe('184.0.0.1');
    expect(b.lastUsableIP).toBe('187.255.255.254');
  });
});

describe('calculateSubnet: casos especiales', () => {
  it('/0 abarca todo internet', () => {
    const r = calculateSubnet('8.8.8.8', 0);
    expect(r.networkAddress).toBe('0.0.0.0');
    expect(r.broadcastAddress).toBe('255.255.255.255');
    expect(r.totalIPs).toBe(4294967296);
    expect(r.usableHosts).toBe(4294967294);
    expect(r.nextNetworkAddress).toBeNull();
    expect(r.maskDecimal).toBe('0.0.0.0');
  });

  it('/1 divide internet en dos mitades', () => {
    expect(calculateSubnet('10.0.0.1', 1).networkAddress).toBe('0.0.0.0');
    expect(calculateSubnet('10.0.0.1', 1).nextNetworkAddress).toBe('128.0.0.0');
    const upper = calculateSubnet('200.1.1.1', 1);
    expect(upper.networkAddress).toBe('128.0.0.0');
    expect(upper.broadcastAddress).toBe('255.255.255.255');
    expect(upper.nextNetworkAddress).toBeNull();
  });

  it('/31 (RFC 3021) tiene 2 hosts utilizables sin red ni broadcast', () => {
    const r = calculateSubnet('10.0.0.5', 31);
    expect(r.networkAddress).toBe('10.0.0.4');
    expect(r.firstUsableIP).toBe('10.0.0.4');
    expect(r.lastUsableIP).toBe('10.0.0.5');
    expect(r.broadcastAddress).toBe('10.0.0.5');
    expect(r.totalIPs).toBe(2);
    expect(r.usableHosts).toBe(2);
    expect(r.salto).toBe(2);
  });

  it('/32 es un host único', () => {
    const r = calculateSubnet('192.168.1.10', 32);
    expect(r.networkAddress).toBe('192.168.1.10');
    expect(r.firstUsableIP).toBe('192.168.1.10');
    expect(r.lastUsableIP).toBe('192.168.1.10');
    expect(r.broadcastAddress).toBe('192.168.1.10');
    expect(r.totalIPs).toBe(1);
    expect(r.usableHosts).toBe(1);
    expect(r.salto).toBe(1);
  });

  it('/24 y /8 (límites de octeto) son "limpios"', () => {
    const a = calculateSubnet('192.168.5.77', 24);
    expect(a.networkAddress).toBe('192.168.5.0');
    expect(a.broadcastAddress).toBe('192.168.5.255');
    expect(a.workingOctet).toBe(3);
    expect(a.usableHosts).toBe(254);
    const b = calculateSubnet('10.200.3.4', 8);
    expect(b.networkAddress).toBe('10.0.0.0');
    expect(b.broadcastAddress).toBe('10.255.255.255');
    expect(b.workingOctet).toBe(1);
    expect(b.usableHosts).toBe(16777214);
  });

  it('IPs terminadas en .0 o .255 intermedias son hosts válidos', () => {
    // 10.129.1.0 dentro de 10.128.0.0/11 es un host común.
    const r = calculateSubnet('10.129.1.0', 11);
    expect(r.networkAddress).toBe('10.128.0.0');
    expect(r.networkAddress).not.toBe(r.ip);
    expect(r.firstUsableIP).toBe('10.128.0.1');
    // Con 255 en octeto intermedio.
    const s = calculateSubnet('172.16.255.14', 16);
    expect(s.networkAddress).toBe('172.16.0.0');
    expect(s.broadcastAddress).toBe('172.16.255.255');
    expect(s.ip).not.toBe(s.broadcastAddress);
  });

  it('una IP que ya es la red o el broadcast se calcula igual', () => {
    expect(calculateSubnet('192.168.1.128', 27).networkAddress).toBe('192.168.1.128');
    expect(calculateSubnet('192.168.1.159', 27).networkAddress).toBe('192.168.1.128');
  });

  it('la última red posible no tiene siguiente', () => {
    expect(calculateSubnet('255.255.255.254', 30).nextNetworkAddress).toBeNull();
  });
});

describe('calculateSubnet: clasificación', () => {
  it('detecta alcance y clase', () => {
    expect(calculateSubnet('10.1.1.1', 8).scope).toBe('Privada (RFC 1918)');
    expect(calculateSubnet('172.16.0.1', 12).scope).toBe('Privada (RFC 1918)');
    expect(calculateSubnet('172.31.255.1', 12).scope).toBe('Privada (RFC 1918)');
    expect(calculateSubnet('172.32.0.1', 12).scope).toBe('Pública');
    expect(calculateSubnet('192.168.1.1', 24).scope).toBe('Privada (RFC 1918)');
    expect(calculateSubnet('100.64.20.15', 10).scope).toBe('CGNAT (RFC 6598)');
    expect(calculateSubnet('100.128.0.1', 10).scope).toBe('Pública');
    expect(calculateSubnet('127.0.0.1', 8).scope).toBe('Loopback');
    expect(calculateSubnet('169.254.10.1', 16).scope).toBe('Link-Local');
    expect(calculateSubnet('224.0.0.5', 4).scope).toBe('Multicast');
    expect(calculateSubnet('250.0.0.1', 4).scope).toBe('Reservada (Clase E)');
    expect(calculateSubnet('8.8.8.8', 24).scope).toBe('Pública');
    expect(calculateSubnet('10.0.0.1', 8).ipClass).toBe('A');
    expect(calculateSubnet('172.16.0.1', 16).ipClass).toBe('B');
    expect(calculateSubnet('192.168.0.1', 24).ipClass).toBe('C');
    expect(calculateSubnet('224.0.0.1', 4).ipClass).toBe('D');
    expect(calculateSubnet('240.0.0.1', 4).ipClass).toBe('E');
  });
});

describe('prefixForHosts', () => {
  it('calcula el prefijo mínimo', () => {
    expect(prefixForHosts(1)).toBe(30);
    expect(prefixForHosts(2)).toBe(30);
    expect(prefixForHosts(3)).toBe(29);
    expect(prefixForHosts(6)).toBe(29);
    expect(prefixForHosts(7)).toBe(28);
    expect(prefixForHosts(20)).toBe(27);
    expect(prefixForHosts(30)).toBe(27);
    expect(prefixForHosts(31)).toBe(26);
    expect(prefixForHosts(50)).toBe(26);
    expect(prefixForHosts(100)).toBe(25);
    expect(prefixForHosts(126)).toBe(25);
    expect(prefixForHosts(127)).toBe(24);
    expect(prefixForHosts(254)).toBe(24);
    expect(prefixForHosts(255)).toBe(23);
  });

  it('permite /31 y /32 con la opción punto a punto', () => {
    expect(prefixForHosts(2, true)).toBe(31);
    expect(prefixForHosts(1, true)).toBe(32);
    expect(prefixForHosts(3, true)).toBe(29);
  });

  it('rechaza cantidades inválidas', () => {
    expect(() => prefixForHosts(0)).toThrow();
    expect(() => prefixForHosts(-5)).toThrow();
    expect(() => prefixForHosts(1.5)).toThrow();
  });
});

describe('calculateVLSM', () => {
  it('reparte 3 departamentos y 2 enlaces WAN en 192.168.1.0/24', () => {
    const result = calculateVLSM('192.168.1.0', 24, [
      { name: 'WAN-1', hosts: 2 },
      { name: 'TI', hosts: 50 },
      { name: 'Ventas', hosts: 100 },
      { name: 'WAN-2', hosts: 2 },
      { name: 'Gerencia', hosts: 20 },
    ]);

    expect(result.subnets.map((s) => s.name)).toEqual(['Ventas', 'TI', 'Gerencia', 'WAN-1', 'WAN-2']);

    const [ventas, ti, gerencia, wan1, wan2] = result.subnets;

    expect(ventas).toMatchObject({
      prefix: 25,
      maskDecimal: '255.255.255.128',
      networkAddress: '192.168.1.0',
      firstUsableIP: '192.168.1.1',
      lastUsableIP: '192.168.1.126',
      broadcastAddress: '192.168.1.127',
      hostsAvailable: 126,
      wastedHosts: 26,
    });
    expect(ti).toMatchObject({
      prefix: 26,
      networkAddress: '192.168.1.128',
      lastUsableIP: '192.168.1.190',
      broadcastAddress: '192.168.1.191',
      hostsAvailable: 62,
      wastedHosts: 12,
    });
    expect(gerencia).toMatchObject({
      prefix: 27,
      networkAddress: '192.168.1.192',
      broadcastAddress: '192.168.1.223',
      hostsAvailable: 30,
      wastedHosts: 10,
    });
    expect(wan1).toMatchObject({
      prefix: 30,
      networkAddress: '192.168.1.224',
      firstUsableIP: '192.168.1.225',
      lastUsableIP: '192.168.1.226',
      broadcastAddress: '192.168.1.227',
      wastedHosts: 0,
    });
    expect(wan2).toMatchObject({
      prefix: 30,
      networkAddress: '192.168.1.228',
      broadcastAddress: '192.168.1.231',
      wastedHosts: 0,
    });

    expect(result.summary).toMatchObject({
      baseNetwork: '192.168.1.0/24',
      baseTotalIPs: 256,
      allocatedIPs: 232,
      freeIPs: 24,
      wastedHosts: 48,
      nextFreeAddress: '192.168.1.232',
    });
  });

  it('normaliza una IP base que no es la dirección de red', () => {
    const result = calculateVLSM('192.168.1.77', 24, [{ name: 'A', hosts: 10 }]);
    expect(result.subnets[0].networkAddress).toBe('192.168.1.0');
  });

  it('las subredes no se solapan y están dentro de la red base', () => {
    const result = calculateVLSM('10.0.0.0', 16, [
      { name: 'A', hosts: 1000 },
      { name: 'B', hosts: 500 },
      { name: 'C', hosts: 300 },
      { name: 'D', hosts: 60 },
      { name: 'E', hosts: 2 },
    ]);
    let prevEnd = -1;
    for (const s of result.subnets) {
      const start = ipToLong(s.networkAddress);
      const end = ipToLong(s.broadcastAddress);
      expect(start).toBeGreaterThan(prevEnd);
      expect(start).toBeGreaterThanOrEqual(ipToLong('10.0.0.0'));
      expect(end).toBeLessThanOrEqual(ipToLong('10.0.255.255'));
      // Cada bloque está alineado a su tamaño.
      expect(start % s.totalIPs).toBe(0);
      prevEnd = end;
    }
  });

  it('usa /31 para enlaces punto a punto si se habilita', () => {
    const result = calculateVLSM(
      '10.0.0.0',
      29,
      [
        { name: 'L1', hosts: 2 },
        { name: 'L2', hosts: 2 },
      ],
      { allowPointToPoint31: true },
    );
    expect(result.subnets[0]).toMatchObject({ prefix: 31, networkAddress: '10.0.0.0', broadcastAddress: '10.0.0.1' });
    expect(result.subnets[1]).toMatchObject({ prefix: 31, networkAddress: '10.0.0.2' });
  });

  it('llena exactamente la red base sin sobrante', () => {
    const result = calculateVLSM('192.168.0.0', 24, [
      { name: 'A', hosts: 126 },
      { name: 'B', hosts: 62 },
      { name: 'C', hosts: 30 },
      { name: 'D', hosts: 14 },
      { name: 'E', hosts: 6 },
      { name: 'F', hosts: 2 },
      { name: 'G', hosts: 2 },
    ]);
    // 128 + 64 + 32 + 16 + 8 + 4 + 4 = 256: la red queda 100% asignada.
    expect(result.summary.allocatedIPs).toBe(256);
    expect(result.summary.freeIPs).toBe(0);
    expect(result.summary.nextFreeAddress).toBeNull();
    expect(result.subnets[6].broadcastAddress).toBe('192.168.0.255');
  });

  it('lanza error si no caben', () => {
    expect(() =>
      calculateVLSM('192.168.1.0', 24, [
        { name: 'A', hosts: 100 },
        { name: 'B', hosts: 100 },
        { name: 'C', hosts: 100 },
      ]),
    ).toThrow(/No hay espacio/);
  });

  it('lanza error si un requerimiento es más grande que la red base', () => {
    expect(() => calculateVLSM('192.168.1.0', 24, [{ name: 'Gigante', hosts: 1000 }])).toThrow(/más grande/);
  });

  it('lanza error sin requerimientos o con datos inválidos', () => {
    expect(() => calculateVLSM('192.168.1.0', 24, [])).toThrow();
    expect(() => calculateVLSM('192.168.1.0', 33, [{ name: 'A', hosts: 1 }])).toThrow();
    expect(() => calculateVLSM('192.168.1.0', 24, [{ name: 'A', hosts: 0 }])).toThrow();
  });
});
