import { LoaderFunction } from "remix";
import { Form, json, useLoaderData } from "remix";
import { auth, sessionStorage } from "~/auth.server";

type LoaderData = {
  error: { message: string } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, { successRedirect: "/private" });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const error = session.get(auth.sessionErrorKey) as LoaderData["error"];
  return json<LoaderData>({ error });
};

export default function Screen() {
  const { error } = useLoaderData<LoaderData>();

  return (
    <Form
      method="post"
      action="/auth/saml"
      className="flex flex-col items-start space-y-4"
    >
      {error ? <div>{error.message}</div> : null}
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        name="email"
        className="input"
        placeholder="johndoe@example.com"
        required
      />
      <input type="text" name="product" hidden defaultValue="demo" />
      <button type="submit" className="button">
        Sign In with SSO
      </button>
    </Form>
  );
}
