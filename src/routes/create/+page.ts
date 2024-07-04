import type { SextantError } from '$lib/sextant';
import { redirect, type Load } from '@sveltejs/kit';

function loadTicket(fetch: typeof window.fetch, ticket: string) {
    return fetch(`/api/ticket/${ticket}`).then(res => {
        if (!res.ok && res.status !== 404) {
            throw res;
        }
        let ticketData;
        if (res.status === 200) {
            ticketData = res.json();
        }
        return ticketData;
    })
}

export const load: Load = async ({ url, fetch }) => {
    const ticket = url.searchParams.get('ticket');

    if (!ticket) {
        throw redirect(302, '/buy');
    }

    let ticketData
    try {
        ticketData = await loadTicket(fetch, ticket);
    } catch (error: SextantError | unknown) {
        console.error('Error loading ticket:', error)
        
        throw redirect(302, '/buy');
    }

    if (!ticketData || !url.searchParams.get('owner_key') || !url.searchParams.get('active_key')) {
        console.error('Missing keys so redirecting to buy page');
        throw redirect(302, '/buy');
    }

    const response = await fetch(`/api/stripe/product`)

    const stripeProduct = await response.json()

    return {
        ticket,
        product: stripeProduct.product,
        searchParams: url.searchParams.toString()
    };
};