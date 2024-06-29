import { getProduct } from '$lib/stripe'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async (request) => {
    const result = await getProduct(request.params.id)
    return {
        status: 200,
        body: result as any
    }
}
