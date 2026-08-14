'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  getDoctorAccessRequest,
  resolveDoctorAccessRequest,
} from '@/integration/patient/api-function';
import { getErrorMessage } from '@/integration';
import { InviteError } from '@/components/patient-invite/InviteError';
import { InviteLoading } from '@/components/patient-invite/InviteLoading';

const ApproveDoctorContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['doctor-access-request', token],
    queryFn: () => getDoctorAccessRequest(token),
    enabled: !!token,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (action: 'approve' | 'decline') =>
      resolveDoctorAccessRequest(token, action),
    onSuccess: () => {
      refetch();
    },
  });

  if (!token) {
    return (
      <InviteError message="This approval link is missing a token. Please use the link from your email." />
    );
  }

  if (isLoading) {
    return <InviteLoading />;
  }

  if (isError || !data) {
    return (
      <InviteError
        message={getErrorMessage(
          error,
          'This approval link is invalid or has expired.'
        )}
      />
    );
  }

  const resolved = data.status !== 'pending';
  const approved = data.status === 'approved';
  const declined = data.status === 'declined';

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white rounded-[24px] border border-(--border-stroke) shadow-[0px_2px_12px_0px_rgba(0,0,0,0.08)] p-8 md:p-12 max-w-lg w-full space-y-6">
        <Image
          src="/images/carelio-logo.png"
          alt="Carelio"
          width={140}
          height={43}
          className="object-contain mx-auto"
        />

        {resolved ? (
          <div className="flex flex-col items-center text-center space-y-3">
            {approved ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-500" />
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {approved ? 'Access approved' : 'Access declined'}
            </h1>
            <p className="text-sm text-gray-600">
              {approved
                ? `${data.doctorName} can now view ${data.patientName}’s records. Any booked appointment stays scheduled.`
                : `Chart access for ${data.doctorName} was declined. Any booked appointment is still scheduled.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900">
                Approve covering doctor
              </h1>
              <p className="text-sm text-gray-600">
                {data.doctorName} is requesting covering-doctor access to{' '}
                {data.patientName}’s chart. Declining does not cancel an
                appointment if one was booked.
              </p>
            </div>
            {mutation.isError ? (
              <p className="text-sm text-red-500">
                {getErrorMessage(
                  mutation.error,
                  'Something went wrong. Please try again.'
                )}
              </p>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate('decline')}
                className="flex-1 h-[48px] rounded-full"
              >
                Decline
              </Button>
              <Button
                variant="brand"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate('approve')}
                className="flex-1 h-[48px] rounded-full"
              >
                {mutation.isPending ? <Spinner /> : 'Approve access'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ApproveDoctorPage = () => {
  return (
    <Suspense fallback={<InviteLoading />}>
      <ApproveDoctorContent />
    </Suspense>
  );
};

export default ApproveDoctorPage;
