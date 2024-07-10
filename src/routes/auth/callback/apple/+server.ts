import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
  const formData = await request.formData();
  const queryParams: Record<string, string> = {};
  formData.forEach((value, key) => {
    queryParams[key] = value.toString();
  });

  const searchParams = new URLSearchParams(queryParams);
  const redirectUrl = `${url.origin}/auth/callback/apple?${searchParams.toString()}`;

  throw redirect(302, redirectUrl);
};
