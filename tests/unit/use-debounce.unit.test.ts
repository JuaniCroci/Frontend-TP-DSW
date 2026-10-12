/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from '@/shared/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve el valor inicial sin esperar el delay', () => {
    const { result } = renderHook(() => useDebounce('gym', 300));

    expect(result.current).toBe('gym');
  });

  it('retiene el valor anterior hasta que pasa el delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'gym' },
    });

    rerender({ value: 'prote' });
    expect(result.current).toBe('gym');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('gym');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('prote');
  });

  it('solo emite el último valor cuando se escribió varias veces seguidas', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    rerender({ value: 'cr' });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('cr');
  });
});
