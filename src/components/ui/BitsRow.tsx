import { cn } from '../../lib/cn';

interface BitsRowProps {
  /** Binario con puntos, ej. `11000000.10101000.00000001.00000001`. */
  binary: string;
  /** Los primeros `prefix` bits se pintan como "red"; el resto como "host". */
  prefix: number;
  /** Si se indica, los bits de host con índice menor a este valor se destacan en ámbar (sumarización). */
  variableUntil?: number;
  className?: string;
}

/** Muestra una dirección en binario resaltando la porción de red frente a la de host. */
export function BitsRow({ binary, prefix, variableUntil, className }: BitsRowProps) {
  let bitIndex = 0;
  const octets = binary.split('.');
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm', className)} aria-label={binary}>
      {octets.map((octet, o) => (
        <span key={o} className="inline-flex">
          {octet.split('').map((bit, b) => {
            const idx = bitIndex++;
            const isNet = idx < prefix;
            const isVariable = !isNet && variableUntil !== undefined && idx < variableUntil;
            return (
              <span
                key={b}
                className={cn(
                  'px-[1px]',
                  isNet ? 'text-cyan' : isVariable ? 'text-amber-300' : 'text-violet/90',
                  idx === prefix && 'border-l-2 border-white/70 pl-[2px]',
                )}
              >
                {bit}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
