import { ActionFunction, json, LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";
import JacksonProvider, {
  extractAuthTokenFromHeader,
  type OAuthReqBody,
} from "~/auth.jackson.server";

// Handles GET /api/oauth/authorize, GET /api/oauth/userinfo
export const loader: LoaderFunction = async ({ params, request }) => {
  // maybe you change the name of the file to oauth.$somethingElse.ts, below invariant validates that the params is defined
  invariant(params.slug, "expected params.slug");
  const operation = params.slug;
  if (operation !== "authorize" && operation !== "userinfo") {
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

  try {
    switch (operation) {
      case "authorize": {
        const { redirect_url, authorize_form } =
          await oauthController.authorize(
            queryParams as unknown as OAuthReqBody
          );
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

        const profile = await oauthController.userInfo(token);
        return json(profile);
      }
    }
  } catch (error: any) {
    const { message, statusCode = 500 } = error;
    throw new Response(message, { status: statusCode });
  }
};

// Handles POST /api/oauth/saml, POST /api/oauth/token
export const action: ActionFunction = async ({ params, request }) => {
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
  try {
    switch (operation) {
      case "saml": {
        const { redirect_url } = await oauthController.samlResponse(body);
        return redirect(redirect_url, 302);
      }
      case "token": {
        const tokenRes = await oauthController.token(body);
        return json(tokenRes);
      }
    }
  } catch (error: any) {
    const { message, statusCode = 500 } = error;
    throw new Response(message, { status: statusCode });
  }
};
