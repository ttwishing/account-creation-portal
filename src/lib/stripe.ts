/** Stripe API helpers, backend only. */

import Stripe from 'stripe'
import { Bytes, Checksum256 } from '@wharfkit/antelope'
import { CreateRequest, type CreateRequestArguments } from '@greymass/account-creation'

import { getEnv, randomCode } from './helpers'

/** Stripe API keys, public will be sent to frontend. */
const keys = {
    private: getEnv('STRIPE_PRIVATE_KEY'),
    public: getEnv('STRIPE_PUBLIC_KEY'),
    endpointSecret: getEnv('STRIPE_ENDPOINT_SECRET')
}

const buoyServiceUrl = new URL(getEnv('BUOY_SERVICE_URL', 'https://cb.anchor.link'))

/** Public facing url for the service stripe will redirect back to. */
const publicUrl = new URL(getEnv('PUBLIC_URL', 'http://localhost:3000'))

// disabled because sveltekit adapter tries to execute code during build
if (!keys.private || !keys.public || !keys.endpointSecret) {
    console.log(
        'WARN: Missing stripe keys, please set STRIPE_PRIVATE_KEY, STRIPE_PUBLIC_KEY, and STRIPE_ENDPOINT_SECRET'
    )
}

const client = new Stripe(keys.private, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient()
})

export async function listProducts(): Promise<Stripe.Product[]> {
    const products: Stripe.Product[] = []
    for await (const product of client.products.list()) {
        if (product.active && product.metadata.sextant_id) {
            products.push(product)
        }
    }
    return products
}

export async function getProduct(productId: string) {
    const product = await client.products.retrieve(productId)
    if (!product.active || !product.metadata.sextant_id) {
        throw new Error('Product not found')
    }
    const prices = await client.prices.list({ product: productId, limit: 99, active: true })
    const price = prices.data[0]
    if (!price) {
        throw new Error('No price info')
    }
    return { product, price, key: keys.public }
}

export async function createSession(
    priceId: string,
    createRequestArguments: CreateRequestArguments,
    cancelPath: string
) {
    const price = await client.prices.retrieve(priceId, { expand: ['product'] })
    if (!price) {
        throw new Error('Price not found')
    }
    const product = price.product as Stripe.Product
    const sextantId = product.metadata.sextant_id
    if (!sextantId) {
        throw new Error('Product missing sextant_id')
    }
    const code = randomCode()
    const codeHash = Checksum256.hash(Bytes.from(code, 'utf8')).hexString
    const loginUrl = `${buoyServiceUrl.origin}/${codeHash}`

    const request = CreateRequest.from({
        ...createRequestArguments,
        code,
        login_url: loginUrl,
    }).toString(false)

    const session = await client.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${publicUrl.origin}/success/${request}`,
        cancel_url: `${publicUrl.origin}${cancelPath || ''}`,
        payment_intent_data: {
            metadata: { code, request, sextantId }
        },
        line_items: [
            {
                price: priceId,
                quantity: 1
            }
        ],
        metadata: { code, request, sextantId }
    })
    return {
        sessionId: session.id,
        key: keys.public
    }
}
export async function webhookEvent(request: Request) {
    const payload = await request.text()
    return await client.webhooks.constructEventAsync(
        payload,
        String(request.headers.get('Stripe-Signature')),
        keys.endpointSecret,
        30,
        Stripe.createSubtleCryptoProvider()
    )
}
