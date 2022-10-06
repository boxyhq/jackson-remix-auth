import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/auth.server";
import { type BoxyHQSSOProfile } from "@boxyhq/remix-auth-saml";

type LoaderData = { profile: BoxyHQSSOProfile };

export const loader: LoaderFunction = async ({ request }) => {
  const profile = (await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  })) as BoxyHQSSOProfile;

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
