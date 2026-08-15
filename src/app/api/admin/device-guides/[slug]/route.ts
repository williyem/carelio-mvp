import { NextRequest } from 'next/server';
import { proxyAdmin } from '../../_proxy';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = await request.json();
  return proxyAdmin(`/admin/device-guides/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body,
  });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  return proxyAdmin(`/admin/device-guides/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}
