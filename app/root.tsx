import {
  json,
  Links,
  LiveReload,
  type LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ThrownResponse,
  useCatch,
  useLoaderData,
} from "remix";
import styles from "./styles/app.css";
import type { MetaFunction } from "remix";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
import { auth } from "./auth.server";

export const meta: MetaFunction = () => {
  return { title: "Remix SAML Login Example" };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

type LoaderData = { isLoggedIn: Boolean };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await auth.isAuthenticated(request);

  return json<LoaderData>({ isLoggedIn: !!user });
};

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { isLoggedIn } = useLoaderData<LoaderData>();
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
        <Container>{children}</Container>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
//  For unexpected server side errors
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <div>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
// For thrown responses or expected errors
export function CatchBoundary() {
  const caught = useCatch<ThrownResponse>();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <pre>{caught.data}</pre>
      </div>
    </Document>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
