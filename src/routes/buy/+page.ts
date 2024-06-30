import { type Load } from "@sveltejs/kit";

import { getProduct } from "$lib/sextant";

export const load: Load = async ({ fetch, url }) => {
    const product = await getProduct();

    const creationCode = url.searchParams.get('code');
    if (creationCode) {
      return {
        status: 301,
        redirect: `accounts/create?code=${creationCode}&${url.searchParams}`
      };
    }

    return {
      product: product,
      price: product.price,
      createRequestArguments: {
        login_scope: url.searchParams.get('scope'),
        return_path: url.searchParams.get('return_url'),
        owner_key: url.searchParams.get('owner_key'),
        active_key: url.searchParams.get('active_key'),
      },
      pageQueryString: url.searchParams.toString()
    };
  };