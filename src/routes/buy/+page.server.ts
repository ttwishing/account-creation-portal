import { type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, fetch, locals }) => {
    const response = await fetch(`/api/stripe/product`)
    const stripeProduct = await response.json()
    const creationCode = url.searchParams.get('ticket');

    if (creationCode) {
      return {
        status: 301,
        redirect: `/create?code=${creationCode}&${url.searchParams}`
      };
    }

    const session = await locals.auth()

    return {
      stripeProduct: stripeProduct,
      createRequestArguments: {
        login_scope: url.searchParams.get('scope'),
        return_path: url.searchParams.get('return_url'),
      },
      searchParams: String(url.searchParams),
      session,
    };
  };