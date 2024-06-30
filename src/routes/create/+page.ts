import { redirect, type Load } from '@sveltejs/kit';
import { getEnv } from '$lib/helpers';

export const load: Load = async ({ url }) => {
    const code = url.searchParams.get('code');
    if (!code) {
        throw redirect(302, '/buy');
    }

    const productId = getEnv('VITE_SEXTANT_PRODUCT_ID');
    return {
        props: { code, productId, pageQueryString: url.searchParams.toString() }
    };
};