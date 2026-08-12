import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('nextjs-toploader/app', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/hooks/page-hooks/use-doctor-login', () => ({
  useDoctorLoginForm: () => ({
    register: () => ({}),
    handleSubmit: (fn: (e: unknown) => void) => (e: unknown) => {
      e && typeof (e as { preventDefault?: () => void }).preventDefault === 'function' &&
        (e as { preventDefault: () => void }).preventDefault();
      return fn;
    },
    formState: { errors: {}, isValid: false },
    showPassword: false,
    setShowPassword: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/page-hooks/use-patient-login', () => ({
  usePatientLoginForm: () => ({
    register: () => ({}),
    handleSubmit: (fn: (e: unknown) => void) => (e: unknown) => {
      e && typeof (e as { preventDefault?: () => void }).preventDefault === 'function' &&
        (e as { preventDefault: () => void }).preventDefault();
      return fn;
    },
    formState: { errors: {}, isValid: false },
    isPending: false,
  }),
}));

vi.mock('@/hooks/page-hooks/use-health-assistant-login', () => ({
  useHealthAssistantLoginForm: () => ({
    register: () => ({}),
    handleSubmit: (fn: (e: unknown) => void) => (e: unknown) => {
      e && typeof (e as { preventDefault?: () => void }).preventDefault === 'function' &&
        (e as { preventDefault: () => void }).preventDefault();
      return fn;
    },
    formState: { errors: {}, isValid: false },
    showPassword: false,
    setShowPassword: vi.fn(),
    isPending: false,
  }),
}));

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('tab', { name: /doctor/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /patient/i })).toBeDefined();
    expect(
      screen.getByRole('tab', { name: /health assistant/i })
    ).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /log in/i })).toBeDefined();
    expect(screen.getByText(/forgot password\?/i)).toBeDefined();
  });
});
