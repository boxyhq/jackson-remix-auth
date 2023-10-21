import type {
  SAMLSSOConnection,
  OIDCSSOConnection,
} from "@boxyhq/saml-jackson";

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
  const allowedProducts = ["saml-demo.boxyhq.com", "1eef7782-41d4-4a0a-b450-0857413b4f63"];
  if (allowedProducts.includes(product) === false) {
    return "Not a valid product";
  }
}

export const strategyChecker = (
  body: SAMLSSOConnection | OIDCSSOConnection
): { isSAML: boolean; isOIDC: boolean } => {
  const isSAML = "rawMetadata" in body || "encodedRawMetadata" in body;
  const isOIDC = "oidcDiscoveryUrl" in body;
  return { isSAML, isOIDC };
};
