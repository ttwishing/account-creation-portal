import { createSession } from '$lib/stripe'
import type { RequestHandler } from '@sveltejs/kit'

interface PostBody {
    /** Stripe price id. */
    id: string
}

// POST /products/session
// starts a stripe checkout session and tells the client the id so it can redirect there
export const post: RequestHandler<PostBody> = async (event) => {
    const { id, cancelPath, ...createRequestArguments } = await event.request.json()
    if (typeof id !== 'string' || id.length === 0) {
        throw new Error('Invalid id')
    }
    const session = await createSession(id, createRequestArguments, cancelPath)

    return {
        status: 200,
        body: session as any
    }
}
