import { NavLink } from "remix";

const styleNavLink = ({
  isActive,
  extraClasses,
}: {
  isActive: Boolean;
  extraClasses?: Array<string>;
}) =>
  `inline-flex items-center px-1 pt-1 text-base text-gray-900 ${
    isActive ? "border-b-2 border-indigo-500 font-semibold" : ""
  } ${Array.isArray(extraClasses) ? extraClasses.join(" ") : ""}`;

export default function Navbar({ isLoggedIn }: { isLoggedIn: Boolean }) {
  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className="hidden h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink to="/" className={styleNavLink}>
                Home
              </NavLink>
              <NavLink to="/private" className={styleNavLink}>
                Private
              </NavLink>
            </div>
            {isLoggedIn && (
              <NavLink
                to="/logout"
                reloadDocument
                className={({ isActive }) =>
                  styleNavLink({ isActive, extraClasses: ["ml-auto"] })
                }
              >
                <svg
                  aria-hidden
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </NavLink>
            )}
          </div>
        </div>
      </div>
      <div className="sm:hidden" id="mobile-menu">
        {/* Add mobile menu */}
      </div>
    </nav>
  );
}
