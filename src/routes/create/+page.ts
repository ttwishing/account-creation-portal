import { redirect, type Load } from '@sveltejs/kit';

export const load: Load = async ({ url }) => {
    const code = url.searchParams.get('code');
    if (!code) {
        throw redirect(302, '/buy');
    }

    const response = await fetch(`/api/stripe/product`)

    const stripeProduct = await response.json()

    return {
        props: { code, productId: stripeProduct.id, pageQueryString: url.searchParams.toString() }
    };
};