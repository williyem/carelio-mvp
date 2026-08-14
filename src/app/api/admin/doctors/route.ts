import { proxyAdmin } from '../_proxy';

export async function GET() {
  return proxyAdmin('/admin/doctors');
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAdmin('/admin/doctors', { method: 'POST', body });
}
