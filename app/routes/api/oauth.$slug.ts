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
  switch (operation) {
    case "authorize": {
      // rightmost query param will win in case of multiple ones with same name
      const queryParams = Object.fromEntries(
        url.searchParams.entries()
      ) as unknown as OAuthReqBody;

      const { oauthController } = await JacksonProvider({
        appBaseUrl: url.origin,
      });

      const { redirect_url, authorize_form } = await oauthController.authorize(
        queryParams
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
      // rightmost query param will win in case of multiple ones with same name
      const queryParams = Object.fromEntries(
        url.searchParams.entries()
      ) as unknown as { access_token: string };

      const { oauthController } = await JacksonProvider({
        appBaseUrl: url.origin,
      });
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

  const url = new URL(request.url);
  switch (operation) {
    case "saml": {
      const { oauthController } = await JacksonProvider({
        appBaseUrl: url.origin,
      });
      const { redirect_url } = await oauthController.samlResponse(
        await request.json()
      );
      return redirect(redirect_url, 302);
    }
    case "token": {
      const { oauthController } = await JacksonProvider({
        appBaseUrl: url.origin,
      });
      const tokenRes = await oauthController.token(await request.json());

      return json(tokenRes);
    }
  }
};
