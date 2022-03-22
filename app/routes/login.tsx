import { Form, json, LoaderFunction, useLoaderData } from "remix";
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

export default function Login() {
  const { error } = useLoaderData<LoaderData>();

  return (
    <div className="mx-auto flex max-w-md flex-col py-20">
      <h2 className="mt-5 text-center text-3xl">Log in to App</h2>
      <p className="mt-4 text-center font-medium text-gray-500">
        Click `Continue with SAML SSO` and you will be redirected to your
        third-party authentication provider to finish authenticating.
      </p>
      <div className="mx-auto mt-3 w-full max-w-sm">
        <div className="rounded bg-white py-6 px-6">
          <Form
            method="post"
            action="/auth/saml"
            className="flex flex-col items-start space-y-4"
          >
            {error ? <div>{error.message}</div> : null}
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              name="email"
              disabled
              defaultValue="jackson@boxyhq.com"
              className="input w-full"
              placeholder="johndoe@example.com"
              required
            />
            <input type="text" name="product" hidden defaultValue="demo" />
            <button
              type="submit"
              className="w-full rounded border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:outline-none"
            >
              Continue with SAML SSO (Hosted SAML Provider)
            </button>
            <button
              type="submit"
              formAction="/auth/saml/embed"
              className="w-full rounded border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:outline-none"
            >
              Continue with SAML SSO (Embedded SAML Provider)
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
