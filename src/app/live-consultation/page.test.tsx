import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LiveConsultationPage from './page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('LiveConsultationPage', () => {
  it('renders live consultation header and session status', () => {
    render(<LiveConsultationPage />);

    expect(screen.getAllByText(/Live Consultation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Video Call Active/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Exit/i).length).toBeGreaterThan(0);
  });

  it('renders fixed video call controls', () => {
    render(<LiveConsultationPage />);

    expect(screen.getAllByText('Mute').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pause Video').length).toBeGreaterThan(0);
    expect(screen.getAllByText('End').length).toBeGreaterThan(0);
  });

  it('renders clinical sidebar stationary items', () => {
    render(<LiveConsultationPage />);

    expect(screen.getAllByText(/Live Vitals/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Heart Rate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Add Notes/i).length).toBeGreaterThan(0);
  });

  it('transitions to clinical notes view on button click', () => {
    render(<LiveConsultationPage />);

    const addNotesButton = screen.getAllByText(/Add Notes/i)[0];
    fireEvent.click(addNotesButton);

    expect(
      screen.getAllByText(/Clinical Notes \(SOAP\)/i).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Subjective').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Objective').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assessment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Plan').length).toBeGreaterThan(0);
  });

  it('allows navigation back from notes to patient info view', () => {
    render(<LiveConsultationPage />);

    fireEvent.click(screen.getAllByText(/Add Notes/i)[0]);
    fireEvent.click(screen.getAllByText(/Back/i)[0]);

    expect(screen.getAllByText(/Add Notes/i).length).toBeGreaterThan(0);
  });
});
