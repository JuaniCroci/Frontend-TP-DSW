import { describe, expect, it } from 'vitest';
import { cn } from '@/shared/utils/cn';

describe('cn', () => {
  it('concatena clases simples', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('descarta valores falsy', () => {
    const disabled = false;
    expect(cn('px-2', disabled && 'py-1', undefined, null, '')).toBe('px-2');
  });

  it('resuelve conflictos de utilidades manteniendo la última', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('p-2 m-1', 'p-4')).toBe('m-1 p-4');
  });
});
