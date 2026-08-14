import { NextRequest, NextResponse } from 'next/server';
import { backendApiClient } from '@/integration/config';

function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const header = request.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : '';
  const cronHeader = request.headers.get('x-cron-secret') || '';
  return bearer === secret || cronHeader === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const secret = process.env.CRON_SECRET;
    const response = await backendApiClient.post(
      '/appointments/status/expire',
      {},
      {
        headers: secret
          ? {
              Authorization: `Bearer ${secret}`,
              'x-cron-secret': secret,
            }
          : undefined,
      }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
    };
    return NextResponse.json(
      {
        error: 'Failed to expire appointment statuses',
        details: axiosError.response?.data,
      },
      { status: axiosError.response?.status || 500 }
    );
  }
}
