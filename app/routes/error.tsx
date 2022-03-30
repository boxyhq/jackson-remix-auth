import { json, LoaderFunction, useLoaderData } from "remix";
import {
  commitSession,
  getSession,
  JACKSON_ERROR_COOKIE_KEY,
} from "~/sessions.server";

type LoaderData = {
  statusCode: null | number;
  message: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const { statusCode, message } = session.get(JACKSON_ERROR_COOKIE_KEY) || {
    statusCode: null,
    message: "",
  };
  return json({ statusCode, message });
};

export default function Error() {
  const { statusCode, message } = useLoaderData<LoaderData>();

  let statusText = "";
  if (typeof statusCode === "number") {
    if (statusCode >= 400 && statusCode <= 499) {
      statusText = "client-side error";
    }
    if (statusCode >= 500 && statusCode <= 599) {
      statusText = "server error";
    }
  }

  if (statusCode === null) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="h-[20%] translate-y-[100%] px-[20%] text-[hsl(152,56%,40%)]">
        <svg
          className="mb-5 h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-xl font-extrabold md:text-6xl">{statusCode}</h1>
        <h2 className="uppercase">{statusText}</h2>
        <p className="mt-6 inline-block">SAML error: </p>
        <p className="mr-2 text-xl font-bold">{message}</p>
      </div>
    </div>
  );
}
