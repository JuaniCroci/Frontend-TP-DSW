/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminModal } from '@/shared/components/AdminModal';

function Harness({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <button type="button">Abrir</button>
      <AdminModal labelledBy="demo-title" onClose={onClose} panelClassName="max-w-3xl">
        <h2 id="demo-title">Título de prueba</h2>
        <button type="button">Primero</button>
        <button type="button">Último</button>
      </AdminModal>
    </div>
  );
}

function ToggleHarness({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div>
      <button type="button">Abrir</button>
      {open && (
        <AdminModal labelledBy="toggle-title" onClose={onClose}>
          <h2 id="toggle-title">Título</h2>
        </AdminModal>
      )}
    </div>
  );
}

describe('AdminModal', () => {
  afterEach(cleanup);

  it('renderiza el diálogo con el título asociado y el ancho pedido', () => {
    render(<Harness onClose={() => {}} />);

    expect(screen.getByRole('dialog', { name: 'Título de prueba' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('max-w-3xl');
  });

  it('mueve el foco inicial al diálogo', () => {
    render(<Harness onClose={() => {}} />);

    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('cierra con Escape', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer mousedown sobre el fondo', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('presentation'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no cierra con mousedown dentro del diálogo', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('con Tab desde el último focoable vuelve al primero (focus trap)', () => {
    render(<Harness onClose={() => {}} />);
    const primero = screen.getByRole('button', { name: 'Primero' });
    const ultimo = screen.getByRole('button', { name: 'Último' });

    ultimo.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(primero).toHaveFocus();
  });

  it('con Shift+Tab desde el primero va al último focoable', () => {
    render(<Harness onClose={() => {}} />);
    const primero = screen.getByRole('button', { name: 'Primero' });
    const ultimo = screen.getByRole('button', { name: 'Último' });

    primero.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(ultimo).toHaveFocus();
  });

  it('devuelve el foco al disparador al cerrar', () => {
    const onClose = vi.fn();
    const { rerender } = render(<ToggleHarness open={false} onClose={onClose} />);
    const abrir = screen.getByRole('button', { name: 'Abrir' });

    abrir.focus();
    rerender(<ToggleHarness open onClose={onClose} />);
    expect(screen.getByRole('dialog')).toHaveFocus();

    rerender(<ToggleHarness open={false} onClose={onClose} />);
    expect(abrir).toHaveFocus();
  });
});
