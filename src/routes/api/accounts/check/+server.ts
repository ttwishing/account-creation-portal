import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { checkAccountName } from '$lib/sextant'; // Adjust the import path as needed

interface CheckAccountRequest {
  productId: string;
  accountName: string;
  ticket: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { productId, accountName, ticket }: CheckAccountRequest = await request.json();

    if (!productId || !accountName) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { nameAvailable } = await checkAccountName(productId, accountName, ticket);

    return json({ nameAvailable });
  } catch (error: unknown) {
    return json({ error: (error as Error).message }, { status: 500 });
  }
};
