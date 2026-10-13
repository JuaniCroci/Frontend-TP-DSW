import { describe, expect, it } from 'vitest';
import { formatMoney } from '@/shared/utils/formatMoney';

describe('formatMoney', () => {
  it('formatea un importe del contrato ("1500.00") como pesos argentinos', () => {
    expect(formatMoney('1500.00')).toMatch(/1\.500,00/);
  });

  it('formatea cero con decimales', () => {
    expect(formatMoney('0.00')).toMatch(/0,00/);
  });

  it('respeta los decimales del string de contrato', () => {
    expect(formatMoney('1234567.89')).toMatch(/1\.234\.567,89/);
  });
});
