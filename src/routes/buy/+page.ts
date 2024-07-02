import { type Load } from "@sveltejs/kit";

export const load: Load = async ({ url, fetch }) => {
    const response = await fetch(`/api/stripe/product`)

    const stripeProduct = await response.json()

    const creationCode = url.searchParams.get('code');
    if (creationCode) {
      return {
        status: 301,
        redirect: `accounts/create?code=${creationCode}&${url.searchParams}`
      };
    }

    return {
      product: stripeProduct,
      price: stripeProduct.price,
      createRequestArguments: {
        login_scope: url.searchParams.get('scope'),
        return_path: url.searchParams.get('return_url'),
        owner_key: url.searchParams.get('owner_key'),
        active_key: url.searchParams.get('active_key'),
      },
      pageQueryString: url.searchParams.toString()
    };
  };