import type { LoadEvent } from '@sveltejs/kit';
  
export const load = ({ data }: LoadEvent) => {
  return {
    message: data?.message,
    status: data?.status,
    details: data?.details
  };
};