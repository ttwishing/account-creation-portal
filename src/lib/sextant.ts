/** Sextant API helpers, backend only. */

import { Bytes, PrivateKey } from '@greymass/eosio'
import { CreateRequest } from '@greymass/account-creation'
import type { CreateRequestType } from '@greymass/account-creation'
import { getEnv } from '$lib/helpers'
import type { NameType, PublicKeyType } from '@wharfkit/antelope'

const sextantUrl = getEnv('SEXTANT_URL', 'http://localhost:8080')
const sextantUUID = getEnv('SEXTANT_UUID', '8273DBFA-D91F-4C65-A8A3-0D9325B5E99C')
const sextantKey = PrivateKey.from(
    getEnv('SEXTANT_KEY', 'PVT_K1_2VbtWei9iPNJWDkzSdrJG1BHEyftwPWeJVnyaKxzi4hkjVX2fF')
)

export class SextantError extends Error {
    code: number
    reason: string
    constructor(data: any, code: number) {
        super(`Sextant ${code} - ${data.reason}`)
        this.code = code
        this.reason = data.reason
    }
}

async function sextantApiCall<T = any>(path: string, data: any): Promise<T> {
    const body = Bytes.from(JSON.stringify(data), 'utf8')
    const signature = sextantKey.signMessage(body)

    const response = await fetch(sextantUrl + path, {
        body: body.array,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Request-Sig': String(signature)
        }
    })
    if (response.status !== 200) {
        let errorData: any
        try {
            errorData = await response.json()
        } catch {
            throw new Error(`Unknown Sextant API error: ${response.status}`)
        }
        throw new SextantError(errorData, response.status)
    }
    if (
        response.headers.get('Content-Type') &&
        response.headers.get('Content-Type').startsWith('application/json')
    ) {
        return response.json()
    }
}

export async function createTicket(code: string, productId: string, comment: string) {
    await sextantApiCall('/tickets/new', {
        code,
        productId,
        comment
    })
}

export async function verifyTicket(payload: CreateRequestType) {
    const request = CreateRequest.from(payload)
    const ticket = await sextantApiCall('/tickets/verify', {
        code: request.code,
        deviceId: sextantUUID,
        version: 'whalesplainer ' + (import.meta.env.PUBLIC_REV || 'dev')
    })

    return ticket
}

interface CreateAccountRequest {
    code: string
    productId: string
    activeKey: PublicKeyType
    ownerKey: PublicKeyType
    accountName: NameType
}

export function createAccount(payload: CreateAccountRequest) {
    return sextantApiCall('/accounts/create', {
        productId: payload.productId,
        activeKey: String(payload.activeKey),
        ownerKey: String(payload.ownerKey),
        accountName: String(payload.accountName),
        code: payload.code
    })
}
