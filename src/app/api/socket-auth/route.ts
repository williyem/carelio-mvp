import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { doctorAccessToken } from '@/lib/constants';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(doctorAccessToken)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    token,
    userType: 'doctor',
  });
}
