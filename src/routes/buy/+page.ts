import { type Load } from "@sveltejs/kit";

export const load: Load = async ({ url, fetch }) => {
    const response = await fetch(`/api/stripe/product`)
    const stripeProduct = await response.json()
    const creationCode = url.searchParams.get('code');

    if (creationCode) {
      return {
        status: 301,
        redirect: `/create?code=${creationCode}&${url.searchParams}`
      };
    }

    return {
      stripeProduct: stripeProduct,
      createRequestArguments: {
        login_scope: url.searchParams.get('scope'),
        return_path: url.searchParams.get('return_url'),
      },
      searchParams: String(url.searchParams),
    };
  };