<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { goto } from '$app/navigation';
	import { checkAccountName } from '$lib/sextant';

  export let code: string;
  export let productId: string;
  export let pageQueryString: string;

  let accountName = writable('');
  let nameAvailable = writable<boolean | null>(null);
  let loading = writable(false);
  let error = writable<string | null>(null);

  async function checkAccountNameAvailability(accountName: string) {
    error.set(null);
    nameAvailable.set(null);
    loading.set(true);

    try {
      const result = await checkAccountName(productId, accountName);

      if (result && result.nameAvailable) {
        nameAvailable.set(true);
      } else {
        nameAvailable.set(false);
        error.set('This account name is not available');
      }
    } catch (err) {
      error.set('Error checking account name availability');
    } finally {
      loading.set(false);
    }
  }

  function handleAccountNameInput(event: Event) {
    const target = event.target as HTMLInputElement;
    accountName.set(target.value.trim().toLowerCase());
  }

  async function handleConfirm() {
    const accountNameValue = get(accountName);
    if (accountNameValue) {
      await checkAccountNameAvailability(accountNameValue);
      if (get(nameAvailable)) {
        // Proceed with account creation logic
        const urlParams = new URLSearchParams(pageQueryString);
        const activeKey = urlParams.get('activeKey');
        const ownerKey = urlParams.get('ownerKey');
        const accountName = accountNameValue;

        if (!activeKey || !ownerKey || !accountName) {
          console.error('Missing required keys or account name');
          return;
        }

        const payload = {
          code,
          productId,
          activeKey,
          ownerKey,
          accountName,
        };

        try {
          const response = await fetch('/api/create-account', {
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
</script>

<h1 class="text-3xl font-bold mb-6">Create new account</h1>
<p class="mb-4">Enter the desired EOS account name:</p>

<div class="mb-4">
  <input
    type="text"
    class="p-2 border rounded w-full"
    on:input={handleAccountNameInput}
    placeholder="Enter account name"
  />
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
