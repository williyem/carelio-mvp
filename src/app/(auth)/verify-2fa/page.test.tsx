import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Verify2FAPage from './page';

// Mock InputOTP to avoid JSDOM compatibility issues with the underlying library
vi.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="input-otp">{children}</div>
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputOTPSlot: () => <div data-testid="otp-slot" />,
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Verify2FAPage', () => {
  it('renders 2FA options correctly', () => {
    render(<Verify2FAPage />);

    expect(screen.getByText(/two-factor authentication/i)).toBeDefined();
    // Check for Tabs
    expect(screen.getByRole('tab', { name: /authenticator/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /email/i })).toBeDefined();

    expect(screen.getByRole('button', { name: /verify/i })).toBeDefined();
  });
});
