import { proxyAdmin } from '../_proxy';

export async function GET() {
  return proxyAdmin('/admin/device-guides');
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAdmin('/admin/device-guides', { method: 'POST', body });
}
