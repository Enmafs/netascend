import { describe, expect, it } from 'vitest';
import { evaluateAnswer, normalizeAnswer, compareMasks } from '../evaluator';
import { generateQuiz, generateCertificationExam, EXAM_CATEGORIES } from '../generator';
import { detectTrap } from '../traps';
import { calculateSubnet } from '../../net/ipv4';
import { generateVerificationCode, formatCertificateFilename } from '../../certificate';
import { calculateRank } from '../../../state/ProgressContext';
import type { Question, FullPacketAnswer } from '../types';

describe('normalizeAnswer', () => {
  it('elimina espacios y normaliza comas en números', () => {
    expect(normalizeAnswer('  192.168.1.1  ')).toBe('192.168.1.1');
    expect(normalizeAnswer('16,384')).toBe('16384');
    expect(normalizeAnswer('67,108,864')).toBe('67108864');
    expect(normalizeAnswer('  ABC  ')).toBe('abc');
  });
});

describe('compareMasks', () => {
  it('compara prefijos y máscaras decimales de forma intercambiable', () => {
    expect(compareMasks('/27', '255.255.255.224')).toBe(true);
    expect(compareMasks('27', '255.255.255.224')).toBe(true);
    expect(compareMasks('255.255.255.224', '/27')).toBe(true);
    expect(compareMasks('/24', '255.255.255.0')).toBe(true);
    expect(compareMasks('/24', '/25')).toBe(false);
  });
});

describe('detectTrap', () => {
  const sub = calculateSubnet('192.168.1.75', 27); // Red: 192.168.1.64, Salto: 32

  it('detecta cuando el alumno pone la IP de host como red', () => {
    const trap = detectTrap('192.168.1.75', 'network', sub);
    expect(trap?.isTrap).toBe(true);
    expect(trap?.trapType).toBe('host-as-network');
    expect(trap?.message).toMatch(/IP del equipo/);
  });

  it('detecta arrastre de octetos de host en red', () => {
    const sub3 = calculateSubnet('172.16.67.85', 22); // Red: 172.16.64.0
    const trap = detectTrap('172.16.64.85', 'network', sub3);
    expect(trap?.isTrap).toBe(true);
    expect(trap?.trapType).toBe('drag-host-octets');
  });

  it('detecta confusión entre salto y cantidad de ceros', () => {
    const sub19 = calculateSubnet('172.20.105.77', 19); // Salto: 32, ceros: 13
    const trap = detectTrap('13', 'salto', sub19);
    expect(trap?.isTrap).toBe(true);
    expect(trap?.trapType).toBe('salto-vs-exponent');
  });

  it('detecta olvido de restar 2 a los hosts útiles', () => {
    const trap = detectTrap('32', 'usableHosts', sub); // total 32, útiles 30
    expect(trap?.isTrap).toBe(true);
    expect(trap?.trapType).toBe('missed-minus-two');
  });
});

describe('evaluateAnswer', () => {
  it('evalúa una pregunta de respuesta abierta tolerando espacios y formatos', () => {
    const q: Question = {
      id: 'test-1',
      type: 'open-input',
      moduleId: 4,
      difficulty: 'medium',
      title: 'Red',
      prompt: '¿Cuál es la red?',
      expectedAnswer: '192.168.1.64',
      explanation: 'Explicación',
    };
    const eval1 = evaluateAnswer(q, '  192.168.1.64  ');
    expect(eval1.isCorrect).toBe(true);
    expect(eval1.scoreRatio).toBe(1);

    const eval2 = evaluateAnswer(q, '192.168.1.100');
    expect(eval2.isCorrect).toBe(false);
  });

  it('evalúa una pregunta de paquete completo (7 campos)', () => {
    const sub = calculateSubnet('192.168.1.140', 27);
    const q: Question = {
      id: 'test-full',
      type: 'full-packet',
      moduleId: 4,
      difficulty: 'medium',
      title: 'Paquete Completo',
      prompt: 'Calcula el paquete completo:',
      subnetData: sub,
      explanation: 'Explicación',
    };

    const goodAnswer: FullPacketAnswer = {
      maskDecimal: '255.255.255.224',
      salto: '32',
      workingOctet: '4',
      networkAddress: '192.168.1.128',
      firstUsableIP: '192.168.1.129',
      lastUsableIP: '192.168.1.158',
      broadcastAddress: '192.168.1.159',
    };

    const evalGood = evaluateAnswer(q, goodAnswer);
    expect(evalGood.isCorrect).toBe(true);
    expect(evalGood.scoreRatio).toBe(1);

    const partialAnswer: FullPacketAnswer = {
      ...goodAnswer,
      networkAddress: '192.168.1.140', // trampa: host as network
    };
    const evalPartial = evaluateAnswer(q, partialAnswer);
    expect(evalPartial.isCorrect).toBe(false);
    expect(evalPartial.scoreRatio).toBeCloseTo(6 / 7, 2);
    expect(evalPartial.trap?.trapType).toBe('host-as-network');
  });

  it('evalúa preguntas de tipo booleanas (same-network y true-false)', () => {
    const q: Question = {
      id: 'test-tf',
      type: 'true-false',
      moduleId: 1,
      difficulty: 'easy',
      title: 'VF',
      prompt: '¿Es verdad?',
      expectedAnswer: true,
      explanation: 'Sí',
    };
    expect(evaluateAnswer(q, true).isCorrect).toBe(true);
    expect(evaluateAnswer(q, false).isCorrect).toBe(false);
  });
});

describe('generateQuiz', () => {
  it('genera preguntas para cada módulo del 1 al 10', () => {
    for (let m = 1; m <= 10; m++) {
      const quiz = generateQuiz(m, 'medium', 5);
      expect(quiz.length).toBeGreaterThanOrEqual(2);
      expect(quiz[0].moduleId).toBe(m);
      expect(quiz[0].prompt).toBeTruthy();
      expect(quiz[0].explanation).toBeTruthy();
    }
  });

  it('genera preguntas con estructura y opciones válidas en multiple-choice', () => {
    const quiz = generateQuiz(2, 'medium', 6);
    const mc = quiz.find((q) => q.type === 'multiple-choice');
    if (mc) {
      expect(mc.options).toBeDefined();
      expect(mc.options!.length).toBeGreaterThanOrEqual(3);
      expect(mc.options).toContain(mc.expectedAnswer);
    }
  });

  it('genera el Examen Final de Certificación con 25 preguntas balanceadas (5 por categoría)', () => {
    const exam = generateCertificationExam();
    expect(exam).toHaveLength(25);

    for (const cat of EXAM_CATEGORIES) {
      const catQuestions = exam.filter((q) => cat.moduleIds.includes(q.moduleId));
      expect(catQuestions).toHaveLength(5);
    }
  });
});

describe('Certificado y Rangos de Gamificación (Fase 5)', () => {
  it('genera códigos de verificación con formato NA-CCNA-XXXXX', () => {
    const code1 = generateVerificationCode();
    const code2 = generateVerificationCode();
    expect(code1).toMatch(/^NA-CCNA-[A-Z0-9]{5}$/);
    expect(code2).toMatch(/^NA-CCNA-[A-Z0-9]{5}$/);
  });

  it('normaliza el nombre del estudiante para el archivo PNG descargable', () => {
    expect(formatCertificateFilename('Ing. Enmanuel Rodríguez')).toBe(
      'Certificado_NetAscend_Ing_Enmanuel_Rodriguez.png'
    );
    expect(formatCertificateFilename('   ')).toBe(
      'Certificado_NetAscend_Estudiante.png'
    );
  });

  it('asigna los rangos correctamente según los umbrales de XP', () => {
    expect(calculateRank(0)).toBe('Novato');
    expect(calculateRank(250)).toBe('Novato');
    expect(calculateRank(251)).toBe('Técnico');
    expect(calculateRank(600)).toBe('Técnico');
    expect(calculateRank(601)).toBe('Analista');
    expect(calculateRank(1201)).toBe('Ingeniero');
    expect(calculateRank(2001)).toBe('Arquitecto');
    expect(calculateRank(3001)).toBe('CCIE Mode');
  });
});
