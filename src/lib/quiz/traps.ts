import type { TrapDetection } from './types';
import type { IPv4SubnetResult } from '../net/types';

/**
 * Analiza la respuesta errónea del estudiante frente al cálculo real de subred
 * para diagnosticar la trampa mental específica que cometió.
 */
export function detectTrap(
  userAnswer: string,
  field: 'network' | 'broadcast' | 'salto' | 'usableHosts' | 'firstUsable' | 'lastUsable' | 'mask',
  subnetData?: IPv4SubnetResult
): TrapDetection | undefined {
  if (!subnetData) return undefined;

  const cleanAns = userAnswer.trim();
  const { ip, networkAddress, broadcastAddress, prefix, salto, workingOctet } = subnetData;

  // 1. Puso la IP del host como si fuera la dirección de red
  if (field === 'network' && cleanAns === ip && ip !== networkAddress) {
    return {
      isTrap: true,
      trapType: 'host-as-network',
      message: '¡Cuidado! Pusiste la IP del equipo, no la dirección de red. Busca en cuál caja de múltiplos del salto cae.',
    };
  }

  // 2. Arrastró octetos de host en la red o broadcast
  if (field === 'network' || field === 'broadcast') {
    const userParts = cleanAns.split('.');
    const ipParts = ip.split('.');
    const netParts = networkAddress.split('.');

    if (userParts.length === 4 && ipParts.length === 4) {
      // Si el octeto de trabajo está bien pero los siguientes octetos tienen los números de la IP original
      const idx = workingOctet - 1;
      let hasDragged = false;
      for (let i = idx + 1; i < 4; i++) {
        if (userParts[i] === ipParts[i] && userParts[i] !== (field === 'network' ? '0' : '255')) {
          hasDragged = true;
          break;
        }
      }
      if (hasDragged && userParts[idx] === netParts[idx]) {
        return {
          isTrap: true,
          trapType: 'drag-host-octets',
          message: `En la ${field === 'network' ? 'red' : 'broadcast'}, todos los octetos a la derecha del octeto de trabajo deben ser ${field === 'network' ? '0' : '255'}. ¡No arrastres los números de la IP original!`,
        };
      }
    }
  }

  // 3. Confundió salto con exponente / cantidad de ceros
  if (field === 'salto') {
    const hostZeros = 32 - prefix;
    if (cleanAns === String(hostZeros) && salto !== hostZeros) {
      return {
        isTrap: true,
        trapType: 'salto-vs-exponent',
        message: `Confundiste el Salto con la cantidad de ceros (${hostZeros}). Recuerda: Salto = 256 − Máscara del octeto de trabajo.`,
      };
    }
  }

  // 4. Olvidó restar 2 para hosts útiles
  if (field === 'usableHosts') {
    const totalIPs = Math.pow(2, 32 - prefix);
    if (cleanAns === String(totalIPs) || cleanAns === totalIPs.toLocaleString('es')) {
      return {
        isTrap: true,
        trapType: 'missed-minus-two',
        message: '¡Casi! Olvidaste restar 2 para los hosts útiles: 1 para la Red y 1 para el Broadcast.',
      };
    }
  }

  // 5. Error de ±1 en primera o última IP útil
  if (field === 'firstUsable' && cleanAns === networkAddress) {
    return {
      isTrap: true,
      trapType: 'off-by-one',
      message: 'Esa es la dirección de red. La primera IP útil es Red + 1.',
    };
  }
  if (field === 'lastUsable' && cleanAns === broadcastAddress) {
    return {
      isTrap: true,
      trapType: 'off-by-one',
      message: 'Esa es la dirección de broadcast. La última IP útil es Broadcast − 1.',
    };
  }

  return undefined;
}

/**
 * Genera distractores creíbles basados en errores comunes reales de estudiantes.
 */
export function generateCalculatedDistractors(
  correctAnswer: string | number,
  category: 'network' | 'salto' | 'usableHosts' | 'prefix' | 'binary' | 'generic',
  subnetData?: IPv4SubnetResult
): string[] {
  const correctStr = String(correctAnswer);
  const distractors = new Set<string>();

  if (subnetData && category === 'network') {
    // Distractor 1: La IP del host
    if (subnetData.ip !== correctStr) distractors.add(subnetData.ip);

    // Distractor 2: Arrastrando el host al final
    const parts = subnetData.networkAddress.split('.');
    const ipParts = subnetData.ip.split('.');
    for (let i = subnetData.workingOctet; i < 4; i++) {
      parts[i] = ipParts[i];
    }
    const dragged = parts.join('.');
    if (dragged !== correctStr) distractors.add(dragged);

    // Distractor 3: Caja anterior o siguiente
    const netParts = subnetData.networkAddress.split('.').map(Number);
    const idx = subnetData.workingOctet - 1;
    if (netParts[idx] >= subnetData.salto) {
      const prev = [...netParts];
      prev[idx] -= subnetData.salto;
      distractors.add(prev.join('.'));
    }
    if (netParts[idx] + subnetData.salto <= 255) {
      const next = [...netParts];
      next[idx] += subnetData.salto;
      distractors.add(next.join('.'));
    }
  }

  if (subnetData && category === 'salto') {
    const hostZeros = 32 - subnetData.prefix;
    distractors.add(String(hostZeros));
    distractors.add(String(subnetData.salto / 2 || 2));
    distractors.add(String(subnetData.salto * 2 <= 256 ? subnetData.salto * 2 : 16));
  }

  if (subnetData && category === 'usableHosts') {
    const total = subnetData.totalIPs;
    distractors.add(String(total)); // Olvidó -2
    distractors.add(String(total - 1)); // Olvidó -1
    distractors.add(String(total - 4));
  }

  // Si aún faltan distractores, generar variaciones numéricas lógicas
  if (typeof correctAnswer === 'number') {
    distractors.add(String(correctAnswer + 1));
    distractors.add(String(Math.max(0, correctAnswer - 1)));
    distractors.add(String(correctAnswer * 2));
  }

  // Filtrar la correcta y tomar máximo 3 distractores
  distractors.delete(correctStr);
  const result = Array.from(distractors).slice(0, 3);

  // Asegurar mínimo 3 opciones alternativas
  let fallbackVal = 1;
  while (result.length < 3) {
    const fallback = `${correctStr}-${fallbackVal++}`;
    if (!result.includes(fallback)) result.push(fallback);
  }

  return result;
}
