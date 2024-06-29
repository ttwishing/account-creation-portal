<script context="module" lang="ts">
    import type { Load } from '@sveltejs/kit';
    import { verifyTicket } from '$lib/sextant-api';
    import { HTTPError } from '$lib/helpers';
  
    export const load: Load = async ({ params }) => {
      const code = params.code;
  
      const res = await fetch(`/api/ticket/${code}`);
  
      if (!res.ok) {
        throw await HTTPError.fromResponse(res);
      }
      const ticket = await res.json();
  
      return {
        props: {
          code,
          ticket,
        },
      };
    };
  </script>
  
  <script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { createAccount } from '$lib/sextant-api';
    import Button from '~/components/button.svelte';
  
    export let code: string;
    export let ticket: any;
  
    let accountName = '';
    let activeKey = '';
    let ownerKey = '';
    let errorMessage = '';
    let successMessage = '';
  
    async function checkAvailability() {
      try {
        const res = await fetch(`/api/check-account?name=${accountName}`);
        if (!res.ok) {
          throw new Error('Account name not available');
        }
        return true;
      } catch (error: any) {
        errorMessage = error.message;
        return false;
      }
    }
  
    async function createAccountHandler() {
      if (!(await checkAvailability())) {
        return;
      }
  
      try {
        await createAccount({
          code,
          productId: ticket.productId,
          activeKey,
          ownerKey,
          accountName,
        });
        successMessage = 'Account created successfully!';
        errorMessage = '';
      } catch (error: any) {
        errorMessage = error.message;
        successMessage = '';
      }
    }
  </script>
  
  <div class="page">
    <h1>Create New Account</h1>
    {#if successMessage}
      <p>{successMessage}</p>
    {:else}
      <form on:submit|preventDefault={createAccountHandler}>
        <label>
          Account Name:
          <input type="text" bind:value={accountName} required />
        </label>
        <label>
          Active Key:
          <input type="text" bind:value={activeKey} required />
        </label>
        <label>
          Owner Key:
          <input type="text" bind:value={ownerKey} required />
        </label>
        {#if errorMessage}
          <p class="error">{errorMessage}</p>
        {/if}
        <Button type="submit">Create Account</Button>
      </form>
    {/if}
  </div>
  
  <style lang="scss">
    .page {
      max-width: 600px;
      margin: auto;
      padding: 1em;
    }
    label {
      display: block;
      margin-bottom: 1em;
    }
    input {
      width: 100%;
      padding: 0.5em;
      margin-top: 0.5em;
    }
    .error {
      color: red;
    }
  </style>
  