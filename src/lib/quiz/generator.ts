import type { Question } from './types';
import { calculateSubnet } from '../net/ipv4';
import { compressIPv6 } from '../net/ipv6';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

let qCounter = 1;
function genId(prefix = 'q'): string {
  return `${prefix}-${Date.now().toString(36)}-${qCounter++}`;
}

export function generateQuiz(
  moduleId: number,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 6
): Question[] {
  const generators: Array<() => Question> = [];

  switch (moduleId) {
    case 1: { // Módulo 1: Fundamentos binarios
      generators.push(
        () => { // Decimal a Binario
          const num = randInt(1, 255);
          const bin = num.toString(2).padStart(8, '0');
          return {
            id: genId('m1-bin'),
            type: 'binary',
            moduleId: 1,
            difficulty,
            title: 'Conversión Decimal a Binario',
            prompt: `Convierte el número decimal ${num} a su representación binaria de 8 bits.`,
            targetValue: bin,
            expectedAnswer: bin,
            explanation: `Descomponiendo en potencias de 2 (128, 64, 32, 16, 8, 4, 2, 1), ${num} = ${bin}.`,
          };
        },
        () => { // Binario a Decimal
          const num = randInt(1, 255);
          const bin = num.toString(2).padStart(8, '0');
          return {
            id: genId('m1-dec'),
            type: 'open-input',
            moduleId: 1,
            difficulty,
            title: 'Conversión Binaria a Decimal',
            prompt: `¿Cuál es el valor decimal del byte binario ${bin}?`,
            targetValue: String(num),
            expectedAnswer: String(num),
            explanation: `Sumando las posiciones encendidas de ${bin} obtenemos ${num}.`,
          };
        },
        () => { // Potencias de 2
          const exp = randInt(4, 12);
          const val = Math.pow(2, exp);
          const distractors = [String(val / 2), String(val * 2), String(val - 2)];
          const options = shuffle([String(val), ...distractors]);
          return {
            id: genId('m1-pow'),
            type: 'multiple-choice',
            moduleId: 1,
            difficulty,
            title: 'Potencias de 2 en Redes',
            prompt: `¿Cuántas combinaciones matemáticas se pueden formar con ${exp} bits (2^${exp})?`,
            expectedAnswer: String(val),
            options,
            explanation: `2 elevado a la ${exp} es exactamente ${val.toLocaleString('es')}.`,
          };
        },
        () => { // V/F octeto
          return {
            id: genId('m1-tf'),
            type: 'true-false',
            moduleId: 1,
            difficulty,
            title: 'Rango de un Octeto',
            prompt: 'En informática de redes, un octeto almacena 256 combinaciones porque el valor 0 también cuenta como un número.',
            expectedAnswer: true,
            explanation: 'Verdadero. De 0 a 255 hay exactamente 256 valores posibles (2^8 = 256).',
          };
        }
      );
      break;
    }

    case 2: { // Módulo 2: Anatomía de IPv4 & Clasificación
      generators.push(
        () => { // Clasificación de IP
          const pool = [
            { ip: '10.50.1.20', type: 'Privada (RFC 1918)' },
            { ip: '172.20.10.5', type: 'Privada (RFC 1918)' },
            { ip: '192.168.1.100', type: 'Privada (RFC 1918)' },
            { ip: '100.64.20.15', type: 'CGNAT (RFC 6598)' },
            { ip: '127.0.0.1', type: 'Loopback' },
            { ip: '169.254.10.5', type: 'Link-Local' },
            { ip: '200.10.20.30', type: 'Pública' },
          ];
          const chosen = sample(pool);
          const options = shuffle(['Privada (RFC 1918)', 'CGNAT (RFC 6598)', 'Loopback', 'Pública', 'Link-Local']);
          return {
            id: genId('m2-scope'),
            type: 'multiple-choice',
            moduleId: 2,
            difficulty,
            title: 'Clasificación de Alcance IPv4',
            prompt: `¿A qué categoría pertenece la dirección IP ${chosen.ip}?`,
            expectedAnswer: chosen.type,
            options,
            explanation: `La dirección ${chosen.ip} pertenece al rango ${chosen.type}.`,
          };
        },
        () => { // Pregunta CGNAT y Doble NAT
          return {
            id: genId('m2-cgnat'),
            type: 'true-false',
            moduleId: 2,
            difficulty,
            title: 'Concepto de CGNAT',
            prompt: 'Cuando tu ISP implementa CGNAT, el Port Forwarding tradicional en tu router de casa deja de funcionar desde internet porque se produce un Doble NAT.',
            expectedAnswer: true,
            explanation: 'Verdadero. Tu router hace NAT y el ISP hace un segundo NAT en su enrutador central, bloqueando las conexiones entrantes.',
          };
        },
        () => { // IANA y RIR
          return {
            id: genId('m2-rir'),
            type: 'multiple-choice',
            moduleId: 2,
            difficulty,
            title: 'Gobernanza Regional de IPs',
            prompt: '¿Cuál es el Registro Regional de Internet (RIR) encargado de asignar direcciones IP en América Latina y el Caribe?',
            expectedAnswer: 'LACNIC',
            options: shuffle(['LACNIC', 'ARIN', 'RIPE NCC', 'APNIC']),
            explanation: 'LACNIC administra el espacio de direcciones IP para América Latina y el Caribe.',
          };
        }
      );
      break;
    }

    case 3: { // Módulo 3: Máscaras y notación CIDR
      generators.push(
        () => { // Prefijo a máscara decimal
          const prefixes = [25, 26, 27, 28, 29, 30, 24, 16, 22, 20];
          const pref = sample(prefixes);
          const sub = calculateSubnet('192.168.1.1', pref);
          return {
            id: genId('m3-mask'),
            type: 'open-input',
            moduleId: 3,
            difficulty,
            title: 'Prefijo CIDR a Máscara Decimal',
            prompt: `¿Cuál es la máscara decimal equivalente al prefijo /${pref}?`,
            targetValue: sub.maskDecimal,
            expectedAnswer: sub.maskDecimal,
            explanation: `El prefijo /${pref} corresponde a ${pref} unos binarios continuos, es decir: ${sub.maskDecimal}.`,
          };
        },
        () => { // Emparejamiento de prefijos con salto
          const pList = [25, 26, 27, 28, 29, 30];
          const chosen = shuffle(pList).slice(0, 4);
          const pairs = chosen.map((p) => {
            const s = calculateSubnet('192.168.1.1', p);
            return { id: String(p), left: `/${p}`, right: `Salto: ${s.salto}` };
          });
          const expectedAnswer: Record<string, string> = {};
          pairs.forEach((pair) => { expectedAnswer[pair.left] = pair.right; });

          return {
            id: genId('m3-match'),
            type: 'matching',
            moduleId: 3,
            difficulty,
            title: 'Emparejar Prefijo con su Salto',
            prompt: 'Empareja cada prefijo CIDR con el tamaño de su salto (bloque) en el 4to octeto:',
            pairs,
            expectedAnswer,
            explanation: 'Cada bit adicional encendido divide el salto a la mitad: /25=128, /26=64, /27=32, /28=16, /29=8, /30=4.',
          };
        },
        () => { // /0
          return {
            id: genId('m3-slash0'),
            type: 'true-false',
            moduleId: 3,
            difficulty,
            title: 'Máscara /0 (Ruta por Defecto)',
            prompt: 'La máscara /0 tiene 0 bits de red congelados, por lo que abarca absolutamente todas las 4,294,967,296 direcciones IPv4 del planeta.',
            expectedAnswer: true,
            explanation: 'Verdadero. Al no filtrar ningún bit, 0.0.0.0/0 representa a todo internet.',
          };
        }
      );
      break;
    }

    case 4: { // Módulo 4: Subnetting en 4to octeto (/25 a /32)
      generators.push(
        () => { // Paquete Completo 4to octeto
          const pref = sample([26, 27, 28, 29, 30]);
          const ip = `192.168.${randInt(1, 50)}.${randInt(1, 254)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m4-full'),
            type: 'full-packet',
            moduleId: 4,
            difficulty,
            title: 'Paquete Completo (4to Octeto)',
            prompt: `Calcula todos los parámetros de red para el equipo con IP ${ip}/${pref}:`,
            subnetData: sub,
            stepByStepDetails: {
              ip,
              prefix: pref,
              network: sub.networkAddress,
              salto: sub.salto,
              workingOctet: sub.workingOctet,
            },
            explanation: `Salto = 256 − ${256 - sub.salto} = ${sub.salto}. La IP ${ip} cae en la caja ${sub.networkAddress}.`,
          };
        },
        () => { // Dirección de red simple
          const pref = sample([26, 27, 28, 29]);
          const ip = `192.168.1.${randInt(1, 250)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m4-net'),
            type: 'open-input',
            moduleId: 4,
            difficulty,
            title: 'Cálculo de Dirección de Red',
            prompt: `¿Cuál es la dirección de red a la que pertenece la IP ${ip}/${pref}?`,
            targetValue: sub.networkAddress,
            expectedAnswer: sub.networkAddress,
            subnetData: sub,
            explanation: `El salto es ${sub.salto}. Los múltiplos son: 0, ${sub.salto}, ${sub.salto * 2}... Por tanto, cae en ${sub.networkAddress}.`,
          };
        },
        () => { // ¿Misma red?
          const pref = sample([26, 27, 28]);
          const subBase = calculateSubnet('192.168.1.1', pref);
          const isSame = sample([true, false]);
          let ipA = '';
          let ipB = '';

          if (isSame) {
            const netVal = Number(subBase.networkAddress.split('.')[3]);
            ipA = `192.168.1.${netVal + 2}`;
            ipB = `192.168.1.${netVal + subBase.salto - 2}`;
          } else {
            ipA = `192.168.1.10`;
            ipB = `192.168.1.${10 + subBase.salto + 5}`;
          }

          const actualSame = calculateSubnet(ipA, pref).networkAddress === calculateSubnet(ipB, pref).networkAddress;

          return {
            id: genId('m4-same'),
            type: 'same-network',
            moduleId: 4,
            difficulty,
            title: '¿Pertenecen a la misma red?',
            prompt: `¿Las direcciones ${ipA}/${pref} y ${ipB}/${pref} pertenecen a la misma subred y pueden comunicarse en Capa 2 sin router?`,
            ipA,
            ipB,
            prefix: pref,
            sameNetwork: actualSame,
            expectedAnswer: actualSame,
            explanation: actualSame
              ? `Sí, ambas tienen como dirección de red ${calculateSubnet(ipA, pref).networkAddress}.`
              : `No, ${ipA} está en la red ${calculateSubnet(ipA, pref).networkAddress} y ${ipB} está en la red ${calculateSubnet(ipB, pref).networkAddress}.`,
          };
        }
      );
      break;
    }

    case 5: { // Módulo 5: Subnetting en 3er octeto (/17 a /24)
      generators.push(
        () => { // Paquete completo 3er octeto
          const pref = sample([19, 20, 21, 22, 23]);
          const ip = `172.${randInt(16, 31)}.${randInt(1, 250)}.${randInt(1, 250)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m5-full'),
            type: 'full-packet',
            moduleId: 5,
            difficulty,
            title: 'Paquete Completo (3er Octeto)',
            prompt: `Calcula todos los parámetros de red para el equipo ${ip}/${pref}:`,
            subnetData: sub,
            stepByStepDetails: {
              ip,
              prefix: pref,
              network: sub.networkAddress,
              salto: sub.salto,
              workingOctet: sub.workingOctet,
            },
            explanation: `El octeto de trabajo es el 3ro con salto de ${sub.salto}. La red termina en .0 y el broadcast en .255.`,
          };
        },
        () => { // V/F .0 como host
          return {
            id: genId('m5-dotzero'),
            type: 'true-false',
            moduleId: 5,
            difficulty,
            title: 'Mito de las IPs terminadas en .0',
            prompt: 'En una red con prefijo /22 (como 172.16.64.0/22), la IP 172.16.65.0 es una dirección de host válida y puede asignarse a un servidor.',
            expectedAnswer: true,
            explanation: 'Verdadero. Solo la primera IP absoluta (172.16.64.0) es de red y la última (172.16.67.255) es de broadcast. Los .0 intermedios son computadoras válidas.',
          };
        },
        () => { // Cálculo de salto en 3er octeto
          const pref = sample([20, 21, 22]);
          const sub = calculateSubnet('172.16.0.0', pref);
          return {
            id: genId('m5-salto'),
            type: 'open-input',
            moduleId: 5,
            difficulty,
            title: 'Salto en el 3er Octeto',
            prompt: `¿De cuánto es el salto de red en el 3er octeto para una máscara /${pref}?`,
            targetValue: String(sub.salto),
            expectedAnswer: String(sub.salto),
            explanation: `La máscara tiene ${sub.maskDecimal.split('.')[2]} en el 3er octeto. Salto = 256 − ${sub.maskDecimal.split('.')[2]} = ${sub.salto}.`,
          };
        }
      );
      break;
    }

    case 6: { // Módulo 6: 1er y 2do octeto (/1 a /16)
      generators.push(
        () => { // Paquete completo 2do octeto
          const pref = sample([11, 12, 13, 14]);
          const ip = `10.${randInt(1, 240)}.${randInt(1, 250)}.${randInt(1, 250)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m6-full'),
            type: 'full-packet',
            moduleId: 6,
            difficulty,
            title: 'Paquete Completo (2do Octeto)',
            prompt: `Calcula todos los parámetros para la red masiva ${ip}/${pref}:`,
            subnetData: sub,
            stepByStepDetails: {
              ip,
              prefix: pref,
              network: sub.networkAddress,
              salto: sub.salto,
              workingOctet: sub.workingOctet,
            },
            explanation: `Octeto de trabajo = 2do con salto de ${sub.salto}. Los octetos 3 y 4 se rellenan con ceros para la red.`,
          };
        },
        () => { // Dirección de red en 1er o 2do octeto
          const pref = sample([6, 7, 10, 11, 12, 13, 14, 15]);
          const ip = pref <= 8
            ? `${randInt(10, 220)}.${randInt(1, 250)}.${randInt(1, 250)}.${randInt(1, 250)}`
            : `10.${randInt(1, 250)}.${randInt(1, 250)}.${randInt(1, 250)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m6-net'),
            type: 'open-input',
            moduleId: 6,
            difficulty,
            title: `Dirección de Red en Octeto ${sub.workingOctet}`,
            prompt: `¿Cuál es la dirección de red exacta para el bloque ${ip}/${pref}?`,
            targetValue: sub.networkAddress,
            expectedAnswer: sub.networkAddress,
            subnetData: sub,
            explanation: `En /${pref} el octeto de trabajo es el ${sub.workingOctet}º con salto ${sub.salto}. La red base es ${sub.networkAddress}.`,
          };
        },
        () => { // Broadcast en 2do octeto
          const pref = sample([11, 12, 13, 14, 15]);
          const ip = `10.${randInt(1, 240)}.${randInt(1, 250)}.${randInt(1, 250)}`;
          const sub = calculateSubnet(ip, pref);
          return {
            id: genId('m6-bcast'),
            type: 'open-input',
            moduleId: 6,
            difficulty,
            title: 'Dirección de Broadcast en Grandes Redes',
            prompt: `¿Cuál es la dirección de Broadcast para la dirección ${ip}/${pref}?`,
            targetValue: sub.broadcastAddress,
            expectedAnswer: sub.broadcastAddress,
            subnetData: sub,
            explanation: `El bloque en el 2do octeto tiene salto ${sub.salto}; el broadcast cierra en ${sub.broadcastAddress}.`,
          };
        },
        () => { // /1 Bifurcación
          return {
            id: genId('m6-slash1'),
            type: 'multiple-choice',
            moduleId: 6,
            difficulty,
            title: 'La primera bifurcación binaria (/1)',
            prompt: '¿Por qué en teoría de redes se afirma que la primera decisión de enrutamiento condicional nace en /1 y no en /0?',
            expectedAnswer: 'Porque en /1 existen 2 redes (2^1) y el router evalúa si el primer bit es 0 o 1 para elegir el salto',
            options: shuffle([
              'Porque en /1 existen 2 redes (2^1) y el router evalúa si el primer bit es 0 o 1 para elegir el salto',
              'Porque /0 es una máscara ilegal que los routers Cisco descartan',
              'Porque /1 solo permite conectar 254 computadoras',
              'Porque /1 es exclusiva de redes locales privadas',
            ]),
            explanation: 'En /0 solo hay 1 red universal (2^0 = 1). En /1 nacen 2 redes posibles (2^1 = 2) y el router discrimina caminos.',
          };
        }
      );
      break;
    }

    case 7: { // Módulo 7: Subnetting FLSM
      generators.push(
        () => { // Bits prestados
          const count = sample([2, 4, 8, 16, 32, 64, 128]);
          const bits = Math.log2(count);
          return {
            id: genId('m7-borrow'),
            type: 'open-input',
            moduleId: 7,
            difficulty,
            title: 'Bits prestados en FLSM',
            prompt: `Si necesitas dividir una red en exactamente ${count} subredes de igual tamaño, ¿cuántos bits de host debes pedir prestados para la red?`,
            targetValue: String(bits),
            expectedAnswer: String(bits),
            explanation: `2^${bits} = ${count}, por lo que se deben pedir prestados ${bits} bits.`,
          };
        },
        () => { // Prefijo resultante
          const basePref = sample([16, 20, 22, 24]);
          const subnetsNeeded = sample([4, 8, 16, 32]);
          const borrowed = Math.log2(subnetsNeeded);
          const finalPref = basePref + borrowed;
          return {
            id: genId('m7-pref'),
            type: 'open-input',
            moduleId: 7,
            difficulty,
            title: 'Prefijo resultante en FLSM',
            prompt: `Si tomas una red /${basePref} y la divides en ${subnetsNeeded} subredes iguales, ¿cuál será el nuevo prefijo CIDR de cada subred?`,
            targetValue: `/${finalPref}`,
            expectedAnswer: `/${finalPref}`,
            explanation: `/${basePref} + ${borrowed} bits prestados = /${finalPref}.`,
          };
        },
        () => { // Dirección de la N-ésima subred FLSM
          const thirdOct = randInt(1, 90);
          const subnetsNeeded = sample([4, 8, 16]);
          const borrowed = Math.log2(subnetsNeeded);
          const newPref = 24 + borrowed;
          const salto = 256 / subnetsNeeded;
          const idx = randInt(2, subnetsNeeded); // 2da a N-ésima subred (1-indexed)
          const netFourth = (idx - 1) * salto;
          const answer = `192.168.${thirdOct}.${netFourth}`;
          return {
            id: genId('m7-nth'),
            type: 'open-input',
            moduleId: 7,
            difficulty,
            title: 'Cálculo de Subred Específica en FLSM',
            prompt: `Al dividir la red 192.168.${thirdOct}.0/24 en ${subnetsNeeded} subredes iguales (/${newPref}), ¿cuál es la Dirección de Red de la subred #${idx} (contando desde la #1)?`,
            targetValue: answer,
            expectedAnswer: answer,
            explanation: `Cada subred /${newPref} tiene un salto de ${salto}. La subred #${idx} inicia en (${idx} − 1) × ${salto} = ${netFourth} → ${answer}.`,
          };
        },
        () => { // Hosts útiles por cada subred FLSM
          const subnetsNeeded = sample([4, 8, 16, 32]);
          const borrowed = Math.log2(subnetsNeeded);
          const hostBits = 8 - borrowed;
          const usable = Math.pow(2, hostBits) - 2;
          return {
            id: genId('m7-hosts'),
            type: 'open-input',
            moduleId: 7,
            difficulty,
            title: 'Capacidad de Hosts por Subred en FLSM',
            prompt: `Si divides una red /24 en ${subnetsNeeded} subredes iguales, ¿cuántos hosts utilizables tendrá cada subred resultante?`,
            targetValue: String(usable),
            expectedAnswer: String(usable),
            explanation: `Pides ${borrowed} bits prestados y quedan ${hostBits} bits de host: 2^${hostBits} − 2 = ${usable} hosts útiles por subred.`,
          };
        }
      );
      break;
    }

    case 8: { // Módulo 8: VLSM
      generators.push(
        () => { // Prefijo mínimo para hosts
          const hosts = sample([6, 12, 20, 28, 45, 60, 100, 120, 240, 500, 900]);
          let hBits = 2;
          while (Math.pow(2, hBits) - 2 < hosts) hBits++;
          const pref = 32 - hBits;
          return {
            id: genId('m8-hosts-pref'),
            type: 'open-input',
            moduleId: 8,
            difficulty,
            title: 'Prefijo mínimo para requerimiento VLSM',
            prompt: `¿Cuál es el prefijo CIDR más pequeño (más eficiente) para alojar ${hosts} computadoras en VLSM sin desperdiciar espacio?`,
            targetValue: `/${pref}`,
            expectedAnswer: `/${pref}`,
            explanation: `Se necesitan ${hBits} bits de host (2^${hBits} − 2 = ${Math.pow(2, hBits) - 2} útiles). Prefijo = 32 − ${hBits} = /${pref}.`,
          };
        },
        () => { // Siguiente bloque contiguo en VLSM
          const third = randInt(10, 80);
          const firstReq = sample([
            { hosts: 100, pref: 25, salto: 128 },
            { hosts: 50, pref: 26, salto: 64 },
            { hosts: 25, pref: 27, salto: 32 },
            { hosts: 12, pref: 28, salto: 16 },
          ]);
          const nextIp = `192.168.${third}.${firstReq.salto}`;
          return {
            id: genId('m8-next'),
            type: 'open-input',
            moduleId: 8,
            difficulty,
            title: 'Asignación Contigua en VLSM',
            prompt: `Partiendo de la red base 192.168.${third}.0/24, asignas la primera subred para ${firstReq.hosts} hosts (/${firstReq.pref}). ¿En qué dirección de red exacta debe comenzar la siguiente subred en tu tabla VLSM?`,
            targetValue: nextIp,
            expectedAnswer: nextIp,
            explanation: `La primera subred /${firstReq.pref} ocupa un bloque de ${firstReq.salto} direcciones (de .0 a .${firstReq.salto - 1}). La siguiente subred comienza exactamente en ${nextIp}.`,
          };
        },
        () => { // Enlace WAN punto a punto
          return {
            id: genId('m8-wan'),
            type: 'multiple-choice',
            moduleId: 8,
            difficulty,
            title: 'Optimización de Enlaces WAN Punto a Punto',
            prompt: 'En un diseño VLSM tradicional con broadcast estándar, ¿qué prefijo se asigna a un enlace serial o fibra punto a punto entre 2 routers para minimizar el desperdicio de direcciones?',
            expectedAnswer: '/30 (Salto 4: 2 IPs útiles)',
            options: shuffle([
              '/30 (Salto 4: 2 IPs útiles)',
              '/29 (Salto 8: 6 IPs útiles)',
              '/28 (Salto 16: 14 IPs útiles)',
              '/24 (Salto 256: 254 IPs útiles)',
            ]),
            explanation: 'El prefijo /30 proporciona un bloque de 4 direcciones (Red, 2 IPs útiles para cada extremo del enlace y Broadcast).',
          };
        },
        () => { // Regla de oro de ordenamiento VLSM
          return {
            id: genId('m8-order'),
            type: 'true-false',
            moduleId: 8,
            difficulty,
            title: 'Regla de Oro en VLSM',
            prompt: 'En el algoritmo de cálculo VLSM, es obligatorio ordenar los requerimientos de mayor a menor número de hosts para evitar solapamientos y fragmentación.',
            expectedAnswer: true,
            explanation: 'Verdadero. Ordenar de mayor a menor asegura que los bloques grandes se alineen correctamente en sus múltiplos de salto.',
          };
        }
      );
      break;
    }

    case 9: { // Módulo 9: Enrutamiento & Sumarización
      generators.push(
        () => { // Sumarización procedural de 4 subredes /24 contiguas
          const second = randInt(16, 30);
          const baseBlock = randInt(0, 12) * 4;
          const r1 = `172.${second}.${baseBlock}.0/24`;
          const r2 = `172.${second}.${baseBlock + 1}.0/24`;
          const r3 = `172.${second}.${baseBlock + 2}.0/24`;
          const r4 = `172.${second}.${baseBlock + 3}.0/24`;
          const summary = `172.${second}.${baseBlock}.0/22`;
          return {
            id: genId('m9-summ'),
            type: 'open-input',
            moduleId: 9,
            difficulty,
            title: 'Sumarización de 4 subredes contiguas',
            prompt: `¿Cuál es la superred mínima (formato IP/prefijo) que resume exactamente las redes ${r1}, ${r2}, ${r3} y ${r4}?`,
            targetValue: summary,
            expectedAnswer: summary,
            explanation: `Las 4 redes consecutivas /24 desde .${baseBlock}.0 hasta .${baseBlock + 3}.0 se agrupan en un bloque de salto 4 en el 3er octeto: ${summary}.`,
          };
        },
        () => { // Longest Prefix Match (LPM) procedural
          const third = randInt(10, 99);
          const host = randInt(5, 60);
          const destIp = `10.20.${third}.${host}`;
          const routeGeneral = `10.20.0.0/16`;
          const routeMid = `10.20.${third}.0/24`;
          const routeSpecific = `10.20.${third}.0/26`;
          const routeOther = `10.20.${third}.128/25`;
          return {
            id: genId('m9-lpm'),
            type: 'multiple-choice',
            moduleId: 9,
            difficulty,
            title: 'Decisión por Longest Prefix Match (LPM)',
            prompt: `Un router recibe un paquete con destino a ${destIp}. En su tabla de enrutamiento figuran las siguientes 4 rutas. ¿Cuál ruta seleccionará el router?`,
            expectedAnswer: routeSpecific,
            options: shuffle([routeGeneral, routeMid, routeSpecific, routeOther]),
            explanation: `Las rutas /16, /24 y /26 coinciden con ${destIp} (la /25 inicia en .128 y no coincide). Entre las que coinciden, ${routeSpecific} tiene el prefijo más largo (/26).`,
          };
        },
        () => { // Truco VPN 0.0.0.0/1
          return {
            id: genId('m9-vpn'),
            type: 'multiple-choice',
            moduleId: 9,
            difficulty,
            title: 'El truco de enrutamiento en VPNs',
            prompt: '¿Por qué OpenVPN y WireGuard inyectan las rutas 0.0.0.0/1 y 128.0.0.0/1 en lugar de sobrescribir 0.0.0.0/0?',
            expectedAnswer: 'Porque /1 le gana a /0 por Longest Prefix Match sin borrar la puerta de enlace física original',
            options: shuffle([
              'Porque /1 le gana a /0 por Longest Prefix Match sin borrar la puerta de enlace física original',
              'Porque los routers residenciales bloquean la máscara /0',
              'Porque /1 encripta los paquetes a nivel de hardware',
              'Porque IPv4 prohíbe tener más de una ruta por defecto',
            ]),
            explanation: 'Por la regla de coincidencia más larga (LPM), /1 tiene precedencia sobre /0. Al desconectar la VPN, el tráfico vuelve solo a /0.',
          };
        }
      );
      break;
    }

    case 10: { // Módulo 10: IPv6
      generators.push(
        () => { // Compresión IPv6 procedural
          const hextet2 = sample(['0db8', '00a4', '0010', '0f20']);
          const hextet6 = sample(['ff00', '00c1', '03a0', '0009']);
          const hextet7 = sample(['0042', '001a', '0005', '08b0']);
          const hextet8 = sample(['8329', '104c', '99a1', '00ef']);
          const full = `2001:${hextet2}:0000:0000:0000:${hextet6}:${hextet7}:${hextet8}`;
          const comp = compressIPv6(full);
          return {
            id: genId('m10-comp'),
            type: 'open-input',
            moduleId: 10,
            difficulty,
            title: 'Compresión IPv6 (RFC 5952)',
            prompt: `Comprime la siguiente dirección IPv6 aplicando la norma RFC 5952: ${full}`,
            targetValue: comp,
            expectedAnswer: comp,
            explanation: `Se omiten ceros a la izquierda de cada hexteto y se sustituye la secuencia contigua de ceros por '::': ${comp}.`,
          };
        },
        () => { // Subredes /64 en prefijo delegado aleatorio
          const delegatedPrefix = sample([48, 52, 56, 60, 62]);
          const subnetBits = 64 - delegatedPrefix;
          const total64 = Math.pow(2, subnetBits);
          return {
            id: genId('m10-sub64'),
            type: 'open-input',
            moduleId: 10,
            difficulty,
            title: `Subredes /64 en prefijo /${delegatedPrefix}`,
            prompt: `Si tu ISP te delega un prefijo IPv6 /${delegatedPrefix} mediante DHCPv6-PD, ¿cuántas subredes estándar /64 completas puedes crear?`,
            targetValue: String(total64),
            expectedAnswer: String(total64),
            explanation: `64 − ${delegatedPrefix} = ${subnetBits} bits para subredes. 2^${subnetBits} = ${total64.toLocaleString('es')} subredes /64.`,
          };
        },
        () => { // Clasificación de direcciones IPv6
          const ipv6Samples = [
            { addr: 'fe80::1a2b:3c4d:5e6f:7890', scope: 'Link-Local (fe80::/10)' },
            { addr: 'fd12:3456:789a::1', scope: 'Unique Local — ULA (fc00::/7)' },
            { addr: 'ff02::1', scope: 'Multicast (ff00::/8)' },
            { addr: '2803:1920:abcd::1', scope: 'Global Unicast — GUA (2000::/3)' },
          ];
          const chosen = sample(ipv6Samples);
          return {
            id: genId('m10-scope'),
            type: 'multiple-choice',
            moduleId: 10,
            difficulty,
            title: 'Identificación de Tipo de Dirección IPv6',
            prompt: `¿A qué categoría de direccionamiento IPv6 pertenece la dirección ${chosen.addr}?`,
            expectedAnswer: chosen.scope,
            options: shuffle(ipv6Samples.map((s) => s.scope)),
            explanation: `Por sus bits iniciales, ${chosen.addr} corresponde al rango ${chosen.scope}.`,
          };
        },
        () => { // Prefijo LACNIC
          return {
            id: genId('m10-lacnic'),
            type: 'multiple-choice',
            moduleId: 10,
            difficulty,
            title: 'Prefijo Regional LACNIC en IPv6',
            prompt: '¿Con qué dígitos hexadecimales inician típicamente las direcciones públicas IPv6 asignadas en América Latina y el Caribe?',
            expectedAnswer: '2800::/12',
            options: shuffle(['2800::/12', '2600::/12', '2a00::/12', '2400::/12']),
            explanation: 'La IANA asignó el bloque 2800::/12 al registro regional LACNIC.',
          };
        }
      );
      break;
    }

    default:
      break;
  }

  // Generar la lista de preguntas rotando entre los generadores barajados sin repetir enunciados estáticos
  const questions: Question[] = [];
  const seenPrompts = new Set<string>();
  if (generators.length > 0) {
    let pool = shuffle(generators);
    let idx = 0;
    let attempts = 0;
    while (questions.length < count && attempts < count * 8) {
      attempts++;
      if (idx >= pool.length) {
        pool = shuffle(generators);
        idx = 0;
      }
      const q = pool[idx]();
      idx++;
      if (!seenPrompts.has(q.prompt) || attempts > count * 5) {
        seenPrompts.add(q.prompt);
        questions.push(q);
      }
    }
  }

  return questions;
}

export interface ExamCategorySpec {
  id: string;
  title: string;
  shortTitle: string;
  moduleIds: [number, number];
  description: string;
}

export const EXAM_CATEGORIES: ExamCategorySpec[] = [
  {
    id: 'cat-1',
    title: 'Fundamentos y Anatomía IPv4',
    shortTitle: 'Fundamentos IPv4',
    moduleIds: [1, 2],
    description: 'Conversión binaria octeto a octeto, clases, RFC 1918 y CGNAT.',
  },
  {
    id: 'cat-2',
    title: 'Método del Salto en 4to Octeto',
    shortTitle: '4to Octeto (/25–/32)',
    moduleIds: [3, 4],
    description: 'Máscaras CIDR, barra de cajas y cálculo rápido en el 4to octeto.',
  },
  {
    id: 'cat-3',
    title: 'Pisos y Grandes Redes',
    shortTitle: 'Pisos (/1–/24)',
    moduleIds: [5, 6],
    description: 'Subnetting en 3er octeto (/17–/24) y redes de gran escala (/1–/16).',
  },
  {
    id: 'cat-4',
    title: 'Diseño de Red FLSM y VLSM',
    shortTitle: 'Diseño FLSM / VLSM',
    moduleIds: [7, 8],
    description: 'Planificación jerárquica sin solapamiento y enlaces WAN /30 y /31.',
  },
  {
    id: 'cat-5',
    title: 'Avanzadas: Sumarización e IPv6',
    shortTitle: 'Sumarización & IPv6',
    moduleIds: [9, 10],
    description: 'Supernetting BGP/OSPF, Longest Prefix Match y arquitectura IPv6.',
  },
];

/**
 * Genera las 25 preguntas del Examen Final de Certificación NetAscend,
 * equilibradas exactamente con 5 preguntas por cada una de las 5 categorías.
 */
export function generateCertificationExam(): Question[] {
  const allQuestions: Question[] = [];

  for (const cat of EXAM_CATEGORIES) {
    const [modA, modB] = cat.moduleIds;
    // 2 preguntas del primer módulo y 3 del segundo módulo = 5 por categoría
    const partA = generateQuiz(modA, 'medium', 2);
    const partB = generateQuiz(modB, 'hard', 3);
    allQuestions.push(...partA, ...partB);
  }

  return allQuestions;
}
