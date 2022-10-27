import { Authenticator } from "remix-auth";
import {
  BoxyHQSSOStrategy,
  type BoxyHQSSOProfile,
} from "@boxyhq/remix-auth-sso";
import invariant from "tiny-invariant";
import sessionStorage from "./sessions.server";

invariant(process.env.BASE_URL, "Expected BASE_URL to be set in env");
invariant(
  process.env.BOXYHQSSO_ISSUER,
  "Expected BOXYHQSSO_ISSUER to be set in env"
);

const BASE_URL = process.env.BASE_URL;
const BOXYHQSSO_ISSUER = process.env.BOXYHQSSO_ISSUER;

let auth: Authenticator;
declare global {
  var __auth: Authenticator | undefined;
}

function createAuthenticator() {
  const auth = new Authenticator<BoxyHQSSOProfile>(sessionStorage);

  // This strategy points to a hosted jackson instance
  auth.use(
    new BoxyHQSSOStrategy(
      {
        issuer: BOXYHQSSO_ISSUER, // Set BOXYHQSSO_ISSUER in env to "https://jackson-demo.boxyhq.com",
        clientID: "dummy",
        clientSecret: process.env.CLIENT_SECRET_VERIFIER || "dummy",
        callbackURL: new URL("/auth/sso/callback", BASE_URL).toString(),
      },
      async ({ profile }: { profile: BoxyHQSSOProfile }) => {
        return profile;
      }
    )
  );
  // This strategy points to the same remix app host (resource routes are setup to handle SAML flow)
  auth.use(
    new BoxyHQSSOStrategy(
      {
        issuer: BOXYHQSSO_ISSUER, //same as the APP URL
        clientID: "dummy",
        clientSecret: process.env.CLIENT_SECRET_VERIFIER || "dummy",
        callbackURL: new URL("/auth/sso/embed/callback", BASE_URL).toString(),
      },
      async ({ profile }: { profile: BoxyHQSSOProfile }) => {
        return profile;
      }
    ),
    "boxyhq-sso-embed"
  );
  return auth;
}

if (process.env.NODE_ENV === "production") {
  auth = createAuthenticator();
} else {
  if (!global.__auth) {
    global.__auth = createAuthenticator();
  }
  auth = global.__auth;
}

export { auth };
