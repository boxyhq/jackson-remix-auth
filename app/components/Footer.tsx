import { Link } from "remix";

export default function Footer() {
  return (
    <footer className="mt-8">
      <hr />
      <ul className="my-4">
        <li className="mr-4 inline-block">
          <a
            href="https://github.com/boxyhq/jackson-next-auth"
            className="link"
          >
            GitHub
          </a>
        </li>
        <li className="mr-4 inline-block">
          <Link to="/policy" className="link">
            Policy
          </Link>
        </li>
        <li className="inline-block">
          <a href="https://github.com/boxyhq/jackson" className="link">
            Integrate SAML with a few lines of code
          </a>
        </li>
      </ul>
    </footer>
  );
}
