import { redirect } from '@sveltejs/kit';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url }) => {
  const ticket = url.searchParams.get('ticket');
  const searchParams = url.searchParams;
  const targetUrl = ticket ? `/create?${searchParams}` : `/buy?${searchParams}`;
  throw redirect(302, targetUrl);
};
