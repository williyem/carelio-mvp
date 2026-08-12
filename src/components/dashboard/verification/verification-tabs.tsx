'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PhoneSvg from '@/assets/icons/phone-svg';
import EmailSvg from '@/assets/icons/email-svg';
import PhoneVerificationTab from './phone-verification-tab';
import EmailVerificationTab from './email-verification-tab';
import { usePatientVerificationStore } from '@/stores/patient-verifcation-store';

interface VerificationTabsProps {
  onPhoneSendCode: (phoneNumber: string) => void | Promise<void>;
  onEmailSendCode: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const VerificationTabs = ({
  onPhoneSendCode,
  onEmailSendCode,
  isSubmitting = false,
}: VerificationTabsProps) => {
  const { selectedPatient } = usePatientVerificationStore();
  if (!selectedPatient) return null;
  const { email, phoneNumber } = selectedPatient;
  return (
    <Tabs defaultValue="phone" className="w-full">
      <TabsList className="bg-(--bg-light-gray) h-auto p-[5px] rounded-[100px] w-full">
        <TabsTrigger
          value="phone"
          className="flex flex-1 gap-[7px] items-center justify-center px-[30px] py-[10px] data-[state=active]:border-transparent"
        >
          <PhoneSvg />
          <span className="font-normal leading-[20px] text-black text-[14px]">
            Phone
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="email"
          className="flex flex-1 gap-[10px] items-center justify-center px-[30px] py-[10px] data-[state=active]:border-transparent"
        >
          <EmailSvg />
          <span className="font-normal leading-[20px] text-black text-[14px]">
            Email
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="phone"
        className="flex flex-col gap-5 items-start w-full mt-5"
      >
        <PhoneVerificationTab
          onSendCode={onPhoneSendCode}
          phoneNumber={phoneNumber || ''}
          isSubmitting={isSubmitting}
        />
      </TabsContent>

      <TabsContent
        value="email"
        className="flex flex-col gap-5 items-start w-full mt-5"
      >
        <EmailVerificationTab
          email={email}
          onSendCode={onEmailSendCode}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  );
};

export default VerificationTabs;
