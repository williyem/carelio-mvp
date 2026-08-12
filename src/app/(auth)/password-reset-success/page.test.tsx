import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordResetSuccessPage from './page';

describe('PasswordResetSuccessPage', () => {
  it('renders correctly', () => {
    render(<PasswordResetSuccessPage />);

    expect(screen.getByText('Password Reset Successful')).toBeDefined();
    expect(
      screen.getByText(
        'Your password has been updated successfully. Use your new credentials to log in securely.'
      )
    ).toBeDefined();
    expect(screen.getByRole('link', { name: 'Go to login' })).toBeDefined();
    expect(screen.getByAltText('Password Verified')).toBeDefined();
  });
});
