import type { LoaderFunction } from "remix";
import { auth } from "~/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await auth.logout(request, { redirectTo: "/" });
};
