<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import type { Ticket } from '$lib/types'

    async function loadTicket(fetch: typeof window.fetch, payload: string) {
        const res = await fetch(`/api/ticket/${payload}`)
        if (!res.ok && res.status !== 404) {
            throw await HTTPError.fromResponse(res)
        }
        let ticket: Ticket | undefined
        if (res.status === 200) {
            ticket = await res.json()
        }
        return ticket
    }

    export const load: Load = async ({ fetch, params }) => {
        const payload = params.id
        const ticket = await loadTicket(fetch, payload)
        return {
            props: {
                payload,
                ticket
            }
        }
    }
</script>

<script lang="ts">
    import TicketComponent from '~/components/ticket.svelte'
    import Button from '~/components/button.svelte'

    import { HTTPError } from '$lib/helpers'
    import { onMount } from 'svelte'
    import { busy } from '$lib/stores'

    export let ticket: Ticket | undefined
    export let payload: string

    let copied = false
    let error: Error | undefined
    let timer: any

    function pollForTicket() {
        let timer: any
        let loadTime = Date.now()
        if (!ticket) {
            $busy = true
            timer = setInterval(() => {
                if (Date.now() - loadTime > 1000 * 60 * 2) {
                    $busy = false
                    error = new Error('Ticket load timeout')
                    clearInterval(timer)
                    return
                }
                loadTicket(fetch, payload)
                    .then((result) => {
                        if (result) {
                            $busy = false
                            ticket = result
                            clearInterval(timer)
                        }
                    })
                    .catch((err) => {
                        $busy = false
                        error = err
                        clearInterval(timer)
                    })
            }, 5000)
        }
    }

    function retry() {
        error = undefined
        clearTimeout(timer)
        pollForTicket()
    }

    onMount(() => {
        pollForTicket()
        return () => {
            clearInterval(timer)
            $busy = false
        }
    })

    function copy() {
        const url = `${window.location.origin}/activate/${payload}`
        navigator.clipboard.writeText(url).then(function () {
            copied = true
            setTimeout(() => (copied = false), 2500)
        })
    }
</script>

{#if ticket}
    <div class="icon success" />
    <h1>Payment successful</h1>
    <p>Account ready to be activated</p>
    <TicketComponent {ticket} />
    <p>Thanks for your purchase, now lets continue with your account activation.</p>
    <div class="buttons">
        <Button size="large" fluid on:action={copy}>
            {#if copied}
                Copied to clipboard!
            {:else}
                Copy account creation link
            {/if}
        </Button>
        <Button size="large" fluid primary href={`/activate/${payload}`}>Create account now</Button>
    </div>
{:else if error}
    <div class="icon error" />
    <h1>Payment failure</h1>
    <p>Unable to verify payment. {error.message}</p>
    <div class="buttons">
        <Button fluid size="large" on:action={retry}>Retry</Button>
    </div>
{:else}
    <div class="icon loading" />
    <h1>Payment pending</h1>
    <p>Waiting for the payment processor...</p>
{/if}

<style type="scss">
    .icon {
        width: 70px;
        height: 70px;
        margin: 0 auto;
        margin-bottom: 30px;
    }
    h1 + p {
        margin-top: 6px;
    }
    .icon.loading {
        border-radius: 100%;
        background-color: #3650a2;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0.5 0.5 45 45' xmlns='http://www.w3.org/2000/svg' stroke='%23fff'%3E%3Cg fill='none' fill-rule='evenodd' transform='translate(1 1)' stroke-width='2'%3E%3Ccircle cx='22' cy='22' r='6' stroke-opacity='0'%3E%3Canimate attributeName='r' begin='1.5s' dur='3s' values='6;22' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-opacity' begin='1.5s' dur='3s' values='1;0' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-width' begin='1.5s' dur='3s' values='2;0' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3Ccircle cx='22' cy='22' r='6' stroke-opacity='0'%3E%3Canimate attributeName='r' begin='3s' dur='3s' values='6;22' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-opacity' begin='3s' dur='3s' values='1;0' calcMode='linear' repeatCount='indefinite' /%3E%3Canimate attributeName='stroke-width' begin='3s' dur='3s' values='2;0' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3Ccircle cx='22' cy='22' r='8'%3E%3Canimate attributeName='r' begin='0s' dur='1.5s' values='6;1;2;3;4;5;6' calcMode='linear' repeatCount='indefinite' /%3E%3C/circle%3E%3C/g%3E%3C/svg%3E");
    }
    .icon.error {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' fill='none'%3E%3Ccircle cx='35' cy='35' r='35' fill='%23fc3d39'/%3E%3Cpath fill-rule='evenodd' d='M32.88 17.614c.715-.403 1.522-.614 2.343-.614s1.628.212 2.343.614 1.314.983 1.74 1.685l.005.008 13.483 22.508.013.022c.417.722.638 1.541.64 2.375s-.214 1.654-.627 2.378-1.008 1.328-1.727 1.751-1.535.65-2.369.659h-.017-26.983c-.834-.009-1.651-.237-2.369-.659s-1.314-1.027-1.727-1.751-.629-1.544-.627-2.378.223-1.653.64-2.375l.013-.022L31.14 19.299c.426-.702 1.025-1.282 1.74-1.685zm2.343 2.569a1.59 1.59 0 0 0-1.359.763L20.392 43.438a1.59 1.59 0 0 0-.208.782c-.001.278.071.551.209.793a1.59 1.59 0 0 0 1.358.803h26.945a1.59 1.59 0 0 0 1.358-.803 1.59 1.59 0 0 0 .209-.793c-.001-.274-.073-.544-.208-.782L36.584 20.95c-.144-.236-.343-.428-.58-.561a1.59 1.59 0 0 0-.781-.205zm0 6.531a1.59 1.59 0 0 1 1.592 1.592v6.367a1.59 1.59 0 1 1-3.184 0v-6.367a1.59 1.59 0 0 1 1.592-1.592zm-1.592 14.326a1.59 1.59 0 0 1 1.592-1.592h.016a1.59 1.59 0 1 1 0 3.184h-.016a1.59 1.59 0 0 1-1.592-1.592z' fill='%23fff'/%3E%3C/svg%3E");
    }
    .icon.success {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 70 70'%3E%3Cdefs/%3E%3Ccircle cx='35' cy='35' r='35' fill='%233DC55D'/%3E%3Cpath fill='%23fff' d='M30.9 49.7a2 2 0 001.8-1L48 24.9c.3-.5.4-1 .4-1.4 0-1-.7-1.7-1.7-1.7-.8 0-1.2.3-1.6 1L30.8 45.4 23.5 36c-.5-.6-1-.9-1.6-.9-1 0-1.8.8-1.8 1.8 0 .4.2.9.6 1.3L29 48.7c.6.7 1.1 1 1.9 1z'/%3E%3C/svg%3E");
    }
    .buttons {
        margin-top: 20px;
        :global(.button) {
            margin-bottom: 10px;
        }
    }
</style>
