import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { auth } from "~/auth.server";
import { type BoxyHQSAMLProfile } from "@boxyhq/remix-auth-saml";

type LoaderData = { profile: BoxyHQSAMLProfile };

export const loader: LoaderFunction = async ({ request }) => {
  const profile = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return json<LoaderData>({ profile });
};

export default function Private() {
  const { profile } = useLoaderData<LoaderData>();
  return (
    <>
      <h1 className="text-primary mb-4 font-bold md:text-3xl">Raw profile</h1>
      <pre>
        <code>{JSON.stringify(profile, null, 2)}</code>
      </pre>
    </>
  );
}
