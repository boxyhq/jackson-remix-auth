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
  return json(
    { statusCode, message },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    }
  );
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
    <div className="flex h-full items-center justify-center p-8 md:px-[6%] md:py-[10%]">
      <div className="dot-pattern relative -mt-10 flex  w-full flex-col items-center justify-center rounded-md p-5 text-[#0a2540] shadow-xl sm:h-[500px] sm:w-[500px]">
        <h1 className="text-xl font-extrabold md:text-6xl">{statusCode}</h1>
        <h2 className="mt-2 text-lg md:text-4xl">{statusText}</h2>
        <p className="mt-6 inline-block">SAML error: </p>
        <p className="mr-2 text-xl font-bold">{message}</p>
      </div>
    </div>
  );
}
