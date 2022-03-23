import { Form, json, LoaderFunction, useLoaderData } from "remix";
import { auth } from "~/auth.server";
import { commitSession, getSession } from "~/sessions.server";

type LoaderData = {
  error: { message: string } | null;
  formError?: string;
  fieldErrors?: {
    email: string | undefined;
    product: string | undefined;
  };
  fields?: {
    email: string;
    product: undefined;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, { successRedirect: "/private" });
  const session = await getSession(request.headers.get("Cookie"));
  const error = session.get(auth.sessionErrorKey) as LoaderData["error"];
  const formErrors = session.get("login:form:error") as Omit<
    LoaderData,
    "error"
  >;
  return json<LoaderData>(
    { error, ...formErrors },
    { headers: { "Set-Cookie": await commitSession(session) } } // need these to clear the messages after reading flash keys above
  );
};

export default function Login() {
  const { error, fieldErrors, formError, fields } = useLoaderData<LoaderData>();

  return (
    <div className="mx-auto flex max-w-md flex-col py-20">
      <h2 className="mt-5 text-center text-3xl">Log in to App</h2>
      <p className="mt-4 text-center font-medium text-gray-500">
        Click `Continue with SAML SSO` and you will be redirected to your
        third-party authentication provider to finish authenticating.
      </p>
      {error ? <div role="alert">{error.message}</div> : null}
      {formError ? <div role="alert">{formError}</div> : null}
      <div className="mx-auto mt-3 w-full max-w-sm">
        <div className="rounded bg-white py-6 px-6">
          <Form
            method="post"
            action="/auth/saml"
            className="flex flex-col items-start space-y-4"
            reloadDocument
          >
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              name="email"
              readOnly
              defaultValue={fields?.email || "jackson@boxyhq.com"}
              className="input w-full"
              placeholder="johndoe@example.com"
              required
            />
            {fieldErrors?.email ? (
              <p
                className="form-validation-error"
                role="alert"
                id="email-error"
              >
                {fieldErrors.email}
              </p>
            ) : null}
            <input
              type="text"
              name="product"
              hidden
              defaultValue={fields?.product || "saml-demo.boxyhq.com"}
            />
            {fieldErrors?.product ? (
              <p
                className="form-validation-error"
                role="alert"
                id="product-error"
              >
                {fieldErrors.product}
              </p>
            ) : null}
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
