import { ActionFunction, redirect } from "remix";
import { auth } from "~/auth.server";
import { commitSession, getSession } from "~/sessions.server";
import { validateEmail, validateProduct } from "~/utils.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const email = formData.get("email");
  const product = formData.get("product");
  if (typeof email !== "string" || typeof product !== "string") {
    session.flash("login:form:error", {
      formError: "Form not submitted correctly",
    });
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
  const fieldErrors = {
    email: validateEmail(email),
    product: validateProduct(product),
  };
  const fields = { email, product };

  if (fieldErrors.email || fieldErrors.product) {
    session.flash("login:form:error", { fieldErrors, fields });
    return redirect("/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // extracting the tenant from email is one way to set it
  const tenant = email.split("@")[1];

  return await auth.authenticate("boxyhq-saml-embed", request, {
    successRedirect: "/private",
    failureRedirect: "/login",
    context: {
      clientID: `tenant=${tenant}&product=${product}`,
      clientSecret: process.env.CLIENT_SECRET_VERIFIER || "dummy",
    },
  });
};
