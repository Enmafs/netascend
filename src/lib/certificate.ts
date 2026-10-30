import { toPng } from 'html-to-image';

/**
 * Genera un código único de verificación alfanumérico en el formato NA-CCNA-XXXXX
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NA-CCNA-${suffix}`;
}

/**
 * Normaliza el nombre del estudiante para crear un nombre de archivo seguro.
 */
export function formatCertificateFilename(studentName: string): string {
  const cleaned = studentName
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const safeName = cleaned || 'Estudiante';
  return `Certificado_NetAscend_${safeName}.png`;
}

/**
 * Renderiza el nodo DOM del certificado a una imagen PNG de alta resolución (2x)
 * y dispara su descarga directa en el navegador.
 */
export async function downloadCertificatePng(
  element: HTMLElement,
  studentName: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#0b0f19',
  });

  const link = document.createElement('a');
  link.download = formatCertificateFilename(studentName);
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
