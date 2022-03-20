import { ActionFunction, json, LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";
import JacksonProvider, {
  extractAuthTokenFromHeader,
  type OAuthReqBody,
} from "~/auth.jackson";

export const loader: LoaderFunction = async ({ params, request }) => {
  invariant(params.slug, "expected params.slug");
  const operation = params.slug as "authorize" | "userinfo";
  const url = new URL(request.url);

  switch (operation) {
    // GET api/oauth/authorize
    case "authorize": {
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
    // GET api/oauth/userinfo
    case "userinfo": {
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
        return new Response('{ message: "Unauthorized" }', {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const profile = await oauthController.userInfo(token);

      return json(profile);
    }

    default: {
      console.log(`Handler not defined for ${operation}`);
    }
  }
};

export const action: ActionFunction = async ({ params, request }) => {
  // handle samlResponse, and code exchange for token
};
