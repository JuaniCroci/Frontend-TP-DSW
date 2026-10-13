export interface CampoMaestro {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
}
