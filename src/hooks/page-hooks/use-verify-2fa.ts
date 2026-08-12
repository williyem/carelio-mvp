/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { toast } from 'sonner';
import { API_ENDPOINTS, ROUTES } from '@/lib/routes';
import axios from 'axios';

export function useVerify2FAForm() {
  const [code, setCode] = React.useState('');
  const [isPending, setIsPending] = React.useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsPending(true);
    try {
      const response = await axios.post(
        API_ENDPOINTS.verify2FA,
        {
          code: code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success(response.data?.message || '2FA enabled successfully');

      window.location.href = ROUTES.DASHBOARD.ROOT;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Invalid code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  return {
    code,
    setCode,
    handleVerify,
    isPending,
  };
}
