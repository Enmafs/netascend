import type { EvaluationResult, FullPacketAnswer, Question } from './types';
import { detectTrap } from './traps';
import { parsePrefixOrMask } from '../net/parse';

/**
 * Normaliza una cadena de texto para comparación tolerante:
 * - Quita espacios en blanco en extremos
 * - Minúsculas
 * - Quita comas y puntos separadores de miles en números (ej. "16,384" -> "16384")
 */
export function normalizeAnswer(str: string): string {
  if (typeof str !== 'string') return String(str ?? '');
  let val = str.trim().toLowerCase();
  
  // Si es un número con comas separadoras de miles (ej: 16,384 o 67,108,864), quitamos las comas
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(val)) {
    val = val.replace(/,/g, '');
  }

  // Quitar ceros a la izquierda innecesarios en números simples
  if (/^0\d+$/.test(val)) {
    val = String(Number(val));
  }

  return val;
}

/**
 * Compara dos valores de máscara (acepta /27, 27 o 255.255.255.224)
 */
export function compareMasks(input: string, expected: string): boolean {
  try {
    const pInput = parsePrefixOrMask(input);
    const pExpected = parsePrefixOrMask(expected);
    return pInput === pExpected;
  } catch {
    return normalizeAnswer(input) === normalizeAnswer(expected);
  }
}

/**
 * Evalúa una respuesta contra una pregunta cualquiera con tolerancia de formato
 * y detección de errores conceptuales.
 */
export function evaluateAnswer(question: Question, userAnswer: any): EvaluationResult {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
    return {
      isCorrect: false,
      scoreRatio: 0,
      userAnswer,
      expectedAnswer: question.expectedAnswer ?? question.targetValue,
      feedbackMessage: 'No se ingresó ninguna respuesta.',
    };
  }

  // 1. Preguntas tipo "Paquete Completo" (7 campos)
  if (question.type === 'full-packet' && question.subnetData) {
    const user = (userAnswer as FullPacketAnswer) || {};
    const sub = question.subnetData;
    let correctFields = 0;
    const totalFields = 7;
    const fieldErrors: string[] = [];
    let detectedTrap = undefined;

    // Campo: Máscara
    if (compareMasks(user.maskDecimal ?? '', sub.maskDecimal)) {
      correctFields++;
    } else {
      fieldErrors.push('Máscara');
    }

    // Campo: Salto
    if (normalizeAnswer(user.salto ?? '') === String(sub.salto)) {
      correctFields++;
    } else {
      fieldErrors.push('Salto');
      if (!detectedTrap) detectedTrap = detectTrap(user.salto ?? '', 'salto', sub);
    }

    // Campo: Octeto de Trabajo
    if (normalizeAnswer(user.workingOctet ?? '') === String(sub.workingOctet)) {
      correctFields++;
    } else {
      fieldErrors.push('Octeto de Trabajo');
    }

    // Campo: Dirección de Red
    if (normalizeAnswer(user.networkAddress ?? '') === sub.networkAddress) {
      correctFields++;
    } else {
      fieldErrors.push('Dirección de Red');
      if (!detectedTrap) detectedTrap = detectTrap(user.networkAddress ?? '', 'network', sub);
    }

    // Campo: Primera IP Útil
    if (normalizeAnswer(user.firstUsableIP ?? '') === sub.firstUsableIP) {
      correctFields++;
    } else {
      fieldErrors.push('Primera IP Útil');
      if (!detectedTrap) detectedTrap = detectTrap(user.firstUsableIP ?? '', 'firstUsable', sub);
    }

    // Campo: Última IP Útil
    if (normalizeAnswer(user.lastUsableIP ?? '') === sub.lastUsableIP) {
      correctFields++;
    } else {
      fieldErrors.push('Última IP Útil');
      if (!detectedTrap) detectedTrap = detectTrap(user.lastUsableIP ?? '', 'lastUsable', sub);
    }

    // Campo: Broadcast
    if (normalizeAnswer(user.broadcastAddress ?? '') === sub.broadcastAddress) {
      correctFields++;
    } else {
      fieldErrors.push('Broadcast');
      if (!detectedTrap) detectedTrap = detectTrap(user.broadcastAddress ?? '', 'broadcast', sub);
    }

    const ratio = correctFields / totalFields;
    const isCorrect = ratio === 1;

    let msg = isCorrect
      ? '¡Perfecto! Has calculado con exactitud todos los parámetros del paquete.'
      : `Acertaste ${correctFields} de ${totalFields} campos. Revisa: ${fieldErrors.join(', ')}.`;

    if (detectedTrap) {
      msg = `${detectedTrap.message} (${msg})`;
    }

    return {
      isCorrect,
      scoreRatio: ratio,
      userAnswer,
      expectedAnswer: {
        maskDecimal: sub.maskDecimal,
        salto: String(sub.salto),
        workingOctet: String(sub.workingOctet),
        networkAddress: sub.networkAddress,
        firstUsableIP: sub.firstUsableIP,
        lastUsableIP: sub.lastUsableIP,
        broadcastAddress: sub.broadcastAddress,
      },
      feedbackMessage: msg,
      trap: detectedTrap,
    };
  }

  // 2. Preguntas de Emparejamiento
  if (question.type === 'matching') {
    const userPairs = (userAnswer as Record<string, string>) || {};
    const expectedPairs = (question.expectedAnswer as Record<string, string>) || {};
    const keys = Object.keys(expectedPairs);
    if (keys.length === 0) return { isCorrect: true, scoreRatio: 1, userAnswer, expectedAnswer: expectedPairs, feedbackMessage: 'Correcto' };

    let matches = 0;
    for (const key of keys) {
      if (normalizeAnswer(userPairs[key] ?? '') === normalizeAnswer(expectedPairs[key] ?? '')) {
        matches++;
      }
    }
    const ratio = matches / keys.length;
    const isCorrect = ratio === 1;
    return {
      isCorrect,
      scoreRatio: ratio,
      userAnswer,
      expectedAnswer: expectedPairs,
      feedbackMessage: isCorrect
        ? '¡Excelente! Todos los pares fueron emparejados correctamente.'
        : `Emparejaste correctamente ${matches} de ${keys.length} elementos.`,
    };
  }

  // 3. Verdadero o Falso & Misma Red (Booleanos)
  if (question.type === 'true-false' || question.type === 'same-network') {
    const expected = Boolean(question.expectedAnswer);
    const userBool = typeof userAnswer === 'boolean' ? userAnswer : userAnswer === 'true';
    const isCorrect = userBool === expected;
    return {
      isCorrect,
      scoreRatio: isCorrect ? 1 : 0,
      userAnswer: userBool,
      expectedAnswer: expected,
      feedbackMessage: isCorrect
        ? '¡Correcto! Has interpretado el concepto de red a la perfección.'
        : 'Incorrecto. Revisa la fundamentación teórica de este caso.',
    };
  }

  // 4. Preguntas de Entrada Abierta, Opción Múltiple o Binario
  const expectedRaw = String(question.expectedAnswer ?? question.targetValue ?? '');
  const userRaw = String(userAnswer ?? '');

  const normUser = normalizeAnswer(userRaw);
  const normExpected = normalizeAnswer(expectedRaw);

  // Verificación de máscara si aplica
  let isCorrect = normUser === normExpected;
  if (!isCorrect && (normExpected.startsWith('/') || normExpected.includes('.'))) {
    isCorrect = compareMasks(userRaw, expectedRaw);
  }

  // Detección de trampas si tenemos datos de subred asociados
  let trap: any = undefined;
  if (!isCorrect && question.subnetData) {
    trap = detectTrap(userRaw, 'network', question.subnetData) ||
           detectTrap(userRaw, 'broadcast', question.subnetData) ||
           detectTrap(userRaw, 'salto', question.subnetData) ||
           detectTrap(userRaw, 'usableHosts', question.subnetData);
  }

  let feedbackMessage = isCorrect
    ? '¡Excelente respuesta!'
    : `Respuesta incorrecta. El valor esperado era: ${expectedRaw}.`;

  if (trap) {
    feedbackMessage = `${trap.message} (Esperado: ${expectedRaw})`;
  }

  return {
    isCorrect,
    scoreRatio: isCorrect ? 1 : 0,
    userAnswer,
    expectedAnswer: expectedRaw,
    feedbackMessage,
    trap,
  };
}
