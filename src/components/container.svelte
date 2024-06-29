<script>
    import { page } from '$app/stores'
    import FancyBg from '~/components/fancy-bg.svelte'

    $: postPaymentPage =
        $page.url.pathname.includes('activate') || $page.url.pathname.includes('success')
</script>

<div class="container">
    <div class="header">
        <a href="/">
            <img src="/images/anchor-full-black.svg" alt="Anchor" />
        </a>
    </div>
    <div class="main">
        <div class="content">
            <slot />
        </div>
    </div>
    <div class="footer">
        <hr />
        {#if postPaymentPage}
            <p>
                Having issues?
                <a
                    href="https://forums.eoscommunity.org/c/greymass/anchor-wallet/5"
                    target="_blank"
                >
                    Contact support
                </a>
            </p>
        {:else}
            <p>
                Built and maintained by <a href="https://greymass.com" target="_blank">Greymass</a>
            </p>
        {/if}
    </div>
    <div class="bg">
        <FancyBg />
    </div>
</div>

<style lang="scss">
    $page_width: 300px;
    $navigation_width: 268px;
    $header_height: 71px;
    $footer_height: 60px;
    $bottom_padding: 4em;

    .container {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 50% 50%;
        grid-template-rows: $header_height minmax(0, auto) $footer_height;
        grid-template-areas:
            'header bg'
            'main bg'
            'footer bg';

        @media only screen and (min-width: 801px) and (max-width: 1200px) {
            grid-template-columns: 60% 40%;
        }

        @media only screen and (max-width: 800px) {
            grid-template-columns: 100% 0%;
        }

        .header {
            background: #fff;
            display: flex;
            grid-area: header;
            align-items: center;
            img {
                margin-left: 31px;
                height: 25px;
            }
        }

        .bg {
            background: #fff;
            grid-area: bg;
        }

        .main {
            background: #fff;
            display: flex;
            grid-area: main;
            width: 100%;
            .content {
                margin: 90px auto 0;
                width: 300px;
            }

            @media only screen and (max-height: 600px) {
                .content {
                    margin: 50px auto 0;
                }
            }
        }

        .footer {
            background: #fff;
            display: flex;
            grid-area: footer;
            justify-content: flex-start;
            flex-direction: column;
            hr {
                margin: 0 auto;
                display: block;
                width: 292px;
                height: 1px;
                border: 0;
                background-color: var(--main-light-grey);
                margin-bottom: 20px;
            }
            p {
                margin: 0;
            }
        }
    }
</style>
