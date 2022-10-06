// NOTE: This is purely a resource route, eventhough some part of it like the /authorize happens in the browser, it's not part of the
// host app. Any error for the browser flow (/authorize or /saml) can be set as a flash message and redirected to an error page for jackson
// Other errors(/userinfo and /token) can be thrown and should be caught by the host app CatchBoundary
import type { OAuthReq, OIDCAuthzResponsePayload } from "@boxyhq/saml-jackson";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import JacksonProvider, {
  extractAuthTokenFromHeader,
} from "~/auth.jackson.server";
import {
  commitSession,
  getSession,
  JACKSON_ERROR_COOKIE_KEY,
} from "~/sessions.server";

// Handles GET /api/oauth/authorize, GET /api/oauth/userinfo
export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  // maybe you change the name of the file to oauth.$somethingElse.ts, below invariant validates that the params is defined
  invariant(params.slug, "expected params.slug");
  const operation = params.slug;
  if (
    operation !== "authorize" &&
    operation !== "oidc" &&
    operation !== "userinfo"
  ) {
    // Will be caught in CatchBoundary defined in root.tsx
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const url = new URL(request.url);

  const { oauthController } = await JacksonProvider({
    appBaseUrl: url.origin,
  });

  // rightmost query param will win in case of multiple ones with same name
  const queryParams = Object.fromEntries(url.searchParams.entries());

  switch (operation) {
    case "authorize": {
      try {
        const { redirect_url, authorize_form } =
          await oauthController.authorize(queryParams as unknown as OAuthReq);
        if (redirect_url) {
          //  Redirect binding
          return redirect(redirect_url, 302);
        } else {
          //  POST Binding
          return new Response(authorize_form, {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          });
        }
      } catch (err: any) {
        console.error("authorize error:", err);
        const { message, statusCode = 500 } = err;
        // set error in cookie redirect to error page
        session.set(JACKSON_ERROR_COOKIE_KEY, { message, statusCode });
        return redirect("/error", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }
    }
    case "oidc": {
      try {
        const { redirect_url } = await oauthController.oidcAuthzResponse(
          queryParams as unknown as OIDCAuthzResponsePayload
        );
        if (redirect_url) {
          redirect(redirect_url, 302);
        }
      } catch (err: any) {
        console.error("oidc callback error:", err);
        const { message, statusCode = 500 } = err;
        // set error in cookie redirect to error page
        session.set(JACKSON_ERROR_COOKIE_KEY, { message, statusCode });
        return redirect("/error", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }
    }
    case "userinfo": {
      let token: string | null = extractAuthTokenFromHeader(request);

      // check for query param
      if (!token) {
        token = queryParams.access_token;
      }

      if (!token) {
        return new Response("Unauthorized", {
          status: 401,
        });
      }
      try {
        const profile = await oauthController.userInfo(token);
        return json(profile);
      } catch (error: any) {
        const { message, statusCode = 500 } = error;
        throw new Response(message, { status: statusCode });
      }
    }
  }
};

// Handles POST /api/oauth/saml, /api/oauth/oidc, POST /api/oauth/token
export const action: ActionFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  // maybe you change the name of the file to $somethingElse.ts, below invariant validates that the params is defined
  invariant(params.slug, "expected params.slug");
  const operation = params.slug;
  if (operation !== "saml" && operation !== "token") {
    // Will be caught in CatchBoundary defined in root.tsx
    throw new Response("Not Found", {
      status: 404,
    });
  }

  if (request.method !== "POST") {
    // Will be caught in CatchBoundary defined in root.tsx
    throw new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  const contentType = request.headers.get("Content-Type");
  if (contentType === "application/x-www-form-urlencoded") {
    body = Object.fromEntries(await request.formData());
  } else if (contentType === "application/json") {
    body = await request.json();
  } else {
    throw new Response("Unsupported Media Type", { status: 415 });
  }

  const url = new URL(request.url);
  const { oauthController } = await JacksonProvider({
    appBaseUrl: url.origin,
  });
  switch (operation) {
    case "saml": {
      try {
        const { redirect_url, app_select_form } =
          await oauthController.samlResponse(body);

        if (redirect_url) {
          return redirect(redirect_url, 302);
        } else {
          return new Response(app_select_form, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      } catch (err: any) {
        console.error("saml callback error:", err);
        const { message, statusCode = 500 } = err;
        // set error in cookie redirect to error page
        session.set(JACKSON_ERROR_COOKIE_KEY, { message, statusCode });
        return redirect("/error", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }
    }
    case "token": {
      try {
        const tokenRes = await oauthController.token(body);
        return json(tokenRes);
      } catch (error: any) {
        const { message, statusCode = 500 } = error;
        throw new Response(message, { status: statusCode });
      }
    }
  }
};
