import type { RequestHandler } from '@sveltejs/kit'

import { customAlphabet } from 'nanoid'

export const randomCode = customAlphabet(
    '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
    22
)

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
