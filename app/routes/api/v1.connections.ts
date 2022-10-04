import type { ActionFunction, LoaderFunction } from "remix";
import { json } from "remix";
import type { GetConfigQuery } from "~/auth.jackson.server";
import JacksonProvider, {
  extractAuthTokenFromHeader,
  validateApiKey,
} from "~/auth.jackson.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(
    url.searchParams.entries()
  ) as unknown as GetConfigQuery;

  // Validate apiKey
  const apiKey = extractAuthTokenFromHeader(request);
  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { connectionAPIController } = await JacksonProvider({
    appBaseUrl: url.origin,
  });

  try {
    return json(await connectionAPIController.getConnections(queryParams));
  } catch (error: any) {
    const { message, statusCode = 500 } = error;
    throw new Response(message, { status: statusCode });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const contentType = request.headers.get("Content-Type");
  let body;
  if (contentType === "application/x-www-form-urlencoded") {
    body = Object.fromEntries(await request.formData());
  } else if (contentType === "application/json") {
    body = await request.json();
  } else {
    throw new Response("Unsupported Media Type", { status: 415 });
  }
  // Validate apiKey
  const apiKey = extractAuthTokenFromHeader(request);
  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { connectionAPIController } = await JacksonProvider({
    appBaseUrl: url.origin,
  });

  try {
    switch (request.method) {
      case "POST":
        return json(await connectionAPIController.createSAMLConnection(body));
      case "PATCH":
        await connectionAPIController.updateSAMLConnection(body);
        return new Response(null, { status: 204 });
      case "DELETE":
        await connectionAPIController.deleteConnections(body);
        return new Response(null, { status: 204 });
    }
  } catch (error: any) {
    const { message, statusCode = 500 } = error;
    throw new Response(message, { status: statusCode });
  }
};
