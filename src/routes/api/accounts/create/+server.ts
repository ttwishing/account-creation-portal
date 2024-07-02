import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createAccount } from '$lib/sextant'; // Adjust the import path as needed
import type { PublicKeyType, NameType } from '@wharfkit/antelope';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { ticket, productId, activeKey, ownerKey, accountName } = await request.json();

    if (!ticket || !productId || !activeKey || !ownerKey || !accountName) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await createAccount({
      ticket,
      productId,
      activeKey: activeKey as PublicKeyType,
      ownerKey: ownerKey as PublicKeyType,
      accountName: accountName as NameType
    });

    return json({ success: true });
  } catch (error: unknown) {
    return json({ error: (error as Error).message }, { status: 500 });
  }
};
