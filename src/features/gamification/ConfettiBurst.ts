import confetti from 'canvas-confetti';

/**
 * Verifica si estamos en un entorno de navegador con soporte de Canvas
 * para evitar errores en SSR o durante ejecuciones de pruebas unitarias (Vitest).
 */
function canFireConfetti(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined'
  );
}

/**
 * Disparo en abanico desde las esquinas inferiores al aprobar un cuestionario de módulo (>= 80%).
 */
export function fireModuleConfetti(): void {
  if (!canFireConfetti()) return;

  try {
    const colors = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'];

    confetti({
      particleCount: 55,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.85 },
      colors,
      disableForReducedMotion: true,
    });

    confetti({
      particleCount: 55,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.85 },
      colors,
      disableForReducedMotion: true,
    });
  } catch {
    // Ignorar errores de canvas en entornos sin WebGL/Context2D
  }
}

/**
 * Ráfaga continua de alta intensidad al aprobar el Examen Final de Certificación (>= 85%).
 */
export function fireCertificationConfetti(): void {
  if (!canFireConfetti()) return;

  try {
    const duration = 2600;
    const end = Date.now() + duration;
    const colors = ['#06b6d4', '#10b981', '#8b5cf6', '#fbbf24', '#38bdf8'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors,
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Explosión central inicial
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      disableForReducedMotion: true,
    });

    frame();
  } catch {
    // Ignorar errores de canvas en entornos de prueba
  }
}
