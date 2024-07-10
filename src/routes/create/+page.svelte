<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { onMount } from 'svelte';
  import type { Product } from '$lib/types';
  import { Name } from '@wharfkit/antelope';
  import { t } from '$lib/i18n';

  interface PageData {
    code: string;
    product: Product;
    searchParams: string;
  }

  export let data: PageData;

  let code = data.code;
  let product = data.product;
  let searchParamsString = data.searchParams;

  let accountName = writable('');
  let nameAvailable = writable<boolean | null>(null);
  let loading = writable(false);
  let error = writable<string | null>(null);
  let accountCreated = writable(false);
  let creatingAccount = writable(false);

  let activeKey: string | null = null;
  let ownerKey: string | null = null;
  let ticket: string | null = null;
  let keysMissing = writable(false);
  let debounceTimeout: NodeJS.Timeout;

  onMount(() => {
    const searchParams = new URLSearchParams(searchParamsString);
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
        throw new Error($t('Failed to check account name availability'));
      }

      const { nameAvailable: availability } = await result.json();

      nameAvailable.set(availability);
    } catch (err) {
      error.set($t('Error checking account name availability'));
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
    }, 500);
  }

  async function handleConfirm() {
    const accountNameValue = get(accountName);
    if (accountNameValue) {
      await checkAccountNameAvailability(accountNameValue);
      if (get(nameAvailable)) {
        if (!activeKey || !ownerKey) {
          console.error($t('Missing required keys'));
          return;
        }

        const payload = {
          ticket,
          productId: product.id,
          activeKey,
          ownerKey,
          accountName: accountNameValue + '.gm',
        };

        try {
          creatingAccount.set(true);
          const response = await fetch('/api/accounts/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();

          if (response.ok) {
            console.log($t('Account created successfully'), result);
            accountCreated.set(true);

            if (window.opener) {
              window.opener.postMessage({
                type: 'account_created',
                data: {
                  accountName: Name.from(accountNameValue + '.gm'),
                  activeKey,
                  ownerKey,
                }
              }, '*');
            }

          } else {
            console.error($t('Failed to create account'), result);
            error.set($t('Failed to create account: {reason}', { reason: result.error || $t('Unknown error') }));
          }
        } catch (err: unknown) {
          console.error($t('Error creating account'), err);
          error.set($t('Error creating account: {reason}', { reason: ((err as { message: string }).message || $t('Unknown error')) }));
        } finally {
          creatingAccount.set(false);
        }
      }
    }
  }
</script>

<div class="container mx-auto max-w-md p-4">
  {#if $keysMissing}
    <div class="bg-surface-100-800-token p-4 rounded">
      <h2 class="text-2xl font-bold mb-4">{$t('To create an account using Anchor')}</h2>
      <p class="mb-4">{$t('To create an account using Anchor, please provide the following code:')}</p>
      <pre class="bg-surface-200-700-token p-4 rounded">{code}</pre>
    </div>
  {:else if $accountCreated}
    <div class="bg-surface-100-800-token p-4 rounded flex flex-col items-center">
      <div class="w-16 h-16 mb-8 flex items-center justify-center bg-success-500 rounded-full text-white">
        ✔️
      </div>
      <h2 class="text-2xl font-bold mb-4">{$t('Account Created Successfully!')}</h2>
      <p class="mb-4">{$t('Your account was created successfully. You can now use this account on the wallet that generated the private keys.')}</p>
    </div>
  {:else}
    <div class="bg-surface-100-800-token p-4 rounded">
      <h1 class="text-3xl font-bold mb-6">{$t('Create New Account')}</h1>

      <p class="mb-4">{$t('Enter the desired EOS account name:')}</p>

      <div class="mb-4 relative">
        <input
          type="text"
          class="w-full p-2 pr-20 border border-surface-300-600-token rounded"
          on:input={handleAccountNameInput}
          placeholder={$t('Enter account name')}
        />
        <span class="absolute right-2 top-2.5 text-surface-500">.gm</span>
        {#if $error}
          <p class="text-error-500 mt-2">{$error}</p>
        {/if}
        {#if $nameAvailable === true}
          <p class="text-success-500 mt-2">{$t('This account name is available.')}</p>
        {/if}
        {#if $nameAvailable === false}
          <p class="text-error-500 mt-2">{$t('This account name is not available.')}</p>
        {/if}
      </div>

      <button
        class="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={handleConfirm}
        disabled={$loading || $creatingAccount}
      >
        {#if $loading || $creatingAccount}
          <svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {#if $loading}
            {$t('Checking name availability...')}
          {:else if $creatingAccount}
            {$t('Creating account...')}
          {/if}
        {:else}
          {$t('Confirm')}
        {/if}
      </button>
    </div>
  {/if}
</div>