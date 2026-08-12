import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForgotPasswordPage from './page';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ForgotPasswordPage', () => {
  it('renders forgot password form correctly', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText(/forgot your password\?/i)).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined();
    expect(screen.getByText(/back to log in/i)).toBeDefined();
  });
});
