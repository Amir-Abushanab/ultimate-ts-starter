import { Link } from "@tanstack/react-router";
import * as m from "@ultimate-ts-starter/i18n/messages";

import LocaleSwitcher from "./locale-switcher";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { label: m.nav_home(), to: "/" },
    { label: m.nav_blog(), to: "/blog" },
    { label: m.nav_dashboard(), to: "/dashboard" },
    { label: m.nav_settings(), to: "/settings" },
    { label: "Examples", to: "/examples" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
