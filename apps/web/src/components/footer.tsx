import { useEffect, useState } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
      <span>
        &copy; {currentYear} Ultimate TS Starter. All rights reserved.
      </span>
      <span>v{__APP_VERSION__}</span>
    </footer>
  );
}
