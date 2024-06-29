<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit'
    import { receive, ListenerEncoding } from '@greymass/buoy'

    import { HTTPError } from '$lib/helpers'
    import type { Ticket } from '$lib/types'

    export const load: Load = async ({ fetch, url, params }) => {
        const payload = params.id
        const step = url.searchParams.get('step')

        const res = await fetch(`/api/ticket/${payload}`)

        if (!res.ok) {
            throw await HTTPError.fromResponse(res)
        }
        const ticket: Ticket = await res.json()
        return {
            props: {
                payload,
                step,
                ticket
            }
        }
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import { QR } from 'qr-svg'

    import { CreateRequest } from '@greymass/account-creation'

    import TicketComponent from '~/components/ticket.svelte'
    import Button from '~/components/button.svelte'

    import { goto } from '$app/navigation'

    export let payload: string
    export let ticket: Ticket
    export let step: string

    $: request = CreateRequest.fromString(payload)
    $: requestString = String(request).replace('//', '')
    $: crossDeviceRequest = CreateRequest.from({
        ...request,
        return_path: null
    })
    $: crossDeviceRequestString = String(crossDeviceRequest).replace('//', '')
    $: crossDeviceRequestQr = QR(crossDeviceRequestString)

    let successfullyCreated = false

    onMount(() => {
        if (request.login_url) {
            const { origin, pathname } = new URL(request.login_url)

            // Anchor will notify whalesplainer that the account has been created by signing an identity request with the newly created account
            receive({
                service: origin,
                channel: (pathname || '').replace('/', ''),
                encoding: ListenerEncoding.json
            }).then((message) => {
                successfullyCreated = true

                window.opener && window.opener.postMessage(message, '*')
            })
        }
    })

    function changeStep(next: string) {
        if (next !== 'main') {
            goto(`/activate/${payload}?step=${next}`)
        } else {
            goto(`/activate/${payload}`, { replaceState: true })
        }
    }

    let copied = false

    function copy() {
        navigator.clipboard.writeText(crossDeviceRequestString).then(function () {
            copied = true
            setTimeout(() => (copied = false), 2500)
        })
    }
</script>

<div class="page">
    {#if successfullyCreated}
        <h1>Account Created</h1>
        <p>Your account is created.</p>
    {:else if step === 'launch'}
        <h1>Scan with Anchor</h1>
        <p>Scan the QR code below with Anchor on your other device to get started.</p>
        <div class="qr">
            {@html crossDeviceRequestQr}
        </div>
        <div class="buttons">
            <a href="#copy" on:click|preventDefault={copy}>
                {#if copied}
                    Copied to clipboard!
                {:else}
                    Copy request link
                {/if}
            </a>
            <Button size="large" fluid on:action={() => changeStep('main')}>&larr; Back</Button>
        </div>
    {:else if step === 'download'}
        <h1>Download Anchor</h1>
        <p>Available to download for free</p>
        <div class="buttons bottom-border">
            <Button
                size="large"
                fluid
                href="https://apps.apple.com/us/app/anchor-wallet/id1487410877"
                target="_blank"
            >
                iOS
            </Button>
            <Button
                size="large"
                fluid
                href={`https://play.google.com/store/apps/details?id=com.greymass.anchor&referrer=${requestString}`}
                target="_blank"
            >
                Android
            </Button>
            <Button
                size="large"
                fluid
                href="https://greymass.com/en/anchor/download/"
                target="_blank"
            >
                Windows, macOS, Linux
            </Button>
        </div>
        <p>
            When you have Anchor installed on your device, go back to the previous page to launch it
            and finalize the creation of your account.
        </p>
        <Button size="large" fluid primary on:action={() => changeStep('main')}>&larr; Back</Button>
    {:else}
        <h1>Create new account</h1>
        <p>Continue in your Anchor app</p>
        <TicketComponent {ticket} />
        <p>
            To complete the account creation you will need to continue in the Anchor app. Download
            it now if you don't already have it.
        </p>
        <div class="buttons">
            <Button size="large" fluid href={requestString}>Launch Anchor on this device</Button>
            <Button size="large" fluid on:action={() => changeStep('launch')}>
                Create on another device
            </Button>
            <Button primary size="large" fluid on:action={() => changeStep('download')}>
                Download Anchor
            </Button>
        </div>
        <p>
            <em>
                Note: Please upgrade to the latest version of Anchor if the above links do not work
                for you.
            </em>
        </p>
    {/if}
</div>

<style lang="scss">
    .qr {
        width: 100%;
        margin: 1em 0;
    }
    .qr :global(svg) {
        display: block;
        /* render with crisp edges to remove hairline gaps between rects */
        shape-rendering: crispEdges;
        /* promote to gpu layer so that crisp edges are preserved even if a transform is applied to a parent */
        transform: translateZ(0);
    }
    .qr :global(rect) {
        fill: var(--qr-color, 'currentColor');
    }
    .buttons {
        margin-top: 20px;
        a {
            text-align: center;
            display: block;
            margin-bottom: 2em;
        }
    }
    .buttons :global(.button) {
        margin-bottom: 10px;
    }
</style>
