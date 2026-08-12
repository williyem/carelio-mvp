import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('tab', { name: /doctor/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /user/i })).toBeDefined();
    expect(screen.getByLabelText(/email address/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /log in/i })).toBeDefined();
    expect(screen.getByText(/forgot password\?/i)).toBeDefined();
  });
});
