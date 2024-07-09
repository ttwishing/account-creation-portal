import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import Apple from "@auth/sveltekit/providers/apple"
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_APPLE_ID, AUTH_APPLE_SECRET } from "$env/static/private"

export const { handle, signIn } = SvelteKitAuth({
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
      redirectProxyUrl: "http://localhost:5174/auth/google",
    }),
    Apple({
      clientId: AUTH_APPLE_ID,
      clientSecret: AUTH_APPLE_SECRET,
      redirectProxyUrl: "http://localhost:5174/auth/apple",
    })
  ],
})