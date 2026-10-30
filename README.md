# NetAscend — Domina el Direccionamiento IP, el Método del Salto y VLSM

**NetAscend** es una plataforma web interactiva y gamificada diseñada para llevar a estudiantes e ingenieros de redes desde los fundamentos del sistema binario hasta el nivel experto (CCNA / CCNP) en cálculo de subredes IPv4, diseño jerárquico FLSM/VLSM, sumarización de rutas BGP/OSPF y direccionamiento IPv6.

Construida como una aplicación 100% estática y autónoma en memoria (sin bases de datos, sin cuentas de usuario ni almacenamiento persistente en disco), lista para desplegarse instantáneamente en **Vercel**.

---

## Características Principales

### 1. Academia Interactiva (10 Módulos Progresivos)
Cada módulo incluye teoría estructurada, el **Método del Salto en 5 Pasos**, analogías visuales (*La Barra de Cajas* y *Pisos de Edificios*), alertas de **Trampas de Examen**, **Laboratorio Interactivo** en vivo y **Cuestionario Procedural Adaptativo**:
- **Módulo 1:** El Lenguaje Binario de las Redes (Los 8 interruptores: `128, 64, 32, 16, 8, 4, 2, 1`).
- **Módulo 2:** Anatomía de una Dirección IPv4 (Clases A–E, RFC 1918, Loopback, APIPA, CGNAT `100.64.0.0/10`).
- **Módulo 3:** La Máscara de Subred y Notación CIDR (`/0` a `/32` y la Tabla Maestra de los 8 valores: `128, 192, 224, 240, 248, 252, 254, 255`).
- **Módulo 4:** El Método del Salto y las Cajas — 4to Octeto (`/25` a `/32`, incluyendo casos especiales RFC 3021 `/31` y Host Route `/32`).
- **Módulo 5:** El Salto en el 3er Octeto (`/17` a `/24` — La regla de los "Pisos").
- **Módulo 6:** Grandes Redes — 1er y 2do Octeto (`/1` a `/16` — Infraestructura ISP y corporativa).
- **Módulo 7:** Subnetting de Tamaño Fijo (FLSM) por requerimiento de subredes ($2^n \ge S$) o de hosts ($2^h - 2 \ge H$).
- **Módulo 8:** VLSM (Máscara de Subred de Longitud Variable) — Algoritmo de ordenamiento de mayor a menor sin solapamiento.
- **Módulo 9:** Sumarización de Rutas (Supernetting) y *Longest Prefix Match (LPM)*.
- **Módulo 10:** Fundamentos de IPv6 para Subnetting (128 bits, compresión RFC 5952, prefijo `2800::/12` LACNIC, subredes `/64` y EUI-64).

### 2. Calculadora Profesional de 6 Pestañas
Acceso libre desde cualquier punto de la aplicación:
1. **Subred IPv4 (`/0` a `/32`):** Red, Primera IP, Última IP, Broadcast, Máscara Decimal/Binaria, Wildcard, Octeto de trabajo, Salto, Visualizador de Cajas (`BoxVisualizer`) y Desglose Paso a Paso.
2. **Subnetting FLSM:** División en bloques iguales con paginación y exportación CSV.
3. **Diseñador VLSM:** Asignación jerárquica de subredes con barra proporcional de espacio ocupado vs. libre, alertas de desbordamiento y exportación CSV.
4. **Sumarización de Rutas:** Cálculo del prefijo común más largo (*Longest Common Prefix*) y advertencia de rutas adicionales cubiertas.
5. **Calculadora IPv6:** Expansión y compresión RFC 5952, clasificación de alcance (GUA, ULA, Link-Local, Multicast), detección de RIR (`2800::/12` LACNIC, `2600::/12` ARIN, `2a00::/12` RIPE, `2400::/12` APNIC, `2c00::/12` AFRINIC) y generador SLAAC EUI-64.
6. **Conversor Binario / Decimal / Hex:** Conversión bidireccional de 32 bits e interruptores binarios interactivos.

### 3. Motor de Quizzes Procedurales y Examen Final de Certificación
- **Generación Procedural Infinita:** Ningún intento repite un banco estático; las IPs, prefijos y topologías VLSM se generan matemáticamente en tiempo real.
- **Detección de Trampas Comunes:** Identifica al instante si el estudiante olvidó restar 2 (`2^h` vs `2^h - 2`), si confundió la IP de Red con la Primera IP útil, o si ingresó la Primera IP de la caja siguiente en vez del Broadcast.
- **Certificación NetAscend (25 Preguntas):** Evaluación global cronometrada (45 min) o libre a través de 5 dominios técnicos. Al aprobar con $\ge 85\%$, genera un **Certificado Oficial descargable en PNG de alta resolución (2x)** mediante `html-to-image`.

---

## El Método del Salto en 5 Pasos

NetAscend enseña a resolver cualquier dirección IP sin convertir toda la dirección a binario:

1. **Identificar el Octeto de Trabajo:**
   - `/1` a `/8` $\rightarrow$ **1er octeto**
   - `/9` a `/16` $\rightarrow$ **2do octeto**
   - `/17` a `/24` $\rightarrow$ **3er octeto**
   - `/25` a `/32` $\rightarrow$ **4to octeto**
2. **Obtener el Valor Decimal de la Máscara en ese Octeto:**
   - Contar los bits encendidos dentro del octeto activo ($1 \to 128$, $2 \to 192$, $3 \to 224$, $4 \to 240$, $5 \to 248$, $6 \to 252$, $7 \to 254$, $8 \to 255$).
3. **Calcular el Salto (Tamaño de Caja):**
   $$\text{Salto} = 256 - \text{Valor de la Máscara en el Octeto de Trabajo}$$
4. **Ubicar la Caja (Dirección de Red):**
   $$\text{Base de la Caja} = \left\lfloor \frac{\text{Valor de la IP en el Octeto}}{\text{Salto}} \right\rfloor \times \text{Salto}$$
   *(Los octetos a la derecha del octeto de trabajo se ponen en `0` para la Red).*
5. **Cerrar la Caja (Dirección de Broadcast y Rango Útil):**
   - **Broadcast en el octeto de trabajo:** $\text{Base de la Caja} + \text{Salto} - 1$ *(y `255` en todos los octetos a la derecha)*.
   - **Primera IP Utilizable:** Dirección de Red $+ 1$.
   - **Última IP Utilizable:** Dirección de Broadcast $- 1$.

---

## Casos de Control Matemáticos Verificados

El motor matemático (`src/lib/net/`) está validado con pruebas unitarias automatizadas en Vitest, incluyendo los 8 casos de control oficiales:

| # | Entrada | Máscara Decimal | Octeto | Salto | Dirección de Red | Primera IP Útil | Última IP Útil | Broadcast | Hosts Útiles |
|---|---------|----------------|--------|-------|------------------|-----------------|----------------|-----------|--------------|
| 1 | `192.168.1.0/24` | `255.255.255.0` | 3 | 1 | `192.168.1.0` | `192.168.1.1` | `192.168.1.254` | `192.168.1.255` | `254` |
| 2 | `192.168.1.75/26` | `255.255.255.192` | 4 | 64 | `192.168.1.64` | `192.168.1.65` | `192.168.1.126` | `192.168.1.127` | `62` |
| 3 | `192.168.1.200/27` | `255.255.255.224` | 4 | 32 | `192.168.1.192` | `192.168.1.193` | `192.168.1.222` | `192.168.1.223` | `30` |
| 4 | `10.10.10.5/30` | `255.255.255.252` | 4 | 4 | `10.10.10.4` | `10.10.10.5` | `10.10.10.6` | `10.10.10.7` | `2` |
| 5 | `172.16.50.10/20` | `255.255.240.0` | 3 | 16 | `172.16.48.0` | `172.16.48.1` | `172.16.63.254` | `172.16.63.255` | `4,094` |
| 6 | `10.50.120.7/13` | `255.248.0.0` | 2 | 8 | `10.48.0.0` | `10.48.0.1` | `10.55.255.254` | `10.55.255.255` | `524,286` |
| 7 | `10.0.0.4/31` | `255.255.255.254` | 4 | 2 | `10.0.0.4` | `10.0.0.4` | `10.0.0.5` | `N/A (RFC 3021)` | `2 (P2P)` |
| 8 | `10.0.0.9/32` | `255.255.255.255` | 4 | 1 | `10.0.0.9` | `10.0.0.9` | `10.0.0.9` | `N/A (Host Route)` | `1` |

---

## Instalación y Ejecución Local

### Requisitos previos
- **Node.js** 18+ y **npm** 9+

### Comandos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (Vite HMR)
npm run dev

# 3. Ejecutar suite completa de pruebas unitarias (Vitest)
npm test

# 4. Compilar versión optimizada de producción
npm run build

# 5. Previsualizar build de producción localmente
npm run preview
```

---

## Despliegue en Vercel

El proyecto incluye el archivo `vercel.json` preconfigurado para enrutamiento SPA estático:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Pasos para desplegar:
1. Sube este repositorio a **GitHub**, **GitLab** o **Bitbucket**.
2. Ingresa a [vercel.com](https://vercel.com/) y selecciona **"Add New Project"**.
3. Importa el repositorio: Vercel detectará automáticamente **Vite** (`Build Command: npm run build`, `Output Directory: dist`).
4. Haz clic en **Deploy** (no requiere variables de entorno).
