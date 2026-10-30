export interface ModuleSection {
  id: string;
  title: string;
  content: string[];
  bullets?: string[];
  tips?: string[];
  alerts?: string[];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface StepByStepExample {
  title: string;
  input: string;
  steps: { step: number; name: string; description: string; highlight?: string }[];
  result: {
    network: string;
    broadcast: string;
    firstUsable?: string;
    lastUsable?: string;
    salto?: number;
    workingOctet?: number;
    totalHosts?: number | string;
    usableHosts?: number | string;
  };
}

export interface ModuleData {
  id: number;
  title: string;
  subtitle: string;
  category: 'Fundamentos' | 'Direccionamiento' | 'El Método Mágico' | 'Diseño de Red' | 'Avanzado & IPv6';
  badge: string;
  estimatedMinutes: number;
  xpReward: number;
  summary: string;
  sections: ModuleSection[];
  glossary: GlossaryItem[];
  stepByStepExamples: StepByStepExample[];
  interactiveType:
    | 'bit-switches'
    | 'special-ranges'
    | 'cidr-slider'
    | 'box-4th'
    | 'floors-3rd'
    | 'architect-octets'
    | 'flsm-sim'
    | 'vlsm-sim'
    | 'summarize-sim'
    | 'ipv6-nibbles';
  trapsAndFeedback: { trap: string; feedback: string }[];
}

export const MODULES_DATA: ModuleData[] = [
  {
    id: 1,
    title: 'Módulo 1 — Fundamentos binarios',
    subtitle: 'El lenguaje nativo de los routers: bits, bytes y potencias de 2',
    category: 'Fundamentos',
    badge: 'Base Matemática',
    estimatedMinutes: 15,
    xpReward: 150,
    summary:
      'Aprende cómo las computadoras entienden los números a través de 8 interruptores. Domina la tabla posicional y la conversión decimal-binario sin fórmulas complejas.',
    interactiveType: 'bit-switches',
    sections: [
      {
        id: 'bits-bytes',
        title: '1. Bits, bytes y octetos: ¿Por qué de 0 a 255?',
        content: [
          'En computación y redes, la unidad mínima de información es el bit (un dígito binario que solo puede valer 0 o 1). Un octeto o byte está compuesto por un grupo cerrado de 8 bits.',
          'Cada bit en un octeto representa una potencia de 2 según su posición, de derecha a izquierda. Si todos los bits están apagados (00000000), el valor decimal es 0. Si todos los bits están encendidos (11111111), la suma total es 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.',
          'Por eso un octeto tiene exactamente 256 valores posibles (del 0 al 255). ¡El cero también es un número y cuenta como una posición válida!',
        ],
        bullets: [
          '1 Bit = 0 ó 1 (encendido / apagado)',
          '1 Octeto / Byte = 8 bits consecutivos',
          'Rango numérico = 0 a 255 (256 combinaciones posibles)',
          'Regla de oro: Jamás verás un número mayor a 255 en una dirección IPv4 estándar.',
        ],
        tips: [
          'No confundas "cantidad de valores" con el "valor máximo". Hay 256 valores posibles, pero el número más alto alcanzable es 255 porque empezamos a contar desde 0.',
        ],
      },
      {
        id: 'tabla-posicional',
        title: '2. La Tabla Posicional Mágica: 128, 64, 32, 16, 8, 4, 2, 1',
        content: [
          'Memorizar los pesos de los 8 bits es el 50% del éxito en subnetting. Cada posición vale exactamente el doble de la que tiene a su derecha.',
          'Posición 7 (2^7) = 128 | Posición 6 (2^6) = 64 | Posición 5 (2^5) = 32 | Posición 4 (2^4) = 16 | Posición 3 (2^3) = 8 | Posición 2 (2^2) = 4 | Posición 1 (2^1) = 2 | Posición 0 (2^0) = 1.',
        ],
        bullets: [
          'Bit más significativo (MSB): el de la izquierda (128).',
          'Bit menos significativo (LSB): el de la derecha (1).',
          'Si un número decimal es impar, su último bit a la derecha (1) SIEMPRE es 1.',
          'Si un número decimal es par, su último bit a la derecha SIEMPRE es 0.',
        ],
      },
      {
        id: 'metodo-restas',
        title: '3. Conversión Decimal a Binario con el Método de "Restar Posiciones"',
        content: [
          'Olvida la división sucesiva por 2 que enseñan en la universidad: en redes necesitas velocidad mental. El método más rápido consiste en ir de izquierda a derecha restando el valor posicional si "cabe":',
          '¿El número es mayor o igual a 128? Si sí, pones un 1 y restas 128. Si no, pones un 0 y sigues. Luego preguntas lo mismo para 64, 32, 16, 8, 4, 2 y 1.',
        ],
        tips: [
          'Ejemplo rápido para 168: 168 >= 128 (Sí -> 1, sobra 40). 40 >= 64 (No -> 0). 40 >= 32 (Sí -> 1, sobra 8). 8 >= 16 (No -> 0). 8 >= 8 (Sí -> 1, sobra 0). Resto ceros -> 10101000.',
        ],
      },
      {
        id: 'potencias-dos',
        title: '4. Potencias de 2 esenciales en redes',
        content: [
          'En subnetting trabajarás constantemente con potencias de 2 para calcular cantidades de subredes y hosts disponibles.',
        ],
        bullets: [
          '2^1 = 2',
          '2^2 = 4',
          '2^3 = 8',
          '2^4 = 16',
          '2^5 = 32',
          '2^6 = 64',
          '2^7 = 128',
          '2^8 = 256 (un octeto completo)',
          '2^16 = 65,536 (dos octetos completos)',
          '2^24 = 16,777,216 (tres octetos)',
          '2^32 = 4,294,967,296 (espacio completo IPv4)',
        ],
      },
    ],
    glossary: [
      { term: 'Bit', definition: 'Unidad elemental de cómputo binario con valor 0 ó 1.' },
      { term: 'Octeto / Byte', definition: 'Conjunto ordenado de 8 bits (rango decimal 0 a 255).' },
      { term: 'MSB (Most Significant Bit)', definition: 'El bit de mayor valor posicional (a la izquierda, 128 en un octeto).' },
      { term: 'LSB (Least Significant Bit)', definition: 'El bit de menor valor posicional (a la derecha, peso 1).' },
      { term: 'Base 2', definition: 'Sistema numérico donde cada dígito representa potencias consecutivas del número dos.' },
    ],
    stepByStepExamples: [
      {
        title: 'Convertir el octeto 192 a binario',
        input: 'Decimal 192',
        steps: [
          { step: 1, name: 'Posición 128', description: '192 >= 128: Sí cabe. Ponemos 1 y restamos: 192 - 128 = 64.', highlight: '1' },
          { step: 2, name: 'Posición 64', description: '64 >= 64: Sí cabe. Ponemos 1 y restamos: 64 - 64 = 0.', highlight: '11' },
          { step: 3, name: 'Resto de posiciones', description: 'Como ya nos quedó 0, completamos con ceros las 6 posiciones restantes.', highlight: '11000000' },
        ],
        result: {
          network: '11000000',
          broadcast: '192 en decimal',
          salto: 64,
        },
      },
      {
        title: 'Convertir el binario 11010010 a decimal',
        input: 'Binario 11010010',
        steps: [
          { step: 1, name: 'Identificar bits en 1', description: 'Los bits encendidos están en los pesos 128, 64, 16 y 2.' },
          { step: 2, name: 'Sumar posiciones', description: '128 + 64 + 16 + 2 = 210.' },
        ],
        result: {
          network: '210',
          broadcast: '11010010 en binario',
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Creer que un octeto llega hasta 256',
        feedback: 'Recuerda: hay 256 valores en total, pero van del 0 al 255.',
      },
      {
        trap: 'Confundir bits pares con números impares',
        feedback: 'El bit de la posición 0 (peso 1) es el único que define si un número es impar.',
      },
    ],
  },
  {
    id: 2,
    title: 'Módulo 2 — Anatomía de una dirección IPv4',
    subtitle: 'Porción de red, hosts, clases históricas y el mapa global de IPs',
    category: 'Direccionamiento',
    badge: 'Arquitectura IPv4',
    estimatedMinutes: 20,
    xpReward: 180,
    summary:
      'Descubre la estructura de los 32 bits de una IP, la diferencia crucial entre red y host, los rangos privados RFC 1918, CGNAT y cómo la IANA distribuye las direcciones en el mundo.',
    interactiveType: 'special-ranges',
    sections: [
      {
        id: 'estructura-ip',
        title: '1. Estructura de 32 bits y 4 octetos',
        content: [
          'Una dirección IPv4 es un número binario de 32 bits. Para que los humanos podamos leerlo, se divide en 4 octetos (8 bits cada uno) separados por puntos y expresados en notación decimal punteada (Dotted Decimal Notation): ej. 192.168.1.1.',
          'Toda IP tiene dos porciones inseparables: la porción de red (identifica la red o vecindario a la que pertenece) y la porción de host (identifica a la interfaz del dispositivo específico dentro de ese vecindario).',
          'El total matemático de direcciones IPv4 posibles es 2^32 = 4,294,967,296 direcciones.',
        ],
      },
      {
        id: 'clases-historicas',
        title: '2. Clases históricas (A, B, C, D, E) y su muerte frente a CIDR',
        content: [
          'En los inicios de Internet (RFC 791, 1981), las direcciones se dividían rígidamente por clases según los primeros bits del primer octeto:',
        ],
        bullets: [
          'Clase A (0.0.0.0 a 127.255.255.255): Máscara fija /8 (255.0.0.0). Permitía 126 redes con 16 millones de hosts cada una.',
          'Clase B (128.0.0.0 a 191.255.255.255): Máscara fija /16 (255.255.0.0). Permitía 16,384 redes de 65,534 hosts.',
          'Clase C (192.0.0.0 a 223.255.255.255): Máscara fija /24 (255.255.255.0). Permitía 2 millones de redes de solo 254 hosts.',
          'Clase D (224.0.0.0 a 239.255.255.255): Reservada para Multicast (tráfico de uno a muchos).',
          'Clase E (240.0.0.0 a 255.255.255.255): Reservada para investigación y experimentación.',
        ],
        tips: [
          '¿Por qué murió este sistema? Porque era extremadamente ineficiente. Si una empresa necesitaba 300 IPs, una Clase C (/24 = 254 hosts) no le alcanzaba y se le asignaba una Clase B (/16 = 65,534 hosts), desperdiciando más de 65,000 direcciones. En 1993 se introdujo CIDR (Classless Inter-Domain Routing, RFC 1519), eliminando las clases y permitiendo máscaras de cualquier longitud.',
        ],
      },
      {
        id: 'rangos-especiales',
        title: '3. Rangos especiales y RFCs que debes saber de memoria',
        content: [
          'No todas las IPs pueden navegar libremente por la Internet pública. Ciertos bloques tienen propósitos específicos:',
        ],
        bullets: [
          'Privadas RFC 1918: 10.0.0.0/8 (10.0.0.0 - 10.255.255.255), 172.16.0.0/12 (172.16.0.0 - 172.31.255.255), 192.168.0.0/16 (192.168.0.0 - 192.168.255.255). No son enrutables en Internet.',
          'CGNAT (Carrier-Grade NAT, RFC 6598): 100.64.0.0/10 (100.64.0.0 - 100.127.255.255). Usado por los proveedores de internet (ISP) para meter a miles de clientes residenciales detrás de pocas IPs públicas.',
          'Loopback RFC 1122: 127.0.0.0/8 (típicamente 127.0.0.1 localhost), para pruebas internas dentro del propio equipo sin tocar la tarjeta de red.',
          'Link-Local / APIPA (RFC 3927): 169.254.0.0/16. Cuando tu PC busca un servidor DHCP y nadie le responde, se autoasigna una IP de este rango.',
        ],
      },
      {
        id: 'nat-pat-edificio',
        title: '4. IP Pública vs Privada: NAT/PAT y la metáfora del edificio',
        content: [
          'Imagina un gran edificio corporativo con 500 empleados. Cada empleado tiene un teléfono con un anexo interno (ej. anexo 104, anexo 212). Ese anexo es como la IP privada: sirve para hablar entre oficinas pero nadie del exterior puede marcar directamente al "anexo 104" desde la calle.',
          'El edificio tiene un único número telefónico público registrado en la guía telefónica con una recepcionista central. La recepcionista es el router con NAT (Network Address Translation) y PAT (Port Address Translation): traduce los anexos internos a puertos del número público para salir a la calle.',
        ],
      },
      {
        id: 'iana-rir',
        title: '5. ¿Quién reparte las IPs? De la IANA a tu casa',
        content: [
          'La IANA (Internet Assigned Numbers Authority) es la máxima entidad mundial que gestiona el espacio global de direcciones.',
          'La IANA delega grandes bloques a 5 Registros Regionales de Internet (RIR):',
        ],
        bullets: [
          'LACNIC: América Latina y el Caribe.',
          'ARIN: Estados Unidos, Canadá y partes del Caribe.',
          'RIPE NCC: Europa, Oriente Medio y Asia Central.',
          'APNIC: Asia Oriental y Oceanía.',
          'AFRINIC: Todo el continente africano.',
        ],
        tips: [
          'Los RIR asignan bloques a los Proveedores de Servicios de Internet (ISP), y los ISP asignan las IPs a tu router o empresa. Como el stock central de IPv4 se agotó oficialmente en 2011, hoy en día las IPs públicas se transfieren y cotizan en un mercado secundario a precios considerables.',
        ],
      },
    ],
    glossary: [
      { term: 'CIDR', definition: 'Enrutamiento entre dominios sin clases (permite máscaras arbitrarias).' },
      { term: 'RFC 1918', definition: 'Estándar que reserva los bloques privados 10/8, 172.16/12 y 192.168/16.' },
      { term: 'CGNAT (RFC 6598)', definition: 'Bloque 100.64.0.0/10 empleado por ISPs para doble NAT masivo.' },
      { term: 'APIPA', definition: 'Automatic Private IP Addressing (169.254.0.0/16) cuando falla DHCP.' },
      { term: 'Loopback', definition: 'Dirección virtual que apunta al propio host local (127.0.0.0/8).' },
      { term: 'RIR', definition: 'Regional Internet Registry (LACNIC, ARIN, RIPE, APNIC, AFRINIC).' },
    ],
    stepByStepExamples: [
      {
        title: 'Clasificar la dirección 172.25.10.4',
        input: '172.25.10.4',
        steps: [
          { step: 1, name: 'Primer octeto', description: 'El primer octeto es 172. Históricamente caería en Clase B (128–191).' },
          { step: 2, name: 'Comprobar RFC 1918', description: 'El rango privado de 172 va desde 172.16.0.0 hasta 172.31.255.255. Como 25 está entre 16 y 31, es una IP PRIVADA.', highlight: 'RFC 1918' },
          { step: 3, name: 'Enrutabilidad', description: 'No puede viajar por Internet pública sin traducción NAT.' },
        ],
        result: {
          network: '172.16.0.0/12',
          broadcast: 'Privada RFC 1918',
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Creer que 172.10.0.1 o 172.35.0.1 son privadas',
        feedback: '¡Ojo! En el bloque 172 solo son privadas las que van de 172.16.0.0 a 172.31.255.255. El resto son públicas.',
      },
      {
        trap: 'Pensar que 100.64.0.0 es una IP privada de tu router',
        feedback: '100.64.0.0/10 es CGNAT del proveedor. Significa que tu ISP te tiene detrás de un doble NAT.',
      },
    ],
  },
  {
    id: 3,
    title: 'Módulo 3 — Máscaras y notación CIDR',
    subtitle: 'Los bits congelados, los 8 números mágicos y la regla de oro de los unos',
    category: 'El Método Mágico',
    badge: 'Máscaras & Saltos',
    estimatedMinutes: 20,
    xpReward: 200,
    summary:
      'Entiende de verdad qué es una máscara de subred. Conoce los 8 números mágicos que se repiten en todas las redes y la tabla de las 33 máscaras posibles.',
    interactiveType: 'cidr-slider',
    sections: [
      {
        id: 'que-es-mascara',
        title: '1. ¿Qué es una máscara y qué significa el prefijo /X?',
        content: [
          'La máscara de subred es un filtro de 32 bits que le dice al router qué parte de la IP pertenece a la red y qué parte identifica al equipo (host).',
          'Los bits en 1 representan "bits congelados de red": no pueden cambiar dentro de esa subred. Los bits en 0 representan "espacio libre para asignar a hosts".',
          'La notación CIDR simplifica la vida: en vez de escribir la larga máscara decimal "255.255.255.192", escribimos simplemente "/26", que significa "hay 26 unos consecutivos a la izquierda".',
        ],
        alerts: [
          '¡REGLA ABSOLUTA!: Los unos en una máscara SIEMPRE son contiguos de izquierda a derecha. Jamás puede haber un cero en medio de los unos (ejemplo inválido: 11111011). Cuando un octeto se llena con 8 unos llega a 255 y se pasa al siguiente.',
        ],
      },
      {
        id: 'ocho-numeros-magicos',
        title: '2. Los 8 Números Mágicos de un Octeto',
        content: [
          'Dado que los unos se van llenando de izquierda a derecha en grupos de 8 bits, en CUALQUIER octeto de una máscara SOLO pueden aparecer exactamente estos 8 valores numéricos (además del 0):',
        ],
        bullets: [
          '1 bit en 1: 10000000 = 128 (Salto = 256 - 128 = 128)',
          '2 bits en 1: 11000000 = 192 (Salto = 256 - 192 = 64)',
          '3 bits en 1: 11100000 = 224 (Salto = 256 - 224 = 32)',
          '4 bits en 1: 11110000 = 240 (Salto = 256 - 240 = 16)',
          '5 bits en 1: 11111000 = 248 (Salto = 256 - 248 = 8)',
          '6 bits en 1: 11111100 = 252 (Salto = 256 - 252 = 4)',
          '7 bits en 1: 11111110 = 254 (Salto = 256 - 254 = 2)',
          '8 bits en 1: 11111111 = 255 (Octeto congelado, salto = 1)',
        ],
        tips: [
          '¡Memoriza esta secuencia: 128, 192, 224, 240, 248, 252, 254, 255! Con ella resolverás cualquier ejercicio de subnetting en segundos.',
        ],
      },
      {
        id: 'casos-especiales-mascaras',
        title: '3. Casos especiales: /0, /31 y /32',
        content: [
          'Existen tres prefijos que tienen comportamientos particulares y preguntas frecuentes en certificaciones:',
        ],
        bullets: [
          '/0 (0.0.0.0/0): Cero bits congelados. Es la Ruta por Defecto ("Default Gateway"). Abarca la totalidad de las 4,294,967,296 direcciones IPv4 ("toda la playa de internet").',
          '/31 (RFC 3021): Máscara 255.255.255.254. Proporciona solo 2 IPs. El estándar RFC 3021 permite usarlas en enlaces punto a punto entre routers SIN reservar red ni broadcast. Las 2 IPs son hosts útiles.',
          '/32 (255.255.255.255): 32 bits congelados. Representa un Host Único (ej. interfaces loopback o rutas de host para VPN). Total de IPs = 1, útiles = 1.',
        ],
      },
    ],
    glossary: [
      { term: 'Máscara de subred', definition: 'Secuencia contigua de 32 bits que delimita la porción de red y de host.' },
      { term: 'Prefijo CIDR', definition: 'Número de bits 1 que componen la máscara (ej. /24).' },
      { term: 'Wildcard', definition: 'Inverso de la máscara (255.255.255.255 - máscara), usado en ACLs y OSPF.' },
      { term: 'RFC 3021', definition: 'Estándar que autoriza enlaces punto a punto con prefijo /31 sin pérdida de IPs.' },
    ],
    stepByStepExamples: [
      {
        title: 'Calcular la máscara decimal para un prefijo /27',
        input: 'Prefijo /27',
        steps: [
          { step: 1, name: 'Descomponer en bloques de 8', description: '27 = 8 + 8 + 8 + 3 bits.' },
          { step: 2, name: 'Convertir cada octeto', description: 'Primeros 3 octetos completos con 8 unos = 255.255.255. El 4to octeto tiene 3 unos: 11100000 = 224.' },
          { step: 3, name: 'Resultado final', description: 'Máscara decimal: 255.255.255.224.' },
        ],
        result: {
          network: '255.255.255.224',
          broadcast: 'Salto = 256 - 224 = 32',
          salto: 32,
          workingOctet: 4,
          totalHosts: 32,
          usableHosts: 30,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Poner ceros intercalados en la máscara',
        feedback: 'Los unos siempre van seguidos, de izquierda a derecha sin interrupciones.',
      },
      {
        trap: 'Confundir /27 con 224.0.0.0',
        feedback: '/27 son 27 unos (8+8+8+3), por lo que es 255.255.255.224, no 224.0.0.0.',
      },
    ],
  },
  {
    id: 4,
    title: 'Módulo 4 — El método de los 5 pasos (4to octeto: /25–/32)',
    subtitle: 'El número mágico y la metáfora de las cajas',
    category: 'El Método Mágico',
    badge: 'Método de 5 Pasos',
    estimatedMinutes: 25,
    xpReward: 250,
    summary:
      'Aprende a calcular subredes en el 4to octeto sin convertir a binario. Domina el cálculo del salto, encuentra la caja exacta donde vive la IP y determina el broadcast al instante.',
    interactiveType: 'box-4th',
    sections: [
      {
        id: 'los-5-pasos',
        title: '1. El Método Infalible de los 5 Pasos',
        content: [
          'Cualquier problema de subnetting en el mundo se resuelve aplicando con calma estos 5 pasos:',
        ],
        bullets: [
          'Paso 1: Identificar el Octeto de Trabajo. Es el octeto de la máscara que no es ni 255 ni 0. Para prefijos /25 a /32, es el 4to octeto.',
          'Paso 2: Calcular el Salto (Tamaño de la Caja). Salto = 256 - valor de la máscara en el octeto de trabajo.',
          'Paso 3: Hallar la Dirección de Red. Busca el múltiplo del salto más cercano al valor de la IP en el octeto de trabajo SIN PASARSE. Los octetos a la derecha se llenan con 0.',
          'Paso 4: Calcular la Siguiente Red. Siguiente red = dirección de red + salto (en el octeto de trabajo).',
          'Paso 5: Determinar el Broadcast y Rango Útil. Broadcast = siguiente red - 1. Rango útil va desde (red + 1) hasta (broadcast - 1).',
        ],
      },
      {
        id: 'metafora-cajas',
        title: '2. La Metáfora de "Las Cajas"',
        content: [
          'Una subred no es algo misterioso: es simplemente una caja rígida con bordes que comienzan en múltiplos fijos del salto (0, salto, 2*salto, 3*salto...).',
          'La dirección IP que te dan en un examen (ej. 192.168.1.140/27) es solo una persona que vive en una casa. Tu única tarea como ingeniero de redes es descubrir en cuál caja cayó.',
        ],
      },
    ],
    glossary: [
      { term: 'Octeto de Trabajo', definition: 'El octeto de la máscara que contiene tanto unos como ceros (ni 255 ni 0).' },
      { term: 'Salto / Número Mágico', definition: 'Diferencia (256 - máscara) que define el tamaño del bloque.' },
      { term: 'Dirección de Red', definition: 'Identificador del bloque; la primera IP del bloque (todos los bits de host en 0).' },
      { term: 'Broadcast', definition: 'Última IP del bloque (todos los bits de host en 1), reservada para difusión a todos los equipos.' },
    ],
    stepByStepExamples: [
      {
        title: 'Calcular 192.168.1.140/27',
        input: '192.168.1.140 /27',
        steps: [
          { step: 1, name: 'Octeto de trabajo', description: '/27 cae en el 4to octeto (máscara 255.255.255.224).' },
          { step: 2, name: 'Calcular el salto', description: 'Salto = 256 - 224 = 32.', highlight: 'Salto = 32' },
          { step: 3, name: 'Múltiplos del salto', description: 'Múltiplos de 32: 0, 32, 64, 96, 128, 160. Como 140 está entre 128 y 160, la red es 192.168.1.128.', highlight: '192.168.1.128' },
          { step: 4, name: 'Siguiente red', description: '128 + 32 = 160 -> Siguiente red: 192.168.1.160.', highlight: '192.168.1.160' },
          { step: 5, name: 'Broadcast y rango', description: 'Broadcast: 160 - 1 = 192.168.1.159. Rango útil: 192.168.1.129 a 192.168.1.158.', highlight: '192.168.1.159' },
        ],
        result: {
          network: '192.168.1.128',
          broadcast: '192.168.1.159',
          firstUsable: '192.168.1.129',
          lastUsable: '192.168.1.158',
          salto: 32,
          workingOctet: 4,
          totalHosts: 32,
          usableHosts: 30,
        },
      },
      {
        title: 'Calcular 10.0.0.14/30',
        input: '10.0.0.14 /30',
        steps: [
          { step: 1, name: 'Octeto de trabajo', description: '/30 -> 4to octeto (máscara 255.255.255.252).' },
          { step: 2, name: 'Calcular el salto', description: 'Salto = 256 - 252 = 4.' },
          { step: 3, name: 'Múltiplos de 4', description: '0, 4, 8, 12, 16. El número 14 cae en 12. Red: 10.0.0.12.' },
          { step: 4, name: 'Broadcast', description: 'Siguiente red: 12 + 4 = 16 -> Broadcast: 10.0.0.15.' },
        ],
        result: {
          network: '10.0.0.12',
          broadcast: '10.0.0.15',
          firstUsable: '10.0.0.13',
          lastUsable: '10.0.0.14',
          salto: 4,
          workingOctet: 4,
          totalHosts: 4,
          usableHosts: 2,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Poner la IP del host como dirección de red',
        feedback: 'Esa es la IP del equipo, no la red. Busca en qué caja de múltiplos cae.',
      },
      {
        trap: 'Error de ±1 en primera o última IP útil',
        feedback: 'Primera útil = red + 1; última útil = broadcast - 1.',
      },
    ],
  },
  {
    id: 5,
    title: 'Módulo 5 — Subiendo de nivel: 3er octeto (/17–/24)',
    subtitle: 'La metáfora de los pisos y redes con ceros intermedios',
    category: 'El Método Mágico',
    badge: '3er Octeto & Pisos',
    estimatedMinutes: 25,
    xpReward: 250,
    summary:
      'Aprende a calcular redes empresariales medianas. Descubre por qué la red siempre termina en .0 y el broadcast en .255, y desmitifica por qué una IP terminada en .0 puede ser un host perfectamente válido.',
    interactiveType: 'floors-3rd',
    sections: [
      {
        id: 'reglas-3er-octeto',
        title: '1. El 3er Octeto y la Regla del Cero y el 255',
        content: [
          'Cuando el prefijo está entre /17 y /24, el octeto de trabajo es el 3ro. En la máscara, el 4to octeto es completamente 0 (ej. 255.255.252.0 en un /22).',
          'Esto implica dos leyes inmutables:',
          '1) La dirección de red SIEMPRE termina en .0 en su 4to octeto (ej. 172.16.64.0).',
          '2) La dirección de broadcast SIEMPRE termina en .255 en su 4to octeto (ej. 172.16.67.255).',
        ],
        alerts: [
          '¡Mito desmentido!: Muchos estudiantes creen que una IP terminada en .0 nunca puede asignarse a una PC. ¡FALSO! En una red /22 como 172.16.64.0/22, la dirección 172.16.65.0 es un host útil completamente válido, igual que 172.16.66.255. Solo la primera IP de todo el bloque (.64.0) y la última (.67.255) están reservadas.',
        ],
      },
      {
        id: 'metafora-pisos',
        title: '2. La Metáfora de "Los Pisos"',
        content: [
          'Cuando el salto ocurre en el 3er octeto, cada unidad del salto representa un "piso" completo de 256 IPs en el 4to octeto.',
          'Por ejemplo, en un /22 el salto es 4. Eso significa que la caja tiene 4 pisos completos: el piso 64 (256 IPs), el piso 65 (256 IPs), el piso 66 (256 IPs) y el piso 67 (256 IPs). Total = 4 × 256 = 1,024 direcciones.',
        ],
      },
    ],
    glossary: [
      { term: 'Pisos de Subred', definition: 'Cada incremento en el 3er octeto abarca 256 combinaciones completas en el 4to octeto.' },
      { term: 'Host con .0 final', definition: 'IP utilizable cuyo último octeto es 0 pero que no coincide con el inicio de la superred.' },
    ],
    stepByStepExamples: [
      {
        title: 'Calcular 172.16.67.85/22',
        input: '172.16.67.85 /22',
        steps: [
          { step: 1, name: 'Octeto de trabajo', description: '/22 -> 3er octeto (máscara 255.255.252.0).' },
          { step: 2, name: 'Salto', description: 'Salto = 256 - 252 = 4 (en el 3er octeto).', highlight: 'Salto = 4' },
          { step: 3, name: 'Caja del 3er octeto', description: 'El 3er octeto de la IP es 67. Múltiplos de 4: 56, 60, 64, 68... 67 cae en 64. Ponemos 0 en el 4to octeto -> Red: 172.16.64.0.', highlight: '172.16.64.0' },
          { step: 4, name: 'Siguiente red', description: 'Sumar el salto en el 3er octeto: 64 + 4 = 68 -> Siguiente red: 172.16.68.0.', highlight: '172.16.68.0' },
          { step: 5, name: 'Broadcast', description: 'Restar 1 a la siguiente red: 172.16.67.255.', highlight: '172.16.67.255' },
        ],
        result: {
          network: '172.16.64.0',
          broadcast: '172.16.67.255',
          firstUsable: '172.16.64.1',
          lastUsable: '172.16.67.254',
          salto: 4,
          workingOctet: 3,
          totalHosts: 1024,
          usableHosts: 1022,
        },
      },
      {
        title: 'Calcular 10.200.173.45/20',
        input: '10.200.173.45 /20',
        steps: [
          { step: 1, name: 'Octeto y máscara', description: '/20 -> 3er octeto (máscara 255.255.240.0).' },
          { step: 2, name: 'Salto', description: 'Salto = 256 - 240 = 16.' },
          { step: 3, name: 'Caja', description: 'Múltiplos de 16: 144, 160, 176... 173 cae en 160 -> Red: 10.200.160.0.' },
          { step: 4, name: 'Siguiente red y broadcast', description: 'Siguiente: 10.200.176.0. Broadcast: 10.200.175.255.' },
        ],
        result: {
          network: '10.200.160.0',
          broadcast: '10.200.175.255',
          firstUsable: '10.200.160.1',
          lastUsable: '10.200.175.254',
          salto: 16,
          workingOctet: 3,
          totalHosts: 4096,
          usableHosts: 4094,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Arrastrar el 4to octeto de la IP a la red (ej. 172.16.64.85)',
        feedback: 'En la red, todos los octetos a la derecha del octeto de trabajo se rellenan con 0.',
      },
      {
        trap: 'Sumar el salto en el 4to octeto en vez del 3ro',
        feedback: 'El salto se suma exclusivamente en el octeto de trabajo (el 3ro en este caso).',
      },
    ],
  },
  {
    id: 6,
    title: 'Módulo 6 — Nivel arquitecto: 2do y 1er octeto (/1–/16)',
    subtitle: 'Mega-redes, saltos intergalácticos y el origen matemático del enrutamiento',
    category: 'El Método Mágico',
    badge: 'Nivel Arquitecto',
    estimatedMinutes: 25,
    xpReward: 300,
    summary:
      'Calcula redes que abarcan millones de dispositivos (/8, /11, /13, /6). Aprende por qué /1 es la base del árbol binario de decisiones de todo router.',
    interactiveType: 'architect-octets',
    sections: [
      {
        id: 'segundo-octeto',
        title: '1. El 2do Octeto (/9 a /16): Redes que terminan en .0.0',
        content: [
          'Cuando el prefijo está entre /9 y /16, el octeto de trabajo es el 2do. Los octetos 3 y 4 de la máscara son 0.0.',
          'Por lo tanto, la dirección de red termina obligatoriamente en .0.0 y el broadcast en .255.255.',
          'Ejemplo: 10.75.140.23/13. Máscara: 255.248.0.0. Salto = 256 - 248 = 8 en el 2do octeto. El 75 cae en 72. Red: 10.72.0.0. Siguiente red: 10.80.0.0. Broadcast: 10.79.255.255.',
        ],
      },
      {
        id: 'primer-octeto',
        title: '2. El 1er Octeto (/1 a /8): Redes que abarcan medio Internet',
        content: [
          'En el 1er octeto (/1 a /8), los octetos 2, 3 y 4 terminan en .0.0.0 y los broadcasts en .255.255.255.',
          'Ejemplo: 185.120.45.19/6. Máscara: 252.0.0.0. Salto = 256 - 252 = 4 en el 1er octeto. El 185 cae en 184. Red: 184.0.0.0. Broadcast: 187.255.255.255.',
        ],
      },
      {
        id: 'origen-prefijo-1',
        title: '3. El Prefijo /1 y el Árbol Binario de Enrutamiento',
        content: [
          '¿Por qué /1 es el nacimiento de toda decisión de un router? Porque con un solo bit de red solo existen dos opciones en todo el universo IPv4:',
          '1) Red 0.0.0.0/1: el primer bit es 0 (abarca de la 0.0.0.0 a la 127.255.255.255).',
          '2) Red 128.0.0.0/1: el primer bit es 1 (abarca de la 128.0.0.0 a la 255.255.255.255).',
          'Cada bit adicional divide el espacio a la mitad, creando un árbol binario perfecto.',
        ],
      },
    ],
    glossary: [
      { term: 'Mega-red', definition: 'Bloque con prefijo menor a /16 que agrupa cientos de miles o millones de IPs.' },
      { term: 'Árbol Binario (Trie)', definition: 'Estructura de datos con la que las tablas de rutas de los routers indexan los prefijos.' },
    ],
    stepByStepExamples: [
      {
        title: 'Calcular 10.145.200.89/11',
        input: '10.145.200.89 /11',
        steps: [
          { step: 1, name: 'Octeto de trabajo', description: '/11 -> 2do octeto (máscara 255.224.0.0).' },
          { step: 2, name: 'Salto', description: 'Salto = 256 - 224 = 32 en el 2do octeto.' },
          { step: 3, name: 'Caja del 2do octeto', description: 'El 2do octeto es 145. Múltiplos de 32: 0, 32, 64, 96, 128, 160. Cae en 128 -> Red: 10.128.0.0.' },
          { step: 4, name: 'Broadcast', description: 'Siguiente red: 10.160.0.0 -> Broadcast: 10.159.255.255.' },
        ],
        result: {
          network: '10.128.0.0',
          broadcast: '10.159.255.255',
          firstUsable: '10.128.0.1',
          lastUsable: '10.159.255.254',
          salto: 32,
          workingOctet: 2,
          totalHosts: 2097152,
          usableHosts: 2097150,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Olvidar poner .0.0 en los octetos derecho de la red',
        feedback: 'Si el octeto de trabajo es el 2do, los octetos 3 y 4 se llenan con 0 en la red y con 255 en el broadcast.',
      },
    ],
  },
  {
    id: 7,
    title: 'Módulo 7 — Subnetting (FLSM)',
    subtitle: 'Partición simétrica de redes: fórmulas de subredes y hosts',
    category: 'Diseño de Red',
    badge: 'Subnetting FLSM',
    estimatedMinutes: 20,
    xpReward: 200,
    summary:
      'Divide una red base en N porciones idénticas. Aprende las dos fórmulas clave: pedir bits prestados para subredes o para cantidad de hosts.',
    interactiveType: 'flsm-sim',
    sections: [
      {
        id: 'que-es-flsm',
        title: '1. Fixed Length Subnet Mask (FLSM)',
        content: [
          'FLSM consiste en tomar una red grande y picarla en subredes de exactamente el mismo tamaño, todas con la misma máscara.',
          'Es el método clásico para diseñar redes sencillas donde todos los departamentos tienen requerimientos similares.',
        ],
      },
      {
        id: 'las-dos-formulas',
        title: '2. Las Dos Fórmulas Clave',
        content: [
          'Dependiendo de lo que te pida el ejercicio o el cliente, usas una de estas dos fórmulas:',
        ],
        bullets: [
          'Fórmula A (Quiero N subredes): Bits prestados b = ceil(log2(N)). Nuevo prefijo = prefijo base + b.',
          'Fórmula B (Quiero H hosts por subred): Bits de host h = ceil(log2(H + 2)). Nuevo prefijo = 32 - h.',
        ],
        tips: [
          '¡Siempre suma +2 al calcular para hosts! Porque necesitas reservar la dirección de red y la de broadcast.',
        ],
      },
    ],
    glossary: [
      { term: 'FLSM', definition: 'Fixed Length Subnet Mask (todas las subredes comparten la misma máscara).' },
      { term: 'Bits prestados', definition: 'Bits que antes pertenecían a host y ahora se asignan a la porción de red.' },
    ],
    stepByStepExamples: [
      {
        title: 'Dividir 192.168.1.0/24 en 4 subredes',
        input: '192.168.1.0/24 -> 4 subredes',
        steps: [
          { step: 1, name: 'Bits prestados', description: '2^b >= 4 -> b = 2 bits.' },
          { step: 2, name: 'Nuevo prefijo', description: '/24 + 2 = /26 (máscara 255.255.255.192).' },
          { step: 3, name: 'Salto', description: '256 - 192 = 64. Cada subred tiene 64 IPs (62 útiles).' },
          { step: 4, name: 'Subredes generadas', description: 'Subred 1: 192.168.1.0/26 | Subred 2: 192.168.1.64/26 | Subred 3: 192.168.1.128/26 | Subred 4: 192.168.1.192/26.' },
        ],
        result: {
          network: '192.168.1.0/26',
          broadcast: '192.168.1.255',
          salto: 64,
          totalHosts: 256,
          usableHosts: 248,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Olvidar el +2 al calcular bits de host',
        feedback: 'Siempre debes sumar 2 a la cantidad de hosts pedidos (para la red y el broadcast).',
      },
    ],
  },
  {
    id: 8,
    title: 'Módulo 8 — VLSM (Variable Length Subnet Mask)',
    subtitle: 'El estándar de la industria: máxima eficiencia sin desperdicio',
    category: 'Diseño de Red',
    badge: 'Diseño VLSM',
    estimatedMinutes: 30,
    xpReward: 300,
    summary:
      'Aprende a diseñar una red corporativa real con departamentos de distintos tamaños. Domina el algoritmo de ordenamiento y elimina el desperdicio de direcciones.',
    interactiveType: 'vlsm-sim',
    sections: [
      {
        id: 'por-que-vlsm',
        title: '1. ¿Por qué VLSM ahorra hasta un 90% de direcciones?',
        content: [
          'En una empresa real, los requerimientos son desiguales: Ventas puede tener 100 empleados, Contabilidad 20 y un enlace punto a punto entre routers necesita solo 2 IPs.',
          'Con FLSM, estarías obligado a darle una caja de 128 IPs al enlace punto a punto, desperdiciando 126 direcciones. VLSM permite asignar a cada departamento una máscara distinta adaptada a su tamaño exacto.',
        ],
      },
      {
        id: 'algoritmo-vlsm',
        title: '2. El Algoritmo Dorado de VLSM',
        content: [
          'Para que VLSM no tenga solapamientos ni errores, se sigue estrictamente este procedimiento:',
        ],
        bullets: [
          '1. ORDENAR siempre los requerimientos de MAYOR a MENOR número de hosts.',
          '2. Calcular para cada uno el prefijo más ajustado que cumpla: 32 - ceil(log2(hosts + 2)).',
          '3. Asignar la primera subred en la dirección base.',
          '4. La siguiente subred comienza EXACTAMENTE en: broadcast de la anterior + 1.',
          '5. Repetir hasta asignar todas las subredes.',
        ],
        alerts: [
          '¡ERROR FATAL!: Si no ordenas de mayor a menor, las cajas grandes romperán la alineación natural de los múltiplos del salto y provocarán solapamientos catastróficos.',
        ],
      },
    ],
    glossary: [
      { term: 'VLSM', definition: 'Variable Length Subnet Mask (cada subred tiene un tamaño y prefijo ajustado a su necesidad).' },
      { term: 'Solapamiento (Overlap)', definition: 'Conflicto donde dos subredes comparten el mismo rango de IPs.' },
      { term: 'Desperdicio', definition: 'Diferencia entre las IPs útiles disponibles y las requeridas por el cliente.' },
    ],
    stepByStepExamples: [
      {
        title: 'Caso Empresa: 192.168.10.0/24 (Ventas 100, TI 50, Enlace 2)',
        input: 'Base 192.168.10.0/24',
        steps: [
          { step: 1, name: 'Ordenar', description: '1. Ventas (100) -> 2. TI (50) -> 3. Enlace WAN (2).' },
          { step: 2, name: 'Ventas (100 hosts)', description: 'Necesita bloque de 128 (prefijo /25). Red: 192.168.10.0/25. Broadcast: 192.168.10.127.' },
          { step: 3, name: 'TI (50 hosts)', description: 'Empieza en 192.168.10.128. Necesita bloque de 64 (prefijo /26). Red: 192.168.10.128/26. Broadcast: 192.168.10.191.' },
          { step: 4, name: 'Enlace WAN (2 hosts)', description: 'Empieza en 192.168.10.192. Necesita bloque de 4 (prefijo /30). Red: 192.168.10.192/30. Broadcast: 192.168.10.195.' },
          { step: 5, name: 'Espacio libre', description: 'Queda libre desde 192.168.10.196 hasta 192.168.10.255 (60 IPs para crecimiento).' },
        ],
        result: {
          network: '192.168.10.0',
          broadcast: '192.168.10.255',
          totalHosts: 256,
          usableHosts: 190,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Asignar requerimientos sin ordenarlos de mayor a menor',
        feedback: 'Siempre debes ordenar de mayor a menor. Si asignas una subred pequeña antes que una grande, romperás los límites del salto.',
      },
    ],
  },
  {
    id: 9,
    title: 'Módulo 9 — Enrutamiento y sumarización',
    subtitle: 'Tablas de rutas, Longest Prefix Match, el truco VPN y BGP',
    category: 'Avanzado & IPv6',
    badge: 'Enrutamiento Pro',
    estimatedMinutes: 25,
    xpReward: 250,
    summary:
      'Descubre cómo los routers eligen la mejor ruta, cómo resumir decenas de rutas en una sola superred y el límite de /24 en la tabla BGP de Internet.',
    interactiveType: 'summarize-sim',
    sections: [
      {
        id: 'longest-prefix-match',
        title: '1. Longest Prefix Match: La regla suprema de decisión',
        content: [
          'Cuando un router recibe un paquete, busca en su tabla de rutas la coincidencia más específica (el prefijo más largo).',
          'Si tiene una ruta hacia 10.0.0.0/8 y otra hacia 10.1.2.0/24, y llega un paquete para 10.1.2.55, el router SIEMPRE enviará el tráfico por la ruta /24 porque es más precisa.',
        ],
        tips: [
          'El truco maestro de las VPN: Para secuestrar todo el tráfico de una PC sin borrar la ruta por defecto original 0.0.0.0/0, las VPNs instalan dos rutas /1: 0.0.0.0/1 y 128.0.0.0/1. Como /1 es más específico que /0, el router de tu computadora les da prioridad absoluta.',
        ],
      },
      {
        id: 'sumarizacion',
        title: '2. Sumarización de rutas (Supernetting)',
        content: [
          'Consiste en tomar múltiples rutas pequeñas y unificarlas en un único prefijo representativo para reducir el tamaño de las tablas de rutas.',
          'Regla: Convierte las redes a binario, identifica cuántos bits comparten exactamente desde la izquierda, y ese número es tu nuevo prefijo sumarizado.',
        ],
      },
      {
        id: 'bgp-limite-24',
        title: '3. BGP y el límite de /24 en Internet',
        content: [
          'En la Internet global (DFZ - Default-Free Zone), los routers troncales solo aceptan prefijos de hasta /24.',
          'Si intentas anunciar un /25 o /28 por BGP público, los proveedores lo filtrarán de inmediato para evitar que la tabla global (que ya supera las 950,000 rutas) sature la memoria física de los routers.',
        ],
      },
    ],
    glossary: [
      { term: 'Longest Prefix Match', definition: 'Criterio por el cual el router selecciona la ruta con el prefijo más largo (más específico).' },
      { term: 'Sumarización / Superred', definition: 'Agrupación de subredes contiguas en un solo anuncio de prefijo menor.' },
      { term: 'BGP (Border Gateway Protocol)', definition: 'Protocolo de enrutamiento que conecta los Sistemas Autónomos de todo Internet.' },
      { term: 'RPKI', definition: 'Marco criptográfico que valida que un Sistema Autónomo realmente es dueño del prefijo que anuncia.' },
    ],
    stepByStepExamples: [
      {
        title: 'Sumarizar 192.168.0.0/24, 192.168.1.0/24, 192.168.2.0/24 y 192.168.3.0/24',
        input: '4 subredes /24 contiguas',
        steps: [
          { step: 1, name: 'Analizar el 3er octeto', description: '0 = 00000000 | 1 = 00000001 | 2 = 00000010 | 3 = 00000011.' },
          { step: 2, name: 'Bits comunes', description: 'Los primeros 6 bits del 3er octeto son idénticos (000000).' },
          { step: 3, name: 'Prefijo resultante', description: '8 + 8 + 6 = 22 bits comunes -> Prefijo /22.' },
          { step: 4, name: 'Superred', description: '192.168.0.0/22 engloba exactamente las 4 redes.' },
        ],
        result: {
          network: '192.168.0.0/22',
          broadcast: '192.168.3.255',
          totalHosts: 1024,
          usableHosts: 1022,
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Sumarizar redes no contiguas',
        feedback: 'Si las redes no son potencias de 2 contiguas, la superred abarcará rangos adicionales no deseados.',
      },
    ],
  },
  {
    id: 10,
    title: 'Módulo 10 — IPv6 esencial',
    subtitle: '128 bits, hexadecimal, adiós a NAT y subnetting por nibbles',
    category: 'Avanzado & IPv6',
    badge: 'El Futuro es Hoy',
    estimatedMinutes: 25,
    xpReward: 300,
    summary:
      'Domina el direccionamiento de 128 bits: compresión RFC 5952, tipos de direcciones (GUA, ULA, Link-Local), asignación por nibbles y cómo funciona Internet sin NAT.',
    interactiveType: 'ipv6-nibbles',
    sections: [
      {
        id: 'estructura-ipv6',
        title: '1. 128 bits y notación hexadecimal',
        content: [
          'IPv6 soluciona para siempre la escasez de direcciones: tiene 128 bits (340 sextillones de direcciones).',
          'Se escribe en 8 grupos de 4 caracteres hexadecimales (hextetos) separados por dos puntos.',
          'Las dos reglas de oro de compresión (RFC 5952):',
        ],
        bullets: [
          'Regla 1: Omitir ceros a la izquierda dentro de cualquier hexteto (:0042: se escribe :42:).',
          'Regla 2: Reemplazar el bloque más largo de hextetos con ceros consecutivos por "::". ¡SOLO UNA VEZ en toda la dirección para evitar ambigüedades!',
        ],
      },
      {
        id: 'tipos-ipv6',
        title: '2. Tipos de direcciones IPv6',
        content: [
          'A diferencia de IPv4, en IPv6 cada tarjeta de red tiene múltiples direcciones al mismo tiempo:',
        ],
        bullets: [
          'GUA (Global Unicast Address): 2000::/3. Son las IPs públicas enrutables en todo el planeta.',
          'ULA (Unique Local Address): fc00::/7 (usualmente fd00::). Son las privadas para comunicación interna en tu red corporativa.',
          'Link-Local: fe80::/10. Obligatorias en cada interfaz activa; solo funcionan dentro del mismo cable/switch.',
          'Multicast: ff00::/8. Reemplaza por completo el broadcast de IPv4 (en IPv6 NO existe broadcast).',
          'Loopback: ::1/128.',
        ],
      },
      {
        id: 'jerarquia-nibbles',
        title: '3. Jerarquía y Subnetting por Nibbles',
        content: [
          'Un nibble son 4 bits, lo que equivale exactamente a un carácter hexadecimal (0 a f).',
          'La jerarquía estándar de Internet es:',
          '1) IANA entrega un /12 al RIR (LACNIC tiene 2800::/12, ARIN 2600::/12, etc.).',
          '2) El RIR entrega un /32 al ISP.',
          '3) El ISP entrega un /48 o /56 a la empresa o casa (vía DHCPv6-PD).',
          '4) Cada subred de usuario es SIEMPRE un /64.',
        ],
        tips: [
          'En IPv6 NO necesitas calcular saltos binarios complejos: cambiar de subred /64 es tan simple como sumar 1 al hexteto de subred (ej. 2001:db8:1::/64 -> 2001:db8:2::/64 -> 2001:db8:3::/64).',
        ],
      },
      {
        id: 'adios-nat',
        title: '4. Sin NAT: Seguridad por Firewall y Pinholing',
        content: [
          'En IPv6 cada dispositivo tiene su propia IP pública global. ¡No existe NAT ni CGNAT residencial!',
          'La seguridad no depende de ocultar la IP, sino del firewall stateful de tu router que bloquea todas las conexiones entrantes no solicitadas y solo permite el paso mediante "pinholing" autorizado.',
        ],
      },
    ],
    glossary: [
      { term: 'Hexteto', definition: 'Grupo de 16 bits (4 caracteres hexadecimales) delimitado por dos puntos.' },
      { term: 'GUA (Global Unicast)', definition: 'Dirección pública enrutable globalmente (prefijo 2000::/3).' },
      { term: 'ULA (Unique Local)', definition: 'Dirección privada para redes locales (prefijo fc00::/7).' },
      { term: 'Link-Local', definition: 'Dirección válida únicamente dentro del enlace físico local (prefijo fe80::/10).' },
      { term: 'SLAAC', definition: 'Autoconfiguración de dirección sin estado (RFC 4862) nativa de IPv6.' },
      { term: 'DHCPv6-PD', definition: 'Prefix Delegation: protocolo por el cual el ISP delega un bloque /56 o /48 a tu router.' },
    ],
    stepByStepExamples: [
      {
        title: 'Comprimir 2001:0db8:0000:0000:0000:0000:1428:57ab',
        input: '2001:0db8:0000:0000:0000:0000:1428:57ab',
        steps: [
          { step: 1, name: 'Quitar ceros iniciales', description: '2001:db8:0:0:0:0:1428:57ab' },
          { step: 2, name: 'Aplicar :: al grupo más largo', description: 'Hay 4 hextetos de ceros seguidos -> se reemplazan por "::".' },
          { step: 3, name: 'Resultado oficial RFC 5952', description: '2001:db8::1428:57ab' },
        ],
        result: {
          network: '2001:db8::/64',
          broadcast: 'No hay broadcast en IPv6',
        },
      },
    ],
    trapsAndFeedback: [
      {
        trap: 'Usar "::" dos veces en la misma dirección (ej. 2001::db8::1)',
        feedback: 'El doble punto "::" solo puede usarse UNA SOLA VEZ. Si se usa dos veces, es imposible saber cuántos ceros corresponden a cada lado.',
      },
    ],
  },
];
