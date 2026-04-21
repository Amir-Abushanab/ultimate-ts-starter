"use client";

import { cn } from "@ultimate-ts-starter/ui/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  /** Duration of the circular reveal animation in ms (default: 400) */
  duration?: number;
}

/**
 * Animated theme toggler using the View Transitions API.
 * Creates a circular reveal animation from the button position
 * when switching between light and dark modes.
 *
 * Falls back to an instant toggle on browsers without View Transitions.
 *
 * From Magic UI — https://magicui.design/docs/components/animated-theme-toggler
 */
export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync state with the document's dark class
  useEffect(() => {
    const update = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleTheme = useCallback(async () => {
    const button = buttonRef.current;
    const rect = button?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const applyTheme = () => {
      const next = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", next ? "dark" : "light");
    };

    // Fallback for browsers without View Transitions
    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    try {
      await transition.ready;
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch {
      // Animation failed — theme was still applied
    }
  }, [duration]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        void toggleTheme();
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-none text-sm transition-colors hover:bg-muted",
        className
      )}
      {...props}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};
