import { createOrder } from '$lib/banxa'
import type { BanxaOrderParams } from '$lib/banxa'
import type { RequestHandler } from '@sveltejs/kit'

const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': '*'
}

// POST /tokens/order
// starts a Banxa token order
export const post: RequestHandler<BanxaOrderParams> = async (event) => {
    const createOrderParams = await event.request.json()

    const order = await createOrder(sanitizeParams(createOrderParams))

    return {
        status: 200,
        headers: responseHeaders,
        body: order as any
    }
}

export const options: RequestHandler<BanxaOrderParams> = async () => ({
    status: 200,
    headers: responseHeaders
})

function sanitizeParams(params: BanxaOrderParams): BanxaOrderParams {
    const {
        wallet_address,
        fiat_code,
        return_url_on_success,
        account_reference,
        coin_code,
        return_url_on_failure,
        iframe_domain
    } = params

    return {
        wallet_address,
        fiat_code,
        return_url_on_success,
        account_reference,
        coin_code,
        return_url_on_failure,
        iframe_domain
    }
}
