import { CircleCheckIcon } from 'lucide-react';

export default function SuccessStep() {
  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-bg-white-0 rounded-16 shadow-custom-large">
      <div className="mb-6">
        <CircleCheckIcon
          size={64}
          color="#1fc16b"
          className="mx-auto mb-4 rounded-full"
        />
        <h4 className="typography-h4 font-normal  mb-2">
          Patient has been onboarded!
        </h4>
        <p className="typography-paragraph-medium text-text-sub-600 mb-4">
          Registration is complete. Your patient profile has been successfully
          created and you are now ready to use our services.
        </p>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="rounded-8 bg-bg-weak-50 text-text-sub-600 px-4 py-2 typography-label-small">
          Thank you for completing the registration!
        </div>
        <p className="typography-label-medium text-text-strong-950 mt-4">
          You&apos;re all set! Please close this tab or window to finish.
        </p>
      </div>
    </div>
  );
}
