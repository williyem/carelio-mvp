import { AlertTriangle } from 'lucide-react';

interface InviteErrorProps {
  message: string;
}

export function InviteError({ message }: InviteErrorProps) {
  return (
    <div className="flex items-center justify-center h-[80vh] bg-bg-weak-50 p-4 md:p-8">
      <div className="bg-bg-white-0 rounded-16 shadow-custom-medium p-8 md:p-12 max-w-lg w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-state-error-lighter">
            <AlertTriangle className="size-8 text-state-error-base" />
          </div>

          <h5 className="typography-h5 text-text-strong-950">
            Unable to Access Invitation
          </h5>

          <p className="typography-paragraph-medium text-text-sub-600">
            {message ||
              'There seems to be an issue with the invitation link. It might be invalid, expired, or already used.'}
          </p>

          <p className="typography-paragraph-small text-text-soft-400 pt-2">
            Please double-check the link provided in your email. If the issue
            persists, contact the organization that sent the invitation for
            assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
