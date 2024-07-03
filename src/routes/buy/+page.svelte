<script lang="ts">
  import type { StripeProduct } from '$lib/types';
  import { loadStripe } from '@stripe/stripe-js';

  interface CreateRequestArguments {
    login_scope: string | null;
    return_path: string | null;
  }

  interface PageData {
    stripeProduct: StripeProduct;
    createRequestArguments: CreateRequestArguments;
    pageQueryString: string;
  }

  export let data: PageData;

  let buyError: string | undefined;

  async function buy(): Promise<void> {
    const body = JSON.stringify({
      ...data.createRequestArguments,
      id: data.stripeProduct.price.id,
      cancelPath: `/create?${data.pageQueryString}`
    });

    const res = await fetch('/api/stripe/session', {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const { session } = await res.json();

    const stripe = await loadStripe(data.stripeProduct.key);

    if (stripe) {
      await stripe.redirectToCheckout({ sessionId: session.sessionId });
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
