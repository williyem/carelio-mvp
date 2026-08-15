import { proxyAdmin } from '../../../_proxy';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  return proxyAdmin(`/admin/health-assistants/${id}/active`, {
    method: 'PATCH',
    body,
  });
}
