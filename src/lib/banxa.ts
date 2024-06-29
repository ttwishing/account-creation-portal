/** Banxa API helpers, backend only. */

import { Bytes } from '@greymass/eosio'
import hash from 'hash.js'

import { getEnv } from '$lib/helpers'

const banxaApiUrl = getEnv('BANXA_API_URL', 'https://anchorwallet.banxa-sandbox.com')
const banxaApiKey = getEnv('BANXA_API_KEY', 'ANCHOR@TESTBANXA082022@')
const banxaApiSecret = getEnv('BANXA_API_SECRET')

export class BanxaError extends Error {
    code: number
    reason: string
    constructor(data: any, code: number) {
        super(`Banxa API Error ${code} - ${data.errors?.title}`)
        this.code = code
        this.reason = data.errors?.title
    }
}

export type BanxaOrderParams = {
    wallet_address: string
    fiat_code: string
    return_url_on_success: string
    account_reference: string
    coin_code: string
    return_url_on_failure: string
    iframe_domain: string
}

export function createOrder(banxaOrderParams: BanxaOrderParams) {
    return banxaApiCall('/api/orders', 'POST', banxaOrderParams)
}

async function banxaApiCall<T = any>(path: string, requestMethod: string, data: any): Promise<T> {
    if (!banxaApiSecret) {
        throw new Error('BANXA_API_SECRET environment variable not set.')
    }

    const authorizationHeader = getAuthHeader(path, requestMethod, data)

    const response = await fetch(banxaApiUrl + path, {
        body: JSON.stringify(data),
        method: requestMethod,
        headers: {
            'Content-Type': 'application/json',
            Authorization: authorizationHeader
        }
    })
    if (response.status !== 200) {
        let errorData: any
        try {
            errorData = await response.json()
        } catch {
            throw new Error(`Unknown Banxa API error: ${response.status}`)
        }
        throw new BanxaError(errorData, response.status)
    }
    if (
        response.headers.get('Content-Type') &&
        response.headers.get('Content-Type').startsWith('application/json')
    ) {
        return response.json()
    }
}

function epochTime() {
    return Math.floor(Date.now() / 1000)
}

function getAuthHeader(requestMethod, requestPath, requestBody) {
    const body = JSON.stringify(requestBody)
    const timestamp = epochTime()
    const requestData = [requestPath, requestMethod, timestamp, body].join('\n')
    const signature = hash
        .hmac(hash.sha256, Bytes.from(banxaApiSecret, 'utf8').array, 'hex')
        .update(requestData)
        .digest('hex')

    return `Bearer ${banxaApiKey}:${signature}:${timestamp}`
}
