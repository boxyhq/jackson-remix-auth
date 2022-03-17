# Remix Demo App with SAML Auth
This demo shows how to use [BoxyHQSAMLStrategy](https://www.npmjs.com/package/@boxyhq/remix-auth-saml) to integrate SAML login into any remix application.


## BoxyHQ SAML Service Provider
This demo uses a [hosted demo instance](https://jackson-demo.boxyhq.com) of [jackson](https://github.com/boxyhq/jackson) as the SAML Service Provider. Tenant and product config is already set up for [Mock SAML Provider](https://mocksaml.com).

## Routes

1. `/` - Renders protected content if user is logged in.

2. `/login` - Renders a form (action - `/auth/saml`) with input box which can take in a email that can be used to switch SAML tenant dynamically. See [auth.saml.tsx](app/routes/auth.saml.tsx#L33).
3. `/logout`
4. `/auth/saml` - Action handler for login initiating the OAuth 2.0 flow to the SAML IdP.
5. `/auth/saml/callback` - Handles the redirection from the SAML Service Provider

## Strategy Usage

`auth.server.ts`
```ts
// BASE_URL should be the hosting url of the app
// clientID and Secret set to 'dummy' here; they will be populated dynamically from the client side (could be DNS based or an email input)
export const auth = new Authenticator<BoxyHQSAMLProfile>(sessionStorage);

auth.use(
  new BoxyHQSAMLStrategy(
    {
      issuer: process.env.BOXYHQSAML_ISSUER!,
      clientID: "dummy",
      clientSecret: "dummy",
      callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      return profile;
    }
  )
);
```

## FUTURE UPDATES

We are looking into embed the SAML Service Provider logic into the app, to remove the dependency of a separate hosted service.