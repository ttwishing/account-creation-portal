<script context="module" lang="ts">
    import { redirect } from '@sveltejs/kit';
    import type { Load } from '@sveltejs/kit';

    export const load: Load = async ({ url }) => {
        const code = url.searchParams.get('code');
        if (code) {
        throw redirect(302, '/create');
        } else {
        throw redirect(302, '/buy');
        }
    };
</script>
  