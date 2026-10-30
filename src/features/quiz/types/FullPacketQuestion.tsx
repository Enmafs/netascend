import { useState, type FormEvent } from 'react';
import type { FullPacketAnswer } from '../../../lib/quiz/types';
import { TextInput, Button, Field } from '../../../components/ui/primitives';
import { Send } from 'lucide-react';

interface Props {
  initialValue?: Partial<FullPacketAnswer>;
  disabled?: boolean;
  onSubmit: (ans: FullPacketAnswer) => void;
}

export function FullPacketQuestion({ initialValue = {}, disabled = false, onSubmit }: Props) {
  const [form, setForm] = useState<FullPacketAnswer>({
    maskDecimal: initialValue.maskDecimal ?? '',
    salto: initialValue.salto ?? '',
    workingOctet: initialValue.workingOctet ?? '',
    networkAddress: initialValue.networkAddress ?? '',
    firstUsableIP: initialValue.firstUsableIP ?? '',
    lastUsableIP: initialValue.lastUsableIP ?? '',
    broadcastAddress: initialValue.broadcastAddress ?? '',
  });

  const update = (field: keyof FullPacketAnswer, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const isComplete = Object.values(form).every((v) => v.trim() !== '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isComplete || disabled) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="1. Máscara Decimal" htmlFor="fp-mask">
          <TextInput
            id="fp-mask"
            value={form.maskDecimal}
            onChange={(e) => update('maskDecimal', e.target.value)}
            disabled={disabled}
            placeholder="ej. 255.255.255.192"
          />
        </Field>
        <Field label="2. Salto de Red" htmlFor="fp-salto">
          <TextInput
            id="fp-salto"
            value={form.salto}
            onChange={(e) => update('salto', e.target.value)}
            disabled={disabled}
            placeholder="ej. 64"
          />
        </Field>
        <Field label="3. Octeto de Trabajo" htmlFor="fp-octet">
          <TextInput
            id="fp-octet"
            value={form.workingOctet}
            onChange={(e) => update('workingOctet', e.target.value)}
            disabled={disabled}
            placeholder="1, 2, 3 o 4"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="4. Dirección de Red" htmlFor="fp-net">
          <TextInput
            id="fp-net"
            value={form.networkAddress}
            onChange={(e) => update('networkAddress', e.target.value)}
            disabled={disabled}
            placeholder="ej. 192.168.1.64"
          />
        </Field>
        <Field label="5. Dirección de Broadcast" htmlFor="fp-bc">
          <TextInput
            id="fp-bc"
            value={form.broadcastAddress}
            onChange={(e) => update('broadcastAddress', e.target.value)}
            disabled={disabled}
            placeholder="ej. 192.168.1.127"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="6. Primera IP Útil" htmlFor="fp-first">
          <TextInput
            id="fp-first"
            value={form.firstUsableIP}
            onChange={(e) => update('firstUsableIP', e.target.value)}
            disabled={disabled}
            placeholder="ej. 192.168.1.65"
          />
        </Field>
        <Field label="7. Última IP Útil" htmlFor="fp-last">
          <TextInput
            id="fp-last"
            value={form.lastUsableIP}
            onChange={(e) => update('lastUsableIP', e.target.value)}
            disabled={disabled}
            placeholder="ej. 192.168.1.126"
          />
        </Field>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !isComplete}
          className="px-6 py-2.5 font-bold"
        >
          <Send size={16} className="mr-1.5" />
          Validar Paquete Completo
        </Button>
      </div>
    </form>
  );
}
