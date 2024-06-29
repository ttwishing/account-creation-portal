<script lang="ts">
    import { logos } from '$lib/logos'
    export let ticket: any
</script>

<div class="ticket">
    <img src={logos.get(ticket.chainId)} alt="Blockchain" />
    <div class="info">
        <div class="type">1x {ticket.name}</div>
        <div class="status">Ready to be activated</div>
    </div>
</div>

<style type="scss">
    .ticket {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 5px solid var(--main-light-grey);
        border-radius: 12px;
        padding: 24px 0 22px;
        margin: 18px 0;

        img {
            display: block;
            height: 40px;
            width: 40px;
            margin-right: 12px;
            margin-left: -12px;
        }
        .type {
            font-size: 17px;
            font-weight: 500;
            margin-bottom: 7px;
        }
        .status {
            display: inline-block;
            background: var(--main-green);
            border-radius: 4px;
            font-weight: 500;
            color: var(--main-white);
            padding: 4px 6px;
        }
    }
</style>
