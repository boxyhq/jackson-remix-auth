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
  // const product = await formData.get("product");
  // Use the above to get the product from client side
  const product = "saml-demo.boxyhq.com";

  const errors: PostError = {};
  if (!email) errors.email = true;
  if (!product) errors.product = true;

  if (Object.keys(errors).length) {
    return json(errors);
  }

  invariant(typeof email === "string");
  // extracting the tenant from email is one way to set it
  // const tenant = email.split("@")[1];
  const tenant = "boxyhq.com";
  return await auth.authenticate("boxyhq-saml", request, {
    successRedirect: "/private",
    failureRedirect: "/",
    context: {
      clientID: `tenant=${tenant}&product=${product}`,
      clientSecret: process.env.CLIENT_SECRET_VERIFIER || "dummy",
    },
  });
};
