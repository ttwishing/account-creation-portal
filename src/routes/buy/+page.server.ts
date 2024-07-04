import { type ServerLoad, redirect } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url, fetch, locals }) => {
    const response = await fetch(`/api/stripe/product`)
    const stripeProduct = await response.json()
    const creationTicket = url.searchParams.get('ticket');

    if (creationTicket) {
      throw  redirect(302, `/create?ticket=${creationTicket}&${url.searchParams}`)
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