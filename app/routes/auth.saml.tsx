import { ActionFunction, json } from "remix";
import { auth } from "~/auth.server";
import invariant from "tiny-invariant";

type PostError = {
  email?: boolean;
  product?: boolean;
};
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = formData.get("email");
  const product = await formData.get("product");

  const errors: PostError = {};
  if (!email) errors.email = true;
  if (!product) errors.product = true;

  if (Object.keys(errors).length) {
    return json(errors);
  }

  invariant(typeof email === "string");

  const tenant = email.split("@")[1];
  return await auth.authenticate("boxyhq-saml", request, {
    successRedirect: "/private",
    failureRedirect: "/",
    context: {
      clientID: `tenant=${tenant}&product=${product}`,
      clientSecret: "dummy",
    },
  });
};
