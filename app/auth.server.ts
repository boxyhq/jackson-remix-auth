import { Authenticator } from "remix-auth";
import {
  BoxyHQSAMLStrategy,
  type BoxyHQSAMLProfile,
} from "@boxyhq/remix-auth-saml";
import invariant from "tiny-invariant";
import sessionStorage from "./sessions.server";

invariant(process.env.BASE_URL, "Expected BASE_URL to be set in env");
invariant(
  process.env.BOXYHQSAML_ISSUER,
  "Expected BOXYHQSAML_ISSUER to be set in env"
);

const BASE_URL = process.env.BASE_URL;
const BOXYHQSAML_ISSUER = process.env.BOXYHQSAML_ISSUER;

let auth: Authenticator;
declare global {
  var __auth: Authenticator | undefined;
}

function createAuthenticator() {
  const auth = new Authenticator<BoxyHQSAMLProfile>(sessionStorage);

  // This strategy points to a hosted jackson instance
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
  // This strategy points to the same remix app host (resource routes are setup to handle SAML flow)
  auth.use(
    new BoxyHQSAMLStrategy(
      {
        issuer: BOXYHQSAML_ISSUER, //same as the APP URL
        clientID: "dummy",
        clientSecret: process.env.CLIENT_SECRET_VERIFIER || "dummy",
        callbackURL: new URL("/auth/saml/embed/callback", BASE_URL).toString(),
      },
      async ({ profile }) => {
        return profile;
      }
    ),
    "boxyhq-saml-embed"
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
