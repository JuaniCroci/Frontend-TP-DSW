/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('app shell', () => {
  it('renderiza la aplicación en el DOM', () => {
    render(<App />);

    expect(screen.getByText('Entreno2.0')).toBeInTheDocument();
  });
});
