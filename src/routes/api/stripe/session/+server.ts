import { json } from '@sveltejs/kit';
import { createSession } from '$lib/stripe'
import type { RequestHandler } from '@sveltejs/kit';

// POST /products/session
// starts a stripe checkout session and tells the client the id so it can redirect there
export const POST: RequestHandler = async ({ request }) => {
    const { id, successPath, searchParams, ...createRequestArguments } = await request.json()
    if (typeof id !== 'string' || id.length === 0) {
        throw new Error('Invalid id')
    }
    const session = await createSession(id, createRequestArguments, searchParams)

    return json({ session }, { status: 200 });
}
