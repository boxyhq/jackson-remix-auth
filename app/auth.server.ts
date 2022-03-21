import { createCookieSessionStorage } from "remix";
import { Authenticator } from "remix-auth";
import {
  BoxyHQSAMLStrategy,
  type BoxyHQSAMLProfile,
} from "@boxyhq/remix-auth-saml";
import invariant from "tiny-invariant";

invariant(process.env.BASE_URL, "Expected BASE_URL to be set in env");
invariant(
  process.env.BOXYHQSAML_ISSUER,
  "Expected BOXYHQSAML_ISSUER to be set in env"
);

const BASE_URL = process.env.BASE_URL;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: process.env.COOKIE_SECRETS!.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

export const auth = new Authenticator<BoxyHQSAMLProfile>(sessionStorage);

// This strategy points to an hosted jackson instance
auth.use(
  new BoxyHQSAMLStrategy(
    {
      issuer: "https://jackson-demo.boxyhq.com",
      clientID: "dummy",
      clientSecret: "dummy",
      callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      return profile;
    }
  )
);
// This strategy points to the remix app host (with the resource routes setup to handle SAML flow)
auth.use(
  new BoxyHQSAMLStrategy(
    {
      issuer: process.env.BOXYHQSAML_ISSUER, //same as the APP URL
      clientID: "dummy",
      clientSecret: "dummy",
      callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      return profile;
    }
  ),
  "boxyhq-saml-embed"
);
