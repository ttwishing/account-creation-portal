<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import type { Product } from '$lib/types'

    export const load: Load = async ({ fetch, url }) => {
        const res = await fetch('/api/products')
        if (res.ok) {
            let products: Product[] = await res.json()

            const supportedChains = url.searchParams.get('supported_chains')

            if (supportedChains) {
                products = products.filter((product) => {
                    return supportedChains.split(',').includes(product.chain)
                })
                if (products.length === 1) {
                    return {
                        redirect: `/buy?p=${products[0].id}&${url.searchParams.toString()}`,
                        status: 301
                    }
                }
            }

            return {
                props: { products, pageQueryString: url.searchParams.toString() }
            }
        }
        const { message } = await res.json()
        return {
            error: new Error(message)
        }
    }
</script>

<script lang="ts">
    export let products: Product[]
    export let pageQueryString: string

    function productName(product: Product) {
        // drop redundant 'Account' suffix
        return product.name.replace(/Account$/, '').trim()
    }
</script>

<h1>Create new account</h1>
<p>Select account type</p>

<ul>
    {#each products as product}
        <a href={`/buy?p=${product.id}&${pageQueryString}`}>
            <span><img src={product.image} alt={product.name} /></span>
            <span class="name">
                {productName(product)}
            </span>
            <span class="chevron"><img src="/images/chevron.svg" alt="Select" /></span>
        </a>
    {/each}
</ul>

<style type="scss">
    ul {
        display: flex;
        flex-direction: column;
        margin: 31px 0;
        a {
            display: flex;
            font-size: 17px;
            font-weight: 500;
            > span:first-child {
                border: none;
                img {
                    height: 40px;
                    width: 40px;
                    margin: 0 18px 0 0;
                }
            }
            > span {
                align-items: center;
                display: flex;
                min-height: 58px;
                border-bottom: 1px solid var(--main-light-grey);
                color: var(--main-blue);
                &.name {
                    flex-grow: 1;
                }
                img {
                    height: 16px;
                }
            }
            &:last-child span {
                border: none;
            }
            .chevron {
                opacity: 0.23137255;
            }
            &:hover {
                .chevron {
                    opacity: 1;
                }
            }
        }
    }
</style>
