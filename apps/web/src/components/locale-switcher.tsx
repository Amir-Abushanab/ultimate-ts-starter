import { getLocale, setLocale } from "@ultimate-ts-starter/i18n/runtime";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { useCallback, useState } from "react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "عر" },
] as const;

const LocaleSwitcher = () => {
  const [current, setCurrent] = useState(getLocale());

  const handleSwitch = useCallback(() => {
    const next = current === "en" ? "ar" : "en";
    void setLocale(next);
    setCurrent(next);
    window.dispatchEvent(new Event("paraglide:locale-change"));
  }, [current]);

  const nextLocale = LOCALES.find((l) => l.code !== current);

  return (
    <Button variant="ghost" size="sm" onClick={handleSwitch}>
      {nextLocale?.label}
    </Button>
  );
};

export default LocaleSwitcher;
