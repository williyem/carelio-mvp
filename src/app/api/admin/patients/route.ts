import { proxyAdmin } from '../_proxy';

export async function GET() {
  return proxyAdmin('/admin/patients');
}
