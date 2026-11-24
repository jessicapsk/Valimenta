import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App.tsx';

describe('App Foundation (Issue #22)', () => {
  it('deve renderizar o título principal do sistema Valimenta com acessibilidade e sem erros', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: /valimenta/i });
    expect(heading).toBeDefined();
  });
});
