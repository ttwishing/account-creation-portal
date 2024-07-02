import type { Load } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit';
import type { CreationCode } from '$lib/types'


async function loadCreationCode(fetch: typeof window.fetch, code: string) {
    const res = await fetch(`/api/code/${code}`)
    if (!res.ok && res.status !== 404) {
        throw res
    }
    let creationCode: CreationCode | undefined
    if (res.status === 200) {
        creationCode = await res.json()
    }
    return creationCode
}

export const load: Load = async ({ fetch, params }) => {
    if (!params.code) {
        return redirect(302, '/buy')
    }
    const creationCode = await loadCreationCode(fetch, params.code)
    return {
        props: {
            creationCode
        }
    }
}