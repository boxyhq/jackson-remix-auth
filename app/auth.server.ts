import { createCookieSessionStorage } from "remix";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is required");
}

if (!process.env.CLIENT_SECRET) {
  throw new Error("CLIENT_SECRET is required");
}

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is required");
}

if (!process.env.JACKSON_SERVICE) {
  throw new Error("JACKSON_SERVICE is required");
}

const BASE_URL = process.env.BASE_URL;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret"], // This should be an env variable
    secure: process.env.NODE_ENV === "production",
  },
});

export interface SAMLJacksonProfile {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
}

export const auth = new Authenticator<{
  profile: SAMLJacksonProfile;
  accessToken: string;
  extraParams: Record<string, never>;
}>(sessionStorage);

auth.use(
  new OAuth2Strategy(
    {
      authorizationURL: `${process.env.JACKSON_SERVICE}/api/oauth/authorize`,
      tokenURL: `${process.env.JACKSON_SERVICE}/api/oauth/token`,
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
    },
    async ({ accessToken, extraParams }) => {
      // here you can use the params above to get the user and return it
      // what you do inside this and how you find the user is up to you
      const res = await fetch(
        `${process.env.JACKSON_SERVICE}/api/oauth/userinfo`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const profile = await res.json();
      return {
        accessToken,
        extraParams,
        profile,
      };
    }
  ),
  "boxyhq-saml"
);
