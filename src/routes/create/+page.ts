import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ url, fetch }) => {
    const ticket = url.searchParams.get('ticket');
    if (!ticket) {
        throw redirect(302, '/buy');
    }

    const response = await fetch(`/api/stripe/product`)

    const stripeProduct = await response.json()

    return {
        ticket,
        product: stripeProduct.product,
        pageQueryString: url.searchParams.toString()
    };
};