/** Stripe Webhook. */

import { getEnv } from '$lib/helpers'
import { sendEmail } from '$lib/sendgrid'
import { createTicket, SextantError } from '$lib/sextant'
import { webhookEvent } from '$lib/stripe'
import type { RequestHandler } from '@sveltejs/kit'
import type Stripe from 'stripe'

// POST /webhook
export const post: RequestHandler = async (kitEvent) => {
    let event: Stripe.Event
    try {
        event = await webhookEvent(kitEvent.request)
    } catch (error) {
        console.log('Invalid stripe event', error)
        return { status: 400, error }
    }
    if (event.type === 'checkout.session.completed') {
        const data = event.data.object as Stripe.Checkout.Session
        if (data.payment_status === 'unpaid') {
            throw new Error('Not paid')
        }
        const code = data.metadata.code
        if (typeof code !== 'string' || code.length < 10) {
            throw new Error('Invalid code')
        }
        const sextantId = data.metadata.sextantId
        if (typeof sextantId !== 'string') {
            throw new Error('Missing sextant id')
        }
        try {
            await createTicket(code, sextantId, `stripe ${data.id}`)
            console.log(`Created ticket for ${data.id}`)
        } catch (error) {
            if (error instanceof SextantError && error.reason === 'Ticket code exists') {
                console.log('WARN: Ticket code already existed in sextant (re-delivery?)')
            } else {
                throw error
            }
        }
        sendEmail(data.customer_details.email, {
            createurl: `${getEnv('PUBLIC_URL')}/activate/${data.metadata.request}`
        }).catch((error) => {
            console.error('Failed to send email', error)
        })
    }
    return {
        status: 200,
        body: 'Ok'
    }
}
