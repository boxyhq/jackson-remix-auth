import { ActionFunction, json, LoaderFunction } from "remix";
import JacksonProvider, {
  extractAuthTokenFromHeader,
  validateApiKey,
} from "~/auth.jackson.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(
    url.searchParams.entries()
  ) as unknown as { clientID?: string; tenant?: string; product?: string };

  // Validate apiKey
  const apiKey = extractAuthTokenFromHeader(request);
  if (!apiKey || !validateApiKey(apiKey)) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { apiController } = await JacksonProvider({ appBaseUrl: url.origin });

  try {
    return json(await apiController.getConfig(queryParams));
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

  const { apiController } = await JacksonProvider({ appBaseUrl: url.origin });

  try {
    switch (request.method) {
      case "POST":
        return json(await apiController.config(body));
      case "PATCH":
        await apiController.updateConfig(body);
        return new Response(null, { status: 204 });
      case "DELETE":
        await apiController.deleteConfig(body);
        return new Response(null, { status: 204 });
    }
  } catch (error: any) {
    const { message, statusCode = 500 } = error;
    throw new Response(message, { status: statusCode });
  }
};
