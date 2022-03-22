import jackson from "@boxyhq/saml-jackson";
import type {
  OAuthReqBody,
  JacksonOption,
  DatabaseOption,
  IAPIController,
  IOAuthController,
} from "@boxyhq/saml-jackson";
import invariant from "tiny-invariant";

// 📄 https://boxyhq.com/docs/jackson/deploy/env-variables
const opts: JacksonOption = {
  externalUrl: "", // APP BASE URL
  samlPath: "/api/oauth/saml",
  samlAudience: "",
  db: {
    engine: "sql",
    url: "postgresql://postgres:postgres@localhost:5432/postgres",
    type: "postgres",
  } as DatabaseOption,
  clientSecretVerifier: process.env.CLIENT_SECRET_VERIFIER,
};

let apiController: IAPIController;
let oauthController: IOAuthController;

declare global {
  var __apiController: IAPIController;
  var __oauthController: IOAuthController;
}

async function JacksonProvider({
  appBaseUrl,
}: {
  appBaseUrl: string;
}): Promise<{
  apiController: IAPIController;
  oauthController: IOAuthController;
}> {
  const _opts = { ...opts, externalUrl: appBaseUrl, samlAudience: appBaseUrl };
  // this is needed because in development we don't want to restart
  // the server with every change, but we want to make sure we don't
  // create a new connection to the DB with every change either.
  if (process.env.NODE_ENV === "production") {
    const controllers = await jackson(_opts);
    apiController = controllers.apiController;
    oauthController = controllers.oauthController;
  } else {
    if (!global.__apiController && !global.__oauthController) {
      const controllers = await jackson(_opts);
      global.__apiController = controllers.apiController;
      global.__oauthController = controllers.oauthController;
    }
    apiController = global.__apiController;
    oauthController = global.__oauthController;
  }

  return { apiController, oauthController };
}

const extractAuthTokenFromHeader = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  const parts = (authHeader || "").split(" ");
  if (parts.length > 1) {
    return parts[1];
  }

  return null;
};

const validateApiKey = (key: string) => {
  // Server side error -> Should be caught by nearest ErrorBoundary
  invariant(
    typeof process.env.JACKSON_API_KEYS === "string" &&
      process.env.JACKSON_API_KEYS.split(",").some((k) => !!k),
    "Expected JACKSON_API_KEYS to be set with atleast one valid key"
  );
  const apiKeys = process.env.JACKSON_API_KEYS.split(",");
  return apiKeys.includes(key);
};

export default JacksonProvider;
export { extractAuthTokenFromHeader, validateApiKey, type OAuthReqBody };
