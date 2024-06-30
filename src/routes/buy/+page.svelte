<script lang="ts">
	import type { Product } from '$lib/types';
	import { loadStripe } from '@stripe/stripe-js';

  interface CreateRequestArguments {
    login_scope: string | null;
    return_path: string | null;
  }

  interface PageData {
    product: Product;
    price: { id: string };
    key: string;
    createRequestArguments: CreateRequestArguments;
    pageQueryString: string;
  }

  export let data: PageData;

  let buyError: string | undefined;

  async function buy(): Promise<void> {
    const body = JSON.stringify({
      ...data.createRequestArguments,
      id: data.price.id,
      cancelPath: `/create?${data.pageQueryString}`
    });

    const res = await fetch('/api/products/session', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const result: { sessionId: string } = await res.json();
    const stripe = await loadStripe(data.key);

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: result.sessionId });
    }
  }

  function handleBuy(event: Event): void {
    event.preventDefault();
    buyError = undefined;
    buy()
      .catch((err: Error) => {
        buyError = err.message;
      })
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-4">Create new account</h1>
  <p class="mb-4">Review {data.product.name} price</p>
  <button class="w-full mt-4" on:click={handleBuy}>
    Continue to payment &rarr;
  </button>
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
