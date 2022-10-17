import { Link } from "remix";

export default function AccessDenied() {
  return (
    <>
      <h1 className="text-primary mt-2 mb-4 text-3xl font-bold">
        Access Denied
      </h1>
      <p>
        You must be signed in to view this page. Click on{" "}
        <Link to="/login" className="link">
          Sign In
        </Link>{" "}
        begin the SSO login flow.
      </p>
    </>
  );
}
