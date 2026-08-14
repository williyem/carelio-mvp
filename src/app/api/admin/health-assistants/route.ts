import { proxyAdmin } from '../_proxy';

export async function GET() {
  return proxyAdmin('/admin/health-assistants');
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAdmin('/admin/health-assistants', { method: 'POST', body });
}
