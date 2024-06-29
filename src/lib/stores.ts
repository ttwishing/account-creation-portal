import { navigating } from '$app/stores'
import { derived, writable } from 'svelte/store'

/** Can be set to true to indicate that the app is busy with something and should show a loading animation. */
export const busy = writable(false)

/** True if the app is navigating or busy. */
export const uiBlocked = derived([busy, navigating], ([$busy, $navigating]) => {
    return $busy || $navigating != null
})
