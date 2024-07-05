<script lang="ts">
  import type { StripeProduct } from '$lib/types';
  import { loadStripe } from '@stripe/stripe-js';
  import { signIn } from "@auth/sveltekit/client"
	import type { Session } from '@auth/sveltekit';
	import { writable } from 'svelte/store';

  interface CreateRequestArguments {
    login_scope: string | null;
    return_path: string | null;
  }

  interface PageData {
    stripeProduct: StripeProduct;
    createRequestArguments: CreateRequestArguments;
    searchParams: string;
    session: Session
    canGetFreeAccount: boolean;
  }

  export let data: PageData;

  let buyError: string | undefined;

  async function buy(): Promise<void> {
    const body = JSON.stringify({
      ...data.createRequestArguments,
      id: data.stripeProduct.price.id,
      searchParams: data.searchParams,
    });

    const res = await fetch('/api/stripe/session', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const { session: stripeSession } = await res.json();

    const stripe = await loadStripe(data.stripeProduct.key);

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: stripeSession.sessionId });
    }
  }

  function handleBuy(event: Event): void {
    event.preventDefault();
    buyError = undefined;
    buy()
      .catch((err: Error) => {
        buyError = err.message;
      });
  }

  function formatPrice(amount: number, currency = 'USD'): string {
    return (amount / 100).toLocaleString('en-US', { style: 'currency', currency });
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">Create New Account</h1>
  <p class="mb-4">Create a {data.stripeProduct.product.name} for {formatPrice(data.stripeProduct.price.unit_amount, data.stripeProduct.price.currency)}</p>
  <button
    class="w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
    on:click={handleBuy}
  >
    Continue to Payment &rarr;
  </button>
  <hr />
  {#if data.canGetFreeAccount}
    <p class="mt-4">You are currently signed in as {data.session.user?.name}</p>
    <form method="POST" action="/ticket">
      <input type="hidden" name="searchParams" value={data.searchParams} />
      <button
        class="w-full mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
        type="submit"
      >
        Get Free Account
      </button>
    </form>
  {:else if !data.session.user}
    <p class="block mt-4 text-sm text-gray-600">Or sign in with:</p>
    <button
      on:click={() => signIn("google", { callbackUrl: `/buy?${data.searchParams}`})}
      class="w-full mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-300 text-center"
    >
      Sign in with Google
    </button>
  {/if}
  
  
  <noscript>
    <p class="mt-4 text-red-600">
      Sorry, our payment processor Stripe requires JavaScript to be enabled to function.
    </p>
  </noscript>
  {#if buyError}
    <p class="mt-4 text-red-600">
      <strong>ERROR:</strong> {buyError}
    </p>
  {/if}
</div>
