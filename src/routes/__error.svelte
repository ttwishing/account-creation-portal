<script context="module" lang="ts">
    import type { ErrorLoad } from '@sveltejs/kit'

    export const load: ErrorLoad = ({ error, status }) => {
        return {
            props: {
                message: error.message || 'Internal server error',
                status,
                details: error.stack
            }
        }
    }
</script>

<script lang="ts">
    export let message: string
    export let status: number
    export let details: string | undefined
</script>

<h1>{status}</h1>
<h2>{message}</h2>
{#if details}
    <p><details><pre><code>{details}</code></pre></details></p>
{/if}

<style>
    h1,
    h2 {
        text-align: center;
    }
    pre {
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
        padding: 1em;
        text-align: left;
    }
</style>
