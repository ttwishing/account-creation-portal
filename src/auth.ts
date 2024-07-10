import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import Apple from "@auth/sveltekit/providers/apple"
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_APPLE_ID, AUTH_APPLE_SECRET, AUTH_REDIRECT_URL } from "$env/static/private"

const redirectUrl = AUTH_REDIRECT_URL || "http://localhost:3000"

export const { handle, signIn } = SvelteKitAuth({
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
      redirectProxyUrl: `${redirectUrl}/auth/callback/google`,
    }),
    Apple({
      clientId: AUTH_APPLE_ID,
      clientSecret: AUTH_APPLE_SECRET,
      redirectProxyUrl: `${redirectUrl}/auth/callback/apple`,
    })
  ],
})