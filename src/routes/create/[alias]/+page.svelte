<script context="module" lang="ts">
    import { HTTPError } from '$lib/helpers'
    import type { Product } from '$lib/types'
    import type { Load } from '@sveltejs/kit'

    // alias => chain id
    const lookup = new Map<string, string>([
        ['eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'],
        ['fio', '21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c'],
        ['jungle3', '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840'],
        ['proton', '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'],
        ['telos', '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11'],
        ['wax', '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4']
    ])

    export const load: Load = async ({ fetch, params }) => {
        const alias = params.alias.trim().toLowerCase()
        const id = lookup.get(alias)
        if (!id) {
            return // 404
        }
        const res = await fetch('/api/products')
        if (!res.ok) {
            throw await HTTPError.fromResponse(res)
        }
        const products: Product[] = await res.json()
        const product = products.find((product) => product.chain === id)
        if (!product) {
            return // 404
        }
        return {
            status: 301,
            redirect: `/buy?p=${product.id}`
        }
    }
</script>
