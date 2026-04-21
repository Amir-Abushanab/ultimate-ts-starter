"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@ultimate-ts-starter/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

import { Button } from "./button";
import type { buttonVariants } from "./button";

type ButtonStatus = "idle" | "loading" | "success" | "error";

interface StatusButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  /**
   * Async click handler. The button automatically transitions through
   * idle → loading → success/error → idle based on the promise result.
   */
  onClick: (e: React.MouseEvent) => Promise<void>;
  /** Duration to show success/error state before returning to idle (ms) */
  resetDelay?: number;
  children: React.ReactNode;
}

/**
 * Button with animated loading → success/error state transitions.
 *
 * Wraps the base Button component. Pass an async `onClick` and the button
 * handles the rest: spinner while pending, checkmark on success, X on error,
 * then smoothly returns to idle.
 *
 * @example
 * ```tsx
 * <StatusButton onClick={async () => { await saveData(); }}>
 *   Save
 * </StatusButton>
 * ```
 */
export const StatusButton = ({
  onClick,
  resetDelay = 1500,
  children,
  className,
  disabled,
  ...props
}: StatusButtonProps) => {
  const [status, setStatus] = useState<ButtonStatus>("idle");

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (status !== "idle") {
        return;
      }
      setStatus("loading");
      try {
        await onClick(e);
        setStatus("success");
      } catch {
        setStatus("error");
      }
      setTimeout(() => {
        setStatus("idle");
      }, resetDelay);
    },
    [onClick, resetDelay, status]
  );

  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      disabled={disabled ?? status !== "idle"}
      onClick={(e) => {
        void handleClick(e);
      }}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className="inline-flex items-center gap-1.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{
            bounce: 0,
            duration: 0.3,
            type: "spring",
          }}
        >
          {status === "idle" && children}
          {status === "loading" && (
            <Loader2Icon className="size-4 animate-spin" />
          )}
          {status === "success" && <CheckIcon className="size-4" />}
          {status === "error" && <XIcon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
};
