<script lang="ts">
    import type { Stripe } from 'stripe'
    import { logos } from '$lib/logos'
    export let price: Stripe.Price
    export let product: Stripe.Product

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    })
</script>

<div class="product">
    <div class="logo">
        <img src={logos.get(product.metadata.chain_id)} alt="Blockchain" />
    </div>
    <div class="type">1x {product.name}</div>
    <div class="price">Price {formatter.format(price.unit_amount / 100)} USD</div>
</div>

<style type="scss">
    .product {
        text-align: center;
        border: 5px solid var(--main-light-grey);
        border-radius: 10px;
        padding: 25px;
        margin: 24px 0;
        .logo {
            img {
                height: 40px;
                margin: 0;
                width: 40px;
            }
        }
        .type {
            font-size: 17px;
            font-weight: 500;
            margin: 7px 0;
        }
        .price {
            color: var(--main-grey);
        }
    }
</style>
