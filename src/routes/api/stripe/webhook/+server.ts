/** Stripe Webhook. */

import { json } from '@sveltejs/kit';
import { sendEmail } from '$lib/sendgrid';
import { createTicket, SextantError } from '$lib/sextant';
import { PUBLIC_URL } from '$env/static/public'
import { webhookEvent } from '$lib/stripe';
import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

// POST /webhook
export const POST: RequestHandler = async ({ request }) => {
  let event: Stripe.Event;

  try {
    event = await webhookEvent(request);
  } catch (err) {
    console.log('Invalid stripe event', err);
    return json({ error: 'Invalid stripe event' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const data = event.data.object as Stripe.Checkout.Session;

    if (data.payment_status === 'unpaid') {
      return json({ error: 'Not paid' }, { status: 400 });
    }

    const code = data.metadata?.code;
    if (typeof code !== 'string' || code.length < 10) {
      return json({ error: 'Invalid code' }, { status: 400 });
    }

    const sextantId = data.metadata?.sextantId;
    if (typeof sextantId !== 'string') {
      return json({ error: 'Missing sextant id' }, { status: 400 });
    }

    try {
      await createTicket(code, sextantId, `stripe ${data.id}`);
      console.log(`Created ticket for ${data.id}`);
    } catch (err) {
      if (err instanceof SextantError && err.reason === 'Ticket code exists') {
        console.log('WARN: Ticket code already existed in sextant (re-delivery?)');
      } else {
        console.error('Error creating ticket:', err);
        return json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }

    if (data.customer_details?.email && data.metadata?.request) {
      try {
        await sendEmail(data.customer_details.email, {
          createurl: `${PUBLIC_URL}/activate/${data.metadata.request}`
        });
        console.log('Email sent to:', data.customer_details.email);
      } catch (err) {
        console.error('Failed to send email', err);
      }
    }
  }

  return json('Ok', { status: 200 });
};
