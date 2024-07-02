import { json, type RequestHandler } from '@sveltejs/kit'
import { SextantError } from '$lib/sextant'
import { getProduct } from '$lib/stripe'
import { STRIPE_PRODUCT_ID } from '$env/static/private'

export const GET: RequestHandler = async () => {
    try {
        const product = await getProduct(STRIPE_PRODUCT_ID)
        return json(product, { status: 200 })
    } catch (error) {
        if (error instanceof SextantError && error.code === 404) {
            return json({ error: 'Ticket not found' }, { status: 404 })
        }

        return json({ error }, { status: 500 })
    }
}
