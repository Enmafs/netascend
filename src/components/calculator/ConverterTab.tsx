import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { convertFromFormat, convertIP, type IPConversion, type IPFormat } from '../../lib/net/converter';
import { CopyButton } from '../ui/CopyButton';
import { Card, ErrorBox, Field, TextInput } from '../ui/primitives';

type Fields = Record<IPFormat, string>;

const LABELS: Record<IPFormat, { label: string; placeholder: string }> = {
  decimal: { label: 'Decimal con puntos', placeholder: '192.168.1.1' },
  binary: { label: 'Binario', placeholder: '11000000.10101000.00000001.00000001' },
  hex: { label: 'Hexadecimal', placeholder: '0xC0A80101' },
  integer: { label: 'Entero de 32 bits', placeholder: '3232235777' },
};

function toFields(c: IPConversion): Fields {
  return { decimal: c.decimal, binary: c.binary, hex: c.hex, integer: String(c.integer) };
}

export function ConverterTab() {
  const [conv, setConv] = useState<IPConversion>(() => convertIP('192.168.1.1'));
  const [fields, setFields] = useState<Fields>(() => toFields(convertIP('192.168.1.1')));
  const [errors, setErrors] = useState<Partial<Record<IPFormat, string>>>({});

  const handleChange = (format: IPFormat, value: string) => {
    try {
      const parsed = convertFromFormat(format, value);
      setConv(parsed);
      // El campo que se está editando conserva lo que escribe el usuario; los demás se sincronizan.
      setFields({ ...toFields(parsed), [format]: value });
      setErrors({});
    } catch (e) {
      setFields((f) => ({ ...f, [format]: value }));
      setErrors({ [format]: e instanceof Error ? e.message : 'Valor inválido.' });
    }
  };

  const firstError = Object.values(errors)[0];

  return (
    <div className="space-y-5">
      <Card title="Conversor de formatos" icon={<ArrowLeftRight size={16} className="text-cyan" aria-hidden />}>
        <p className="mb-4 text-sm text-slate-400">Escribe en cualquier campo y los demás se actualizan al instante.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(LABELS) as IPFormat[]).map((format) => (
            <Field key={format} label={LABELS[format].label} htmlFor={`conv-${format}`}>
              <div className="flex gap-2">
                <TextInput
                  id={`conv-${format}`}
                  value={fields[format]}
                  onChange={(e) => handleChange(format, e.target.value)}
                  placeholder={LABELS[format].placeholder}
                  aria-invalid={!!errors[format]}
                />
                <CopyButton value={fields[format]} label={LABELS[format].label} className="h-auto" />
              </div>
            </Field>
          ))}
        </div>
        {firstError && (
          <div className="mt-4">
            <ErrorBox>{firstError}</ErrorBox>
          </div>
        )}
      </Card>

      <Card title="Desglose bit a bit por octeto">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {conv.octets.map((octet, i) => {
            const bits = octet.toString(2).padStart(8, '0');
            const weights = [128, 64, 32, 16, 8, 4, 2, 1];
            return (
              <div key={i} className="rounded-lg border border-line bg-base/60 p-3">
                <p className="text-xs uppercase text-slate-400">Octeto {i + 1}</p>
                <p className="font-mono text-2xl font-bold text-cyan">{octet}</p>
                <p className="font-mono text-xs text-slate-500">
                  0x{octet.toString(16).toUpperCase().padStart(2, '0')}
                </p>
                <div className="mt-2 grid grid-cols-8 gap-0.5 text-center font-mono text-[10px]">
                  {weights.map((w) => (
                    <span key={w} className="text-slate-500">
                      {w}
                    </span>
                  ))}
                  {bits.split('').map((b, k) => (
                    <span key={k} className={b === '1' ? 'rounded bg-cyan/20 py-0.5 font-bold text-cyan' : 'py-0.5 text-slate-600'}>
                      {b}
                    </span>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[11px] text-slate-500">
                  {weights.filter((_, k) => bits[k] === '1').join(' + ') || '0'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
