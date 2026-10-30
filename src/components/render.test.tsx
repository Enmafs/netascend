import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { calculateSubnet } from '../lib/net/ipv4';
import { BoxVisualizer } from './visualizer/BoxVisualizer';
import { StepByStep } from './calculator/StepByStep';
import { ConverterTab } from './calculator/ConverterTab';
import { FLSMTab } from './calculator/FLSMTab';
import { IPv6Tab } from './calculator/IPv6Tab';
import { SubnetTab } from './calculator/SubnetTab';
import { SummarizationTab } from './calculator/SummarizationTab';
import { VLSMTab } from './calculator/VLSMTab';
import { Navbar } from './Navbar';
import App from '../App';
import { CertificateCanvas } from '../features/exam/CertificateCanvas';
import { ExamContainer } from '../features/exam/ExamContainer';
import { RankBadge } from '../features/gamification/RankBadge';
import { ModuleDetailView } from '../features/modules/ModuleDetailView';
import { ModuleInteractivePractice } from '../features/modules/components/ModuleInteractivePractice';

const BAD = /NaN|undefined|\[object/;

describe('render smoke tests', () => {
  it('cada pestaña se renderiza con sus valores por defecto', () => {
    const tabs = { SubnetTab, FLSMTab, VLSMTab, SummarizationTab, IPv6Tab, ConverterTab };
    for (const [name, Tab] of Object.entries(tabs)) {
      const html = renderToString(<Tab />);
      expect(html.length, name).toBeGreaterThan(200);
      expect(html, name).not.toMatch(BAD);
      expect(html, name).not.toMatch(/role="alert"/);
    }
  });

  it('muestra los resultados por defecto correctos', () => {
    const subnet = renderToString(<SubnetTab />);
    expect(subnet).toContain('192.168.1.128');
    expect(subnet).toContain('192.168.1.159');
    expect(subnet).toContain('192.168.1.160');
    expect(renderToString(<SummarizationTab />)).toContain('192.168.0.0/22');
    expect(renderToString(<VLSMTab />)).toContain('192.168.1.232');
    expect(renderToString(<IPv6Tab />)).toContain('2803:1920:abcd:1200::/56');
    expect(renderToString(<ConverterTab />)).toContain('0xC0A80101');
    expect(renderToString(<FLSMTab />)).toContain('192.168.1.192');
  });

  it('la app completa incluye la navegación con las 6 herramientas', () => {
    const html = renderToString(<App />);
    for (const label of ['Subred IPv4', 'Subnetting FLSM', 'VLSM', 'Sumarización', 'IPv6', 'Conversor']) {
      expect(html).toContain(label);
    }
    expect(renderToString(<Navbar active="vlsm" onChange={() => {}} />)).toContain('v1.0');
  });

  it('el paso a paso y el visualizador funcionan para los 33 prefijos', () => {
    const ips = ['192.168.1.140', '10.145.200.89', '185.120.45.19', '172.16.255.254', '0.0.0.0', '255.255.255.255'];
    for (const ip of ips) {
      for (let prefix = 0; prefix <= 32; prefix++) {
        const r = calculateSubnet(ip, prefix);
        const steps = renderToString(<StepByStep result={r} />);
        expect(steps, `${ip}/${prefix}`).not.toMatch(BAD);
        const box = renderToString(
          <BoxVisualizer ip={r.ip} prefix={prefix} network={r.networkAddress} salto={r.salto} workingOctet={r.workingOctet} />,
        );
        expect(box, `${ip}/${prefix}`).not.toMatch(BAD);
        expect(box).toContain(r.broadcastAddress);
      }
    }
  });

  it('el visualizador resalta una sola caja actual', () => {
    const r = calculateSubnet('192.168.1.140', 27);
    const html = renderToString(
      <BoxVisualizer ip={r.ip} prefix={27} network={r.networkAddress} salto={r.salto} workingOctet={r.workingOctet} />,
    ).replace(/<!-- -->/g, ''); // React SSR separa nodos de texto con comentarios
    expect(html.match(/shadow-\[0_0_22px/g)?.length).toBe(1);
    expect(html).toContain('Caja 5');
    expect(html).toContain('128–159');
    expect(html).toContain('IP .140');
  });

  it('renderiza todos los módulos (1 al 10) y sus laboratorios interactivos sin errores', () => {
    const widgetTypes = [
      'bit-switches',
      'special-ranges',
      'cidr-slider',
      'box-4th',
      'floors-3rd',
      'architect-octets',
      'flsm-sim',
      'vlsm-sim',
      'summarize-sim',
      'ipv6-nibbles',
    ];
    for (const type of widgetTypes) {
      const html = renderToString(<ModuleInteractivePractice type={type} />);
      expect(html.length, type).toBeGreaterThan(100);
      expect(html, type).not.toMatch(BAD);
    }

    for (let id = 1; id <= 10; id++) {
      const html = renderToString(<ModuleDetailView moduleId={id} onBack={() => {}} />);
      expect(html.length, `Module ${id}`).toBeGreaterThan(200);
      expect(html, `Module ${id}`).not.toMatch(BAD);
    }
  });

  it('renderiza el Examen Final, el Certificado Oficial y las insignias de rango', () => {
    const certHtml = renderToString(
      <CertificateCanvas
        studentName="Enmanuel Rodríguez"
        score={96}
        correctCount={24}
        totalQuestions={25}
        verificationCode="NA-CCNA-89F2A"
        issueDate="30 oct 2026"
        rank="Arquitecto"
      />
    );
    expect(certHtml).toContain('CERTIFICADO DE EXCELENCIA TÉCNICA');
    expect(certHtml).toContain('Enmanuel Rodríguez');
    expect(certHtml).toContain('NA-CCNA-89F2A');
    expect(certHtml).not.toMatch(BAD);

    const examHtml = renderToString(<ExamContainer initialTimed={true} onExit={() => {}} />);
    expect(examHtml).toContain('Mapa de Navegación Rápida');
    expect(examHtml).not.toMatch(BAD);

    const badgeHtml = renderToString(<RankBadge rank="CCIE Mode" xp={3500} showProgress />);
    expect(badgeHtml).toContain('CCIE Mode');
    expect(badgeHtml).not.toMatch(BAD);
  });
});
