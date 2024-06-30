import { json, type RequestHandler } from '@sveltejs/kit'
import { SextantError, verifyCreationCode } from '$lib/sextant'

export const GET: RequestHandler = async ({ params }) => {
    try {
        if (!params.code) {
            return json({ error: 'Missing ticket id' }, { status: 400 })
        }
        const result = await verifyCreationCode(params.code)
        return json(result, { status: 200 })
    } catch (error) {
        if (error instanceof SextantError && error.code === 404) {
            return json({ error: 'Ticket not found' }, { status: 404 })
        }

        return json({ error }, { status: 500 })
    }
}
