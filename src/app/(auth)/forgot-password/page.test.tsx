import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForgotPasswordPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/page-hooks/use-forgot-password', () => ({
  useForgotPasswordForm: () => ({
    register: () => ({}),
    handleSubmit: (fn: (e: unknown) => void) => (e: unknown) => {
      if (
        e &&
        typeof (e as { preventDefault?: () => void }).preventDefault ===
          'function'
      ) {
        (e as { preventDefault: () => void }).preventDefault();
      }
      return fn;
    },
    formState: { errors: {}, isValid: false },
    isPending: false,
  }),
}));

describe('ForgotPasswordPage', () => {
  it('renders forgot password form correctly', async () => {
    render(<ForgotPasswordPage />);

    expect(await screen.findByText(/forgot your password\?/i)).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined();
    expect(screen.getByText(/back to log in/i)).toBeDefined();
  });
});
