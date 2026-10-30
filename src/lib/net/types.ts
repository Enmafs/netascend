export type WorkingOctet = 1 | 2 | 3 | 4;

export type IPClass = 'A' | 'B' | 'C' | 'D' | 'E';

export type IPScope =
  | 'Privada (RFC 1918)'
  | 'Pública'
  | 'CGNAT (RFC 6598)'
  | 'Loopback'
  | 'Link-Local'
  | 'Multicast'
  | 'Reservada (Clase E)';

export interface IPv4SubnetResult {
  ip: string;
  prefix: number;
  maskDecimal: string;
  /** Formato `11111111.11111111.11111111.11100000` */
  maskBinary: string;
  wildcardDecimal: string;
  /** Octeto de la máscara que no es ni 255 ni 0 (o el último si la máscara es "limpia"). */
  workingOctet: WorkingOctet;
  /** Tamaño de bloque: 256 - valor de la máscara en el octeto de trabajo. */
  salto: number;
  networkAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  broadcastAddress: string;
  /** Dirección de la siguiente red. Si no existe (red termina en 255.255.255.255) es `null`. */
  nextNetworkAddress: string | null;
  totalIPs: number;
  usableHosts: number;
  ipClass: IPClass;
  scope: IPScope;
}

export interface VLSMRequirement {
  name: string;
  hosts: number;
}

export interface VLSMRequest {
  /** Red base, ej. `192.168.1.0/24`. */
  baseNetwork: string;
  requirements: VLSMRequirement[];
}

export interface VLSMSubnetResult {
  name: string;
  hostsRequested: number;
  hostsAvailable: number;
  prefix: number;
  maskDecimal: string;
  networkAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  broadcastAddress: string;
  totalIPs: number;
  /** IPs útiles que sobran respecto a lo pedido. */
  wastedHosts: number;
}

export interface VLSMSummary {
  baseNetwork: string;
  baseTotalIPs: number;
  allocatedIPs: number;
  /** IPs de la red base que quedaron sin asignar. */
  freeIPs: number;
  /** Suma de `wastedHosts` de todas las subredes. */
  wastedHosts: number;
  /** Primera dirección libre tras la última subred, o `null` si no queda espacio. */
  nextFreeAddress: string | null;
}

export interface VLSMResult {
  subnets: VLSMSubnetResult[];
  summary: VLSMSummary;
}

export interface VLSMOptions {
  /**
   * Si es `true`, un requerimiento de exactamente 2 hosts usa /31 (RFC 3021).
   * Por defecto es `false` y se usa el /30 clásico.
   */
  allowPointToPoint31?: boolean;
}
