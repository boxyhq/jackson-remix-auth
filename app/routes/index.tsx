import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import AccessDenied from "~/components/AccessDenied";

type LoaderData = { content: string };
export const loader: LoaderFunction = async ({ request }) => {
  const user = await auth.isAuthenticated(request);

  if (!user) {
    // This will be caught in the CatchBoundary defined below
    throw json(
      {
        content:
          "You must be signed in to view the protected content on this page.",
      },
      { status: 401 }
    );
  }
  return json<LoaderData>({
    content:
      "This is protected content. You can access this content because you are signed in.",
  });
};

export default function Home() {
  const { content } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-4">
      <h1 className="text-primary font-bold md:text-3xl">Protected Page</h1>
      <p>
        <strong>{content ?? "\u00a0"}</strong>
      </p>
    </div>
  );
}

// Export a CatchBoundary and use the useCatch hook to handle thrown responses
// like the 404 we have in our loader.
// You can also catch thrown responses from actions as well.
export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 401: {
      return <AccessDenied />;
    }
    default: {
      // if we don't handle this then all bets are off. Just throw an error
      // and let the nearest ErrorBoundary handle this
      throw new Error(`${caught.status} not handled`);
    }
  }
}

// this will handle unexpected errors (like the default case above where the
// CatchBoundary gets a response it's not prepared to handle).
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
