import { error, type Load } from "@sveltejs/kit";

export const load: Load = async ({ fetch, url }) => {
    const productId = import.meta.env.VITE_SEXTANT_PRODUCT_ID;
    if (!productId) {
      throw error(500, 'VITE_SEXTANT_PRODUCT_ID is not defined');
    }

    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) {
      throw error(res.status, await res.text());
    }

    const creationCode = url.searchParams.get('code');
    if (creationCode) {
      return {
        status: 301,
        redirect: `accounts/create?code=${creationCode}&${url.searchParams}`
      };
    }

    const product = await res.json();

    return {
      product: product.product,
      price: product.price,
      key: product.key,
      createRequestArguments: {
        login_scope: url.searchParams.get('scope'),
        return_path: url.searchParams.get('return_url')
      },
      pageQueryString: url.searchParams.toString()
    };
  };