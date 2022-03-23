// app/sessions.js
import { createCookieSessionStorage } from "remix";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: process.env.COOKIE_SECRETS!.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

const { getSession, commitSession, destroySession } = sessionStorage;

export default sessionStorage;
export { getSession, commitSession, destroySession };
