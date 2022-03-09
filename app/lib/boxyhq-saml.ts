// We need to import from Remix Auth the type of the strategy verify callback
import { SessionStorage } from "remix";
import type { AuthenticateOptions, StrategyVerifyCallback } from "remix-auth";
// We need to import the OAuth2Strategy, the verify params and the profile interfaces
import type {
  OAuth2Profile,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";

// These are the custom options we need from the developer to use the strategy
export interface BoxyHQSAMLStrategyOptions {
  issuer: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

// This interface declare what extra params we will get from BoxyHQSAML on the
// verify callback
export interface BoxyHQSAMLExtraParams
  extends Record<string, string | number> {}

// The BoxyHQSAMLProfile extends the OAuth2Profile with the extra params and mark
// some of them as required
export interface BoxyHQSAMLProfile extends OAuth2Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * `BoxyHQSAMLStrategy` extends the `OAuth2Strategy`.We need to
 * pass the User, BoxyHQSAMLProfile and the
 * extra params for generics
 * @example
 * export const auth = new Authenticator<BoxyHQSAMLProfile>(sessionStorage);
 *  auth.use(
 *    new BoxyHQSAMLStrategy(
 *      {
 *        issuer: process.env.BOXYHQSAML_ISSUER!,
 *        clientID: "dummy", // The dummy here is necessary since we'll pass tenant and product custom attributes in `AuthenticateOptions.context`
 *        clientSecret: "dummy", // The dummy here is necessary since we'll pass tenant and product custom attributes in `AuthenticateOptions.context`
 *        callbackURL: new URL("/auth/saml/callback", BASE_URL).toString(),
 *      },
 *      // eslint-disable-next-line no-empty-pattern
 *      async ({ profile }) => {
 *        return profile;
 *      }
 *    )
 *  );
 */

export class BoxyHQSAMLStrategy<User> extends OAuth2Strategy<
  User,
  BoxyHQSAMLProfile,
  BoxyHQSAMLExtraParams
> {
  // The OAuth2Strategy already has a name but we override it to be specific of
  // the service we are using
  name = "boxyhq-saml";

  private userInfoURL: string;

  // We receive our custom options and our verify callback
  constructor(
    options: BoxyHQSAMLStrategyOptions,
    // Here we type the verify callback as a StrategyVerifyCallback receiving
    // the User type and the OAuth2StrategyVerifyParams with the BoxyHQSAMLProfile
    // and the BoxyHQSAMLExtraParams
    // This way, when using the strategy the verify function will receive as
    // params an object with accessToken, refreshToken, extraParams and profile.
    // The latest two matching the types of BoxyHQSAMLProfile and BoxyHQSAMLExtraParams.
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<BoxyHQSAMLProfile, BoxyHQSAMLExtraParams>
    >
  ) {
    // And we pass the options to the super constructor using our own options
    // to generate them, this was we can ask less configuration to the developer
    // using our strategy
    super(
      {
        authorizationURL: `${options.issuer}/api/oauth/authorize`,
        tokenURL: `${options.issuer}/api/oauth/token`,
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
      },
      verify
    );

    this.userInfoURL = `${options.issuer}/api/oauth/userinfo`;
  }

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    if (options.context?.clientID && options.context?.clientSecret) {
      this.clientID = options.context.clientID;
      this.clientSecret = options.context.clientSecret;
    }
    return super.authenticate(request, sessionStorage, options);
  }
  // We override the protected authorizationParams method to return a new
  // URLSearchParams with custom params we want to send to the authorizationURL.
  // Here we add the scope so Auth0 can use it, you can pass any extra param
  // you need to send to the authorizationURL here base on your provider.
  protected authorizationParams(): URLSearchParams {
    const urlSearchParams: Record<string, string> = {
      provider: "saml",
    };

    return new URLSearchParams(urlSearchParams);
  }

  // We also override how to use the accessToken to get the profile of the user.
  // Here we fetch a BoxyHQSAML specific URL, get the profile data, and build the
  // object based on the BoxyHQSAMLProfile interface.
  protected async userProfile(accessToken: string): Promise<BoxyHQSAMLProfile> {
    let response = await fetch(this.userInfoURL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let data: BoxyHQSAMLProfile = await response.json();

    let profile: BoxyHQSAMLProfile = {
      ...data,
      provider: this.name,
    };

    return profile;
  }
}
