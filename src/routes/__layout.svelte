<script lang="ts">
    import Container from '~/components/container.svelte'
</script>

<svelte:head>
    <script
        async
        defer
        data-domain="create.anchor.link"
        src="https://stats.greymass.com/js/plausible.exclusions.js"
        data-exclude="/success/*, /activate/*"></script>
    <title>Antelope Account Creator</title>
    <meta
        name="description"
        content="An easy and secure way to purchase new EOS, Proton, Telos, and WAX accounts for yourself and others."
    />
    <meta itemprop="name" content="Antelope Account Creator" />
    <meta
        itemprop="description"
        content="An easy and secure way to purchase new EOS, Proton, Telos, and WAX accounts for yourself and others."
    />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Antelope Account Creator" />
    <meta
        name="twitter:description"
        content="An easy and secure way to purchase new EOS, Proton, Telos, and WAX accounts for yourself and others."
    />
    <meta name="twitter:site" content="@greymass" />
    <meta
        name="twitter:image:src"
        content="https://play-lh.googleusercontent.com/c0Ugdnvbdsql5wh52bc-2CWNxjNvrjxTa3vJ6-wlLQFwyN9gDoniAveJvAYhAVPPP2Lq"
    />
    <meta name="og:title" content="Antelope Account Creator" />
    <meta
        name="og:description"
        content="An easy and secure way to purchase new EOS, Proton, Telos, and WAX accounts for yourself and others."
    />
    <meta
        name="og:image"
        content="https://play-lh.googleusercontent.com/c0Ugdnvbdsql5wh52bc-2CWNxjNvrjxTa3vJ6-wlLQFwyN9gDoniAveJvAYhAVPPP2Lq"
    />
    <meta name="og:url" content="https://create.anchor.link" />
    <meta name="og:site_name" content="Antelope Account Creator" />
    <meta name="og:type" content="website" />
</svelte:head>

<Container>
    <slot />
</Container>

<style type="scss" global>
    @import '../style/reset.scss';
    @import '../style/global.scss';
</style>
