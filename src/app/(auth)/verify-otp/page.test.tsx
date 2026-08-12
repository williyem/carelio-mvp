import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

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
import VerifyOtpPage from './page';

describe('VerifyOtpPage', () => {
  it('renders OTP form correctly', () => {
    render(<VerifyOtpPage />);

    expect(screen.getByText(/otp verification/i)).toBeDefined();
    // Use getAllByText if necessary, or getByLabel text if I added a label.
    // I added <div className="text-left text-sm text-gray-500 mb-2">Enter Code</div> but not a real label tag associated with input.
    expect(screen.getAllByText(/Enter Code/i)[0]).toBeDefined();
    // Placeholder check removed as InputOTP structure is different

    expect(screen.getByRole('button', { name: /continue/i })).toBeDefined();
    expect(screen.getByText(/back to log in/i)).toBeDefined();
  });
});
