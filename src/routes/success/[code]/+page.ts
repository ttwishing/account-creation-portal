import type { Load } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit';
import type { Ticket } from '$lib/types'


async function loadTicket(fetch: typeof window.fetch, payload: string) {
    const res = await fetch(`/api/ticket/${payload}`)
    if (!res.ok && res.status !== 404) {
        throw res
    }
    let ticket: Ticket | undefined
    if (res.status === 200) {
        ticket = await res.json()
    }
    return ticket
}

export const load: Load = async ({ fetch, params }) => {
    if (!params.id) {
        return redirect(302, '/buy')
    }
    const code = await loadTicket(fetch, params.id)
    return {
        props: {
            code
        }
    }
}