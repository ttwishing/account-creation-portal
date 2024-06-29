import { logos } from '$lib/logos'
import { listProducts } from '$lib/stripe'
import type { Product } from '$lib/types'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async () => {
    const stripeProducts = await listProducts()
    const products: Product[] = stripeProducts.map(({ id, images, name, metadata }) => ({
        id,
        name,
        image: logos.get(metadata.chain_id) || images[0] || '',
        chain: metadata.chain_id
    }))
    products.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
    return {
        status: 200,
        body: products as any
    }
}
