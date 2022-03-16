import {
  json,
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
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

function Document({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useLoaderData<LoaderData>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
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

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
