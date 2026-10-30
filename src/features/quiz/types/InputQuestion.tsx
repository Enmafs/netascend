import { useState, type FormEvent } from 'react';
import { TextInput, Button } from '../../../components/ui/primitives';
import { Send } from 'lucide-react';

interface Props {
  value?: string;
  disabled?: boolean;
  onSubmit: (ans: string) => void;
  placeholder?: string;
}

export function InputQuestion({ value = '', disabled = false, onSubmit, placeholder = 'Escribe tu respuesta aquí...' }: Props) {
  const [text, setText] = useState(value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="text-base py-2.5"
          autoFocus
        />
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !text.trim()}
          className="shrink-0 px-5"
        >
          <Send size={16} className="mr-1.5" />
          Responder
        </Button>
      </div>
    </form>
  );
}
