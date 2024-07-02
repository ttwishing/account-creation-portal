<script lang="ts">
  import { onMount } from 'svelte';
  import { writable, type Writable } from 'svelte/store';

  interface CreationCode {
    id: string;
    status: string;
    details: string;
  }

  export let creationCode: string | undefined;

  let copied: Writable<boolean> = writable(false);
  let error: Writable<Error | undefined> = writable(undefined);
  let timer: NodeJS.Timeout | undefined;

  function loadCreationCode(): Promise<CreationCode | undefined> {
    return fetch(`/api/code/${creationCode}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .catch((err) => {
        error.set(err as Error);
        return undefined;
      });
  }

  async function pollForCreationCode(): Promise<void> {
    let loadTime = Date.now();
    if (!creationCode) {
      timer = setInterval(async () => {
        if (Date.now() - loadTime > 1000 * 60 * 2) {
          error.set(new Error('Creation code load timeout'));
          clearInterval(timer);
          return;
        }
        try {
          const result = await loadCreationCode();
          if (result) {
            clearInterval(timer);
          }
        } catch (err) {
          error.set(err as Error);
          clearInterval(timer);
        }
      }, 5000);
    }
  }

  function retry(): void {
    error.set(undefined);
    clearTimeout(timer);
    pollForCreationCode();
  }

  onMount(() => {
    if (creationCode) {
      pollForCreationCode();

      return () => {
        clearInterval(timer);
      };
    }
  });

  function copy(): void {
    const url = `${window.location.origin}/activate/${creationCode}`;
    navigator.clipboard.writeText(url).then(() => {
      copied.set(true);
      setTimeout(() => copied.set(false), 2500);
    });
  }
</script>

{#if creationCode}
  <div class="flex flex-col items-center">
    <div class="w-16 h-16 mb-8 flex items-center justify-center bg-green-500 rounded-full text-white">
      ✔️
    </div>
    <h1 class="text-3xl font-bold">Payment successful</h1>
    <p class="mt-2">Account ready to be activated</p>
    <div class="mt-4 p-4 border rounded bg-white w-full max-w-lg">
      <h2 class="text-xl font-semibold">Creation Code Details</h2>
      <pre class="mt-2 p-2 bg-gray-100 rounded"><code>{JSON.stringify(creationCode, null, 2)}</code></pre>
    </div>
    <p class="mt-4">Thanks for your purchase, now let's continue with your account activation.</p>
    <div class="flex flex-col mt-6 space-y-4 w-full max-w-sm">
      <button class="p-2 bg-blue-500 text-white rounded" on:click={copy}>
        {#if $copied}
          Copied to clipboard!
        {:else}
          Copy account creation link
        {/if}
      </button>
      <a href={`/activate/${creationCode}`} class="p-2 bg-blue-500 text-white rounded text-center">Create account now</a>
    </div>
  </div>
{:else if $error}
  <div class="flex flex-col items-center">
    <div class="w-16 h-16 mb-8 flex items-center justify-center bg-red-500 rounded-full text-white">
      ❌
    </div>
    <h1 class="text-3xl font-bold">Payment failure</h1>
    <p class="mt-2">Unable to verify payment. {$error.message}</p>
    <div class="flex flex-col mt-6 space-y-4 w-full max-w-sm">
      <button class="p-2 bg-blue-500 text-white rounded" on:click={retry}>Retry</button>
    </div>
  </div>
{:else}
  <div class="flex flex-col items-center">
    <div class="w-16 h-16 mb-8 flex items-center justify-center bg-yellow-500 rounded-full text-white">
      ⏳
    </div>
    <h1 class="text-3xl font-bold">Payment pending</h1>
    <p class="mt-2">Waiting for the payment processor...</p>
  </div>
{/if}
