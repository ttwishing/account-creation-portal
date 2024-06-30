
  
<script lang="ts">
    export let message: string;
    export let status: number;
    export let details: string | undefined;
</script>

<h1 class="text-4xl font-bold text-center mt-10">{status}</h1>
<h2 class="text-2xl text-center mt-5">{message}</h2>
{#if details}
    <div class="mt-5 p-5 bg-gray-100 rounded-lg">
        <details class="bg-gray-200 p-3 rounded">
        <summary class="cursor-pointer">Details</summary>
        <pre class="mt-2 p-2 bg-gray-300 rounded"><code>{details}</code></pre>
        </details>
    </div>
{/if}
  