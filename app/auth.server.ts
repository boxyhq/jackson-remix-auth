import { createCookieSessionStorage } from "remix";
import { Authenticator } from "remix-auth";
import {
  BoxyHQSAMLStrategy,
  type BoxyHQSAMLProfile,
} from "@boxyhq/remix-auth-saml";

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is required");
}

if (!process.env.BOXYHQSAML_ISSUER) {
  throw new Error("BOXYHQSAML_ISSUER is required");
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

export const auth = new Authenticator<BoxyHQSAMLProfile>(sessionStorage);

auth.use(
  new BoxyHQSAMLStrategy(
    {
      issuer: process.env.BOXYHQSAML_ISSUER!,
      clientID: "dummy",
      clientSecret: "dummy",
      callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
    },
    // eslint-disable-next-line no-empty-pattern
    async ({ profile }) => {
      return profile;
    }
  )
);
