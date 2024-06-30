import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { checkAccountName } from '$lib/sextant'; // Adjust the import path as needed

interface VerifyAccountRequest {
  productId: string;
  accountName: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { productId, accountName } = await request.json() as VerifyAccountRequest;

    if (!productId || !accountName) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { nameAvailable } = await checkAccountName(productId, accountName);

    return json({ nameAvailable });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
