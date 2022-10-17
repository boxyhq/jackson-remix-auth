# Remix Demo App with SAML Auth

This demo shows how to use [BoxyHQSSOStrategy](https://www.npmjs.com/package/@boxyhq/remix-auth-sso) to integrate Single Sign-On (SSO) into any remix application.

Two different SSO Service Provider setups are shown in this demo

1. With a [hosted](#hosted-sso-service-provider) SSO Service Provider.
2. With the SSO Service Provider functionality [embedded](#embedded-sso-service-provider) within the remix app using resource routes.

## Getting started

## Install dependencies

```
npm i
```

## Set up the env

Create a `.env` file from `.env.example`

```
cp .env.example .env
```

## Start the app

```
npm run dev
```

## Hosted SSO Service Provider

This uses a [hosted demo instance](https://jackson-demo.boxyhq.com) of [jackson](https://github.com/boxyhq/jackson) as the SSO Service Provider. Tenant and product config is already set up for [Mock SAML Provider](https://mocksaml.com).

To test out this flow, setup env with `BOXYHQSSO_ISSUER` as below:
BOXYHQSSO_ISSUER=https://jackson-demo.boxyhq.com

The tenant and product are locked into `boxyhq.com`(app/routes/login.tsx#L60) and [`saml-demo.boxyhq.com`](app/routes/login.tsx#L78) for which the connection is pre-configured at https://jackson-demo.boxyhq.com.

## Embedded SSO Service Provider

This uses the [jackson npm package](https://www.npmjs.com/package/@boxyhq/saml-jackson) to embed the Single Sign-On feature without depending on an external service. See `JacksonProvider` in [auth.jackson.server.ts](app/auth.jackson.server.ts#L42) where the SSO controllers `{ connectionAPIController, oauthController }` are exposed. The resource routes for SSO flow are added in [app/routes/api](app/routes/api/). You'll also need to [setup](app/auth.jackson.server.ts#L18) a database for this. To see the entire list of configuration options go to https://boxyhq.com/docs/jackson/deploy/env-variables.

Once the app is running [configure](https://boxyhq.com/docs/jackson/sso-flow/#21-add-connection) an SSO Connection as shown below. Here we are going with a SAML SSO Connection.

<details>
<summary>Below adds a SAML SSO connection for https://mocksaml.com</summary>
<pre>
curl --location --request POST 'http://localhost:3366/api/v1/connections' \
--header 'Authorization: Api-Key <API Key>' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'encodedRawMetadata=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxFbnRpdHlEZXNjcmlwdG9yIHhtbG5zOm1kPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6bWV0YWRhdGEiIGVudGl0eUlEPSJodHRwczovL3NhbWwuZXhhbXBsZS5jb20vZW50aXR5aWQiIHZhbGlkVW50aWw9IjIwMjYtMDYtMjJUMTg6Mzk6NTMuMDAwWiI+CiAgPElEUFNTT0Rlc2NyaXB0b3IgV2FudEF1dGhuUmVxdWVzdHNTaWduZWQ9ImZhbHNlIiBwcm90b2NvbFN1cHBvcnRFbnVtZXJhdGlvbj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnByb3RvY29sIj4KICAgIDxLZXlEZXNjcmlwdG9yIHVzZT0ic2lnbmluZyI+CiAgICAgIDxLZXlJbmZvIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIj4KICAgICAgICA8WDUwOURhdGE+CiAgICAgICAgICA8WDUwOUNlcnRpZmljYXRlPk1JSUM0akNDQWNvQ0NRQzMzd255YlQ1UVpEQU5CZ2txaGtpRzl3MEJBUXNGQURBeU1Rc3dDUVlEVlFRR0V3SlYKU3pFUE1BMEdBMVVFQ2d3R1FtOTRlVWhSTVJJd0VBWURWUVFEREFsTmIyTnJJRk5CVFV3d0lCY05Nakl3TWpJNApNakUwTmpNNFdoZ1BNekF5TVRBM01ERXlNVFEyTXpoYU1ESXhDekFKQmdOVkJBWVRBbFZMTVE4d0RRWURWUVFLCkRBWkNiM2g1U0ZFeEVqQVFCZ05WQkFNTUNVMXZZMnNnVTBGTlREQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQUQKZ2dFUEFEQ0NBUW9DZ2dFQkFMR2ZZZXR0TXNjdDFUNnRWVXdUdWROSkg1UG5iOUdHbmtYaTlady9lNng0NUREMApSdVJPTmJGbEoyVDRSakFFL3VHK0FqWHhYUThvMlNaZmI5K0dnbUNIdVRKRk5nSG9aMW5GVlhDbWIvSGc4SHBkCjR2T0FHWG5kaXhhUmVPaXEzRUg1WHZwTWpNa0ozKzgrOVZZTXpNWk9qa2dRdEFxTzM2ZUFGRmZOS1g3ZFRqM1YKcHdMa3Z6Ni9LRkNxOE9Bd1krQVVpNGVabTVKNTdEMzFHempId2ZqSDlXVGVYME15bmRtbk5CMXFWNzVxUVIzYgoyL1c1c0dIUnYrOUFhcmdnSmtGK3B0VWtYb0x0VkE1MXdjZlltNmhJTHB0cGRlNUZRQzhSV1kxWXJzd0JXQUVaCk5meXJSNEplU3dlRWxOSGc0TlZPczRUd0dqT1B3V0dxelRmZ1RsRUNBd0VBQVRBTkJna3Foa2lHOXcwQkFRc0YKQUFPQ0FRRUFBWVJsWWZsU1hBV29acEZmd05pQ1FWRTVkOXpaMERQek5kV2hBeWJYY1R5TWYwejVtRGY2RldCVwo1R3lvaTl1M0VNRURuekxjSk5rd0pBQWMzOUFwYTRJMi90bWwrSnkyOWRrOGJUeVg2bTkzbmdtQ2dkTGg1WmE0CmtodVUzQU0zTDYzZzdWZXhDdU83a3dramgvK0xxZGNJWHNWR082WERmdTJRT3MxWHBlOXpJekxwd20vUk5ZZVgKVWpiU2o1Y2UvamVrcEF3N3F5VlZMNHhPeWg4QXRVVzFlazN3SXcxTUp2RWdFUHQwZDE2b3NoV0pwb1MxT1Q4TApyLzIyU3ZZRW8zRW1TR2RUVkdnazN4M3MrQTBxV0FxVGN5anI3UTRzL0dLWVJGZm9tR3d6MFRaNEl3MVpOOTlNCm0wZW8yVVNsU1JUVmw3UUhSVHVpdVNUaEhwTEtRUT09CjwvWDUwOUNlcnRpZmljYXRlPgogICAgICAgIDwvWDUwOURhdGE+CiAgICAgIDwvS2V5SW5mbz4KICAgIDwvS2V5RGVzY3JpcHRvcj4KICAgIDxOYW1lSURGb3JtYXQ+dXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6MS4xOm5hbWVpZC1mb3JtYXQ6ZW1haWxBZGRyZXNzPC9OYW1lSURGb3JtYXQ+CiAgICA8U2luZ2xlU2lnbk9uU2VydmljZSBCaW5kaW5nPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YmluZGluZ3M6SFRUUC1SZWRpcmVjdCIgTG9jYXRpb249Imh0dHBzOi8vbW9ja3NhbWwuY29tL2FwaS9zYW1sL3NzbyIvPgogICAgPFNpbmdsZVNpZ25PblNlcnZpY2UgQmluZGluZz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmJpbmRpbmdzOkhUVFAtUE9TVCIgTG9jYXRpb249Imh0dHBzOi8vbW9ja3NhbWwuY29tL2FwaS9zYW1sL3NzbyIvPgogIDwvSURQU1NPRGVzY3JpcHRvcj4KPC9FbnRpdHlEZXNjcmlwdG9yPg==' \
--data-urlencode 'defaultRedirectUrl=http://localhost:3366' \
--data-urlencode 'redirectUrl=["http://localhost:3366/*"]' \
--data-urlencode 'tenant=boxyhq.com' \
--data-urlencode 'product=saml-demo.boxyhq.com' \
--data-urlencode 'name=demo-config' \
--data-urlencode 'description=Demo SAML config'
</pre>
</details>

## Routes

1. `/` - Renders protected content if user is logged in.

2. `/login` - Renders a form (action - `/auth/sso`) with an input box which can take in an email that can be used to [switch](app/routes/auth.sso.tsx#L35) tenant dynamically.
3. `/logout`
4. `/auth/sso` (hosted),`/auth/sso/embed`(embedded) - Action handlers for login initiating the OAuth 2.0 flow to the IdP.
5. `/auth/sso/callback` (hosted),`/auth/sso/embed/callback` (embedded) - SSO Service Provider (Jackson) after parsing the SAML/OIDC response from IdP redirects back here with the authorization code. The SSO strategy uses the code to obtain the token and further the user profile and finally redirects back to `successRedirect` path.

## Strategy Usage

`auth.server.ts`

```ts
// BASE_URL should be the hosting url of the app
// clientID and Secret set to 'dummy' here; they will be populated dynamically from the client side. The clientID is passed as a URL encoded string containing the tenant and product
export const auth = new Authenticator<BoxyHQSSOProfile>(sessionStorage);

// This strategy points to a hosted jackson instance
auth.use(
  new BoxyHQSSOStrategy(
    {
      issuer: process.env.BOXYHQSSO_ISSUER // "https://jackson-demo.boxyhq.com",
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
  new BoxyHQSSOStrategy(
    {
      issuer: process.env.BOXYHQSSO_ISSUER, //same as the APP URL
      clientID: "dummy",
      clientSecret: process.env.CLIENT_SECRET_VERIFIER, // this env will be used to perform authentication at token endpoint
      callbackURL: new URL("/auth/saml/embed/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      return profile;
    }
  ),
  "boxyhq-saml-embed"
);
```

## FAQ

How is the tenant/product passed from the client side?

In the login form action handlers [app/routes/auth.sso.tsx](app/routes/auth.sso.tsx#L41), [app/routes/auth.sso.embed.tsx](app/routes/auth.sso.embed.tsx#L41), clientID is passed in the context param to authorize endpoint.

How can I test with a different "tenant/product"?

The demo uses email to detect the tenant. You can use an alternate mechanism such as directly asking for tenant information from the user. The same applies to "product". You might have to whitelist the product in [`validateProduct`](app/utils.server.ts#L20).
