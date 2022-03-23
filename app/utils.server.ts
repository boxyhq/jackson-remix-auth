export function validateEmail(email: string) {
  if (
    Array.isArray(
      String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) === false
  ) {
    return "Not a valid email";
  }
}

export function validateProduct(product: string) {
  const allowedProducts = ["saml-demo.boxyhq.com"];
  if (allowedProducts.includes(product) === false) {
    return "Not a valid product";
  }
}
