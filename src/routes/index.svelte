<script>
    import Button from '~/components/button.svelte'
</script>

<div class="page">
    <h1>Antelope Account Creator</h1>

    <p>An easy and secure way to purchase new accounts for yourself and others.</p>

    <div class="chains">
        <div class="chain">
            <img src="/images/eos.svg" alt="EOS Logo" />
            <span>EOS</span>
        </div>
        <div class="chain">
            <img src="/images/proton.png" alt="Proton Logo" />
            <span>Proton</span>
        </div>
        <div class="chain">
            <img src="/images/telos.svg" alt="Telos Logo" />
            <span>Telos</span>
        </div>
        <div class="chain">
            <img src="/images/wax.svg" alt="WAX Logo" />
            <span>WAX</span>
        </div>
    </div>

    <div class="buttons">
        <Button size="large" fluid href="https://greymass.com/en/anchor" target="_blank">
            Learn more about Anchor
        </Button>
        <Button size="large" fluid primary href="/create">Purchase new account</Button>
    </div>
</div>

<style type="scss">
    h1 {
        margin-bottom: 39px;
    }
    .buttons :global(.button) {
        margin-top: 10px;
    }
    .chains {
        display: flex;
        flex-flow: row;
        margin-top: 56px;
        margin-bottom: 28px;
        .chain {
            text-align: center;
            width: 100%;
            img {
                height: 40px;
            }
            span {
                font-weight: 500;
                margin-top: 4px;
                display: block;
                font-size: 10px;
                line-height: 14px;
                color: var(--main-grey-alt);
            }
        }
    }
</style>
