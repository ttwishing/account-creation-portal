import type { RequestHandler } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit/types/internal'

import { customAlphabet } from 'nanoid'

/**
 * Stale-while-revalidate cache, takes a ttl and a fetcher function and returns
 * a function that returns a promise that resolves to the value of the fetcher.
 *
 * Will return a stale value while revalidating if the age is less than double the ttl.
 */
export function cache<T>(ttl: number, fetcher: () => Promise<T>): () => Promise<T> {
    let value: T | undefined
    let fetchPromise: Promise<void> | undefined
    let updated = 0
    const fetch = () => {
        if (!fetchPromise) {
            fetchPromise = fetcher()
                .then((result) => {
                    updated = Date.now()
                    value = result
                })
                .finally(() => {
                    fetchPromise = undefined
                })
        }
        return fetchPromise
    }
    return async () => {
        const age = Date.now() - updated
        if (value === undefined || age > 2 * ttl) {
            await fetch()
        } else if (age > ttl && fetchPromise === undefined) {
            fetch().catch((error) => {
                console.warn('Unable to refresh stale cache in background', error)
            })
        }
        return value
    }
}

export const randomCode = customAlphabet(
    '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
    22
)

export class HTTPError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }

    static async fromResponse(response: Response) {
        const contentType = response.headers.get('content-type') || 'text/plain'
        try {
            if (contentType.includes('application/json')) {
                const body = await response.json()
                const err = new HTTPError(response.status, body.message)
                if (body.stack) {
                    err.stack = body.stack
                }
                return err
            } else if (contentType.includes('text/plain')) {
                const text = await response.text()
                const message = text.split('\n')[0]
                const stack = text.split('\n').slice(1).join('\n')
                const err = new HTTPError(response.status, message || response.statusText)
                err.stack = stack
                return err
            } else {
                return new HTTPError(response.status, response.statusText)
            }
        } catch (error) {
            return new HTTPError(response.status, response.statusText)
        }
    }
}

export function createHandler<T extends RequestHandler>(fn: T): T {
    return (async (request: RequestEvent) => {
        try {
            let result = fn(request)
            if (result instanceof Promise) {
                result = await result
            }
            return result
        } catch (error) {
            if (error instanceof HTTPError) {
                return {
                    status: error.status,
                    body: {
                        message: error.message,
                        stack: error.stack
                    }
                }
            } else {
                return {
                    status: 500,
                    body: {
                        message: error.message,
                        stack: error.stack
                    }
                }
            }
        }
    }) as any
}

// injected by svelte-kit during cloudflare builds
declare const env: Record<string, string>

/** Returns environment variable without breaking in cf pages. */
export function getEnv(key: string, defaultValue = ''): string {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || defaultValue
    } else if (typeof env !== 'undefined') {
        return env[key] || defaultValue
    } else {
        return defaultValue
    }
}
