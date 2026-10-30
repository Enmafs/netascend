import { describe, expect, it } from 'vitest';
import { summarizeRoutes } from '../summarization';

describe('summarizeRoutes', () => {
  it('resume cuatro /24 consecutivas en un /22 exacto', () => {
    const r = summarizeRoutes(['192.168.0.0/24', '192.168.1.0/24', '192.168.2.0/24', '192.168.3.0/24']);
    expect(r.summaryRoute).toBe('192.168.0.0/22');
    expect(r.summaryPrefix).toBe(22);
    expect(r.summaryNetwork).toBe('192.168.0.0');
    expect(r.includesExtra).toBe(false);
    expect(r.extraIPs).toBe(0);
    expect(r.summaryTotalIPs).toBe(1024);
    expect(r.inputTotalIPs).toBe(1024);
    expect(r.coveredRoutes).toEqual([
      '192.168.0.0/24',
      '192.168.1.0/24',
      '192.168.2.0/24',
      '192.168.3.0/24',
    ]);
  });

  it('avisa cuando la superred cubre redes que no estaban en la lista', () => {
    const r = summarizeRoutes(['192.168.0.0/24', '192.168.2.0/24']);
    expect(r.summaryRoute).toBe('192.168.0.0/22');
    expect(r.includesExtra).toBe(true);
    expect(r.extraIPs).toBe(512);
  });

  it('resume dos /16 no alineadas en un /14', () => {
    const r = summarizeRoutes(['10.1.0.0/16', '10.2.0.0/16']);
    expect(r.summaryRoute).toBe('10.0.0.0/14');
    expect(r.extraIPs).toBe(2 * 65536);
  });

  it('una sola red se resume a sí misma', () => {
    const r = summarizeRoutes(['172.16.5.0/24']);
    expect(r.summaryRoute).toBe('172.16.5.0/24');
    expect(r.includesExtra).toBe(false);
  });

  it('normaliza IPs de host a su dirección de red', () => {
    const r = summarizeRoutes(['192.168.1.77/24']);
    expect(r.summaryRoute).toBe('192.168.1.0/24');
    expect(r.coveredRoutes).toEqual(['192.168.1.0/24']);
  });

  it('maneja redes solapadas y duplicadas sin contar IPs dos veces', () => {
    const r = summarizeRoutes(['10.0.0.0/8', '10.1.0.0/16', '10.0.0.0/8']);
    expect(r.summaryRoute).toBe('10.0.0.0/8');
    expect(r.inputTotalIPs).toBe(16777216);
    expect(r.includesExtra).toBe(false);
    expect(r.coveredRoutes).toEqual(['10.0.0.0/8', '10.1.0.0/16']);
  });

  it('dos mitades de internet se resumen en 0.0.0.0/0', () => {
    const r = summarizeRoutes(['0.0.0.0/1', '128.0.0.0/1']);
    expect(r.summaryRoute).toBe('0.0.0.0/0');
    expect(r.includesExtra).toBe(false);
  });

  it('ignora líneas vacías y espacios', () => {
    const r = summarizeRoutes(['  192.168.0.0/24 ', '', '   ', '192.168.1.0/24']);
    expect(r.summaryRoute).toBe('192.168.0.0/23');
  });

  it('devuelve error con lista vacía', () => {
    const r = summarizeRoutes(['', '  ']);
    expect(r.summaryRoute).toBeNull();
    expect(r.error).toBeTruthy();
  });

  it('indica la línea con el error', () => {
    const r = summarizeRoutes(['192.168.0.0/24', 'esto-no-es-una-red']);
    expect(r.summaryRoute).toBeNull();
    expect(r.error).toMatch(/Línea 2/);
    expect(summarizeRoutes(['10.0.0.0/33']).error).toMatch(/Línea 1/);
    expect(summarizeRoutes(['300.0.0.0/24']).error).toMatch(/Línea 1/);
  });
});
