import { createHandler, HTTPError } from '$lib/helpers'
import { SextantError, verifyTicket } from '$lib/sextant'

export const get = createHandler(async (request) => {
    try {
        const result = await verifyTicket(request.params.id)
        return {
            status: 200,
            body: result
        }
    } catch (error) {
        if (error instanceof SextantError && error.code === 404) {
            throw new HTTPError(404, 'Ticket not found')
        }
        throw error
    }
})
