import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import { AUTH_APPLE_ID, AUTH_APPLE_SECRET, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_REDIRECT_URL } from "$env/static/private"
import type { OAuthConfig, OAuthUserConfig } from "@auth/sveltekit/providers"

const redirectUrl = AUTH_REDIRECT_URL || "http://localhost:3000"

interface AppleProfile {
  sub: string
  name?: string
  email?: string
}

interface AppleTokens {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  id_token: string
}

// Function to generate a random state
function generateRandomState(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const appleProvider: OAuthConfig<AppleProfile> = {
  id: "apple",
  name: "Apple",
  type: "oauth",
  wellKnown: "https://appleid.apple.com/.well-known/openid-configuration",
  authorization: {
    url: 'https://appleid.apple.com/auth/authorize',
    params: {
      scope: "name email",
      response_type: "code",
      response_mode: "form_post",
      state: generateRandomState(),
    },
  },
  token: {
    url: `https://appleid.apple.com/auth/token`,
  },
  userinfo: {
    url: "https://appleid.apple.com/auth/userinfo",
    async request({ tokens }: { tokens: AppleTokens }) {
      return { sub: tokens.id_token.split('.')[1] }
    },
  },
  checks: ["pkce", "state"],
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  profile(profile: AppleProfile) {
    return {
      id: profile.sub,
      name: profile.name || null,
      email: profile.email || null,
      image: null,
    }
  },
    clientId: AUTH_APPLE_ID,
    clientSecret: AUTH_APPLE_SECRET,
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [
    appleProvider as OAuthConfig<AppleProfile> & OAuthUserConfig<AppleProfile>,
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
      redirectProxyUrl: `${redirectUrl}/auth/callback/google`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub || profile.id
        token.email = profile.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  secret: AUTH_SECRET,
})
