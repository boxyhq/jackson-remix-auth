import styles from "./styles/app.css";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
import { auth } from "./auth.server";
import type { ThrownResponse } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return { title: "Remix SAML Login Example" };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

//  For unexpected server side errors
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Error ⚠️</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <h1>App Error</h1>
          <p>{error.message}</p>
          <p>The stack trace is:</p>
          <pre>{error.stack}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// For thrown responses or expected errors
export function CatchBoundary() {
  const caught = useCatch<ThrownResponse>();

  return (
    <html>
      <head>
        <title>{`${caught.status} ${caught.statusText}`}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
        <Scripts />
      </body>
    </html>
  );
}

type LoaderData = { isLoggedIn: Boolean };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await auth.isAuthenticated(request);

  return json<LoaderData>({ isLoggedIn: !!user });
};

export default function App({ title }: { title?: string }) {
  const { isLoggedIn } = useLoaderData<LoaderData>();

  const location = useLocation();

  if (location.pathname === "/error") {
    return (
      <html lang="en" className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <title>{title}</title>
          <Links />
        </head>
        <body className="h-full">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        <Navbar isLoggedIn={isLoggedIn} />
        <Container>
          <Outlet />
        </Container>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
