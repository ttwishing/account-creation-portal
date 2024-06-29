<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'

    export const load: Load = async ({ fetch, url }) => {
        const id = url.searchParams.get('p')
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) {
            throw await HTTPError.fromResponse(res)
        }

        return {
            props: {
                ...(await res.json()),
                createRequestArguments: {
                    login_scope: url.searchParams.get('scope'),
                    return_path: url.searchParams.get('return_url')
                },
                pageQueryString: url.search
            }
        }
    }
</script>

<script lang="ts">
    import type { Stripe } from 'stripe'

    import { loadStripe } from '@stripe/stripe-js'
    import type { Stripe as StripeClient } from '@stripe/stripe-js'
    import { onMount } from 'svelte'

    import Product from '~/components/product.svelte'
    import { HTTPError } from '$lib/helpers'
    import Button from '~/components/button.svelte'
    import { busy } from '$lib/stores'
    import type { CreateRequestArguments } from '@greymass/account-creation'

    export let product: Stripe.Product
    export let price: Stripe.Price
    export let key: string
    export let createRequestArguments: CreateRequestArguments
    export let pageQueryString: string

    let stripePromise: Promise<StripeClient>
    let error: Error | undefined

    onMount(() => {
        if (!stripePromise) {
            stripePromise = loadStripe(key)
        }
    })

    async function buy() {
        const body = JSON.stringify({
            ...createRequestArguments,
            id: price.id,
            cancelPath: `/create?${pageQueryString}`
        })
        const res = await fetch('/api/products/session', {
            body,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        if (!res.ok) {
            throw await HTTPError.fromResponse(res)
        }
        const result = await res.json()
        const stripe = await stripePromise

        await stripe.redirectToCheckout({ sessionId: result.sessionId })
    }

    function handleBuy(event: Event) {
        event.preventDefault()
        error = undefined
        busy.set(true)
        buy()
            .catch((err) => {
                error = err
            })
            .finally(() => {
                busy.set(false)
            })
    }
</script>

<h1>Create new account</h1>
<p>Review {product.name} price</p>
<Product {product} {price} />
<Button primary size="large" fluid on:action={handleBuy}>Continue to payment &rarr;</Button>
<noscript>
    <p>Sorry, our payment processor Stripe requires JavaScript to be enabled to function.</p>
</noscript>
{#if error}
    <p class="error">
        <strong>ERROR</strong>
        {error.message}
    </p>
{/if}

<style>
    .error {
        color: red;
    }
</style>
