<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { onMount, tick } from 'svelte';
  import type { Product } from '$lib/types';

  interface PageData {
    code: string;
    product: Product;
    pageQueryString: string;
  }
  
  export let data: PageData

  let code = data.code;
  let product = data.product;
  let pageQueryString = data.pageQueryString;

  let accountName = writable('');
  let nameAvailable = writable<boolean | null>(null);
  let loading = writable(false);
  let error = writable<string | null>(null);

  let activeKey: string | null = null;
  let ownerKey: string | null = null;
  let ticket: string | null = null;
  let keysMissing = writable(false);
  let debounceTimeout: NodeJS.Timeout;

  onMount(() => {
    const searchParams = new URLSearchParams(pageQueryString);
    activeKey = searchParams.get('active_key');
    ownerKey = searchParams.get('owner_key');
    ticket = searchParams.get('ticket');

    if (!activeKey || !ownerKey) {
      keysMissing.set(true);
    }
  });

  async function checkAccountNameAvailability(accountName: string) {
    error.set(null);
    nameAvailable.set(null);
    loading.set(true);

    try {
      const result = await fetch('/api/accounts/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountName: accountName + '.gm', productId: product.id, ticket }),
      });

      if (!result.ok) {
        throw new Error('Failed to check account name availability');
      }

      const { nameAvailable: availability } = await result.json();

      if (availability) {
        nameAvailable.set(true);
      } else {
        nameAvailable.set(false);
      }
    } catch (err) {
      error.set('Error checking account name availability');
    } finally {
      loading.set(false);
    }
  }

  function handleAccountNameInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const name = target.value.trim().toLowerCase();
    accountName.set(name);

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      checkAccountNameAvailability(name);
    }, 500); // Adjust debounce delay as needed
  }

  async function handleConfirm() {
    const accountNameValue = get(accountName);
    if (accountNameValue) {
      await checkAccountNameAvailability(accountNameValue);
      if (get(nameAvailable)) {
        if (!activeKey || !ownerKey) {
          console.error('Missing required keys');
          return;
        }

        const payload = {
          code,
          productId: product.id,
          activeKey,
          ownerKey,
          accountName: accountNameValue + '.gm',
        };

        try {
          const response = await fetch('/api/accounts/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();

          if (response.ok) {
            console.log('Account created successfully', result);
            goto('/success'); // Adjust this to your success page
          } else {
            console.error('Failed to create account', result);
          }
        } catch (error) {
          console.error('Error creating account', error);
        }
      }
    }
  }

  $: console.log({ activeKey, ownerKey });
</script>

<h1 class="text-3xl font-bold mb-6">Create new account</h1>

{#if $keysMissing}
  <p class="mb-4">To create an account using Anchor, please provide the following code:</p>
  <pre class="bg-gray-200 p-4 rounded">{code}</pre>
{:else}
  <p class="mb-4">Enter the desired EOS account name:</p>

  <div class="mb-4 relative">
    <input
      type="text"
      class="p-2 border rounded w-full pr-20"
      on:input={handleAccountNameInput}
      placeholder="Enter account name"
    />
    <span class="absolute right-2 top-2.5 text-gray-500">.gm</span>
    {#if $error}
      <p class="text-red-500 mt-2">{$error}</p>
    {/if}
    {#if $nameAvailable === true}
      <p class="text-green-500 mt-2">This account name is available.</p>
    {/if}
    {#if $nameAvailable === false}
      <p class="text-red-500 mt-2">This account name is not available.</p>
    {/if}
  </div>

  <button
    class="p-2 bg-blue-500 text-white rounded"
    on:click={handleConfirm}
    disabled={$loading}
  >
    {#if $loading}
      Loading...
    {/if}
    {#if !$loading}
      Confirm
    {/if}
  </button>
{/if}
