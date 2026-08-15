'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Copy, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';

export default function Setup2FAPage() {
  const router = useRouter();
  const [qrCodeData, setQrCodeData] = React.useState<string | null>(null);
  const [secretKey, setSecretKey] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const setup2FA = async () => {
      try {
        const response = await axios.post(
          API_ENDPOINTS.setup2FA,
          {
            method: 'totp',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data?.qrCode) {
          setQrCodeData(response.data.qrCode);
        }
        if (response.data?.secret) {
          setSecretKey(response.data.secret);
        }
      } catch (error) {
        toast.error('Failed to setup 2FA. Please try again.');
        console.error('Setup 2FA error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setup2FA();
  }, []);

  const handleVerify = () => {
    router.push(ROUTES.AUTH.ENABLE_2FA);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center sm:p-6 bg-(--bg-white) dark:bg-background h-full">
      <div className="w-full max-w-[500px] flex flex-col items-center gap-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex items-center justify-center mb-6">
            <Link
              href="/dashboard"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/carelio-logo.png"
                alt="Carelio"
                width={200}
                height={61}
                className="object-contain"
              />
            </Link>
          </div>
          {/* Headers are implicit in the design */}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight mb-4 text-foreground">
            Two-Factor Authentication
          </h1>

          <div className="theme-alert-info w-full p-4 text-left rounded-lg text-sm">
            <strong className="block mb-1 text-(--text-primary)">
              Scan QR Code
            </strong>
            Open your authenticator app and scan the QR code below, or manually
            enter the secret key.{' '}
          </div>
        </div>

        {isLoading ? (
          <div className="w-full flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="w-full">
              <div className=" rounded-[8px] border border-(--border-input) bg-(--bg-input) p-4 flex flex-col items-center gap-6">
                <div className="space-y-6 pt-4 w-full">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-(--bg-white) p-3 sm:p-4 rounded-lg border">
                      {qrCodeData ? (
                        <Image
                          width={118}
                          height={118}
                          src={qrCodeData}
                          alt="QR Code"
                          className="w-[118px] h-[118px]"
                        />
                      ) : (
                        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-(--bg-disabled) flex items-center justify-center">
                          <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-(--text-muted)" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secret Key */}
                  {secretKey && (
                    <div className="w-full">
                      <Label
                        htmlFor="secretKey"
                        className="text-sm text-(--text-label) font-normal"
                      >
                        Secret Key (for manual entry)
                      </Label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                        <input
                          id="secretKey"
                          value={secretKey}
                          readOnly
                          className="font-mono text-xs bg-(--bg-white) w-full px-4 rounded-[8px] border border-input h-[46px] text-(--text-muted) sm:text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(secretKey);
                            toast.success('Secret key copied');
                          }}
                          className="sm:w-auto h-[46px]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full mt-2">
              <Button
                variant="brand"
                className="w-full h-11 rounded-full text-base mt-2"
                onClick={handleVerify}
                disabled={!secretKey}
              >
                Continue to Verify
              </Button>
            </div>
          </>
        )}

        <Link
          href={ROUTES.AUTH.ROOT}
          className="flex items-center gap-2 text-sm text-(--text-secondary) hover:text-foreground transition-colors mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </div>
    </div>
  );
}
