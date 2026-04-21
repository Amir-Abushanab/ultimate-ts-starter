"use client";

import { cn } from "@ultimate-ts-starter/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useMemo } from "react";
import type { ComponentProps, ReactNode } from "react";
import useMeasure from "react-use-measure";

/**
 * Animated panel that smoothly resizes its height when content changes.
 *
 * Use this inside drawers, modals, or any container where content
 * changes between steps/views and you want a smooth height transition.
 *
 * @example
 * ```tsx
 * const [step, setStep] = useState("details");
 *
 * <ResizablePanel value={step}>
 *   <ResizablePanelContent value="details">
 *     <DetailsForm onNext={() => setStep("confirm")} />
 *   </ResizablePanelContent>
 *   <ResizablePanelContent value="confirm">
 *     <Confirmation onBack={() => setStep("details")} />
 *   </ResizablePanelContent>
 * </ResizablePanel>
 * ```
 */

const PanelContext = createContext({ value: "" });

export const ResizablePanel = ({
  children,
  value,
  className,
  ...rest
}: { children: ReactNode; value: string } & ComponentProps<"div">) => {
  const [ref, bounds] = useMeasure();

  return (
    <motion.div
      animate={{ height: bounds.height > 0 ? bounds.height : undefined }}
      transition={{ bounce: 0, duration: 0.6, type: "spring" }}
      className={cn("overflow-hidden", className)}
    >
      <div ref={ref}>
        <PanelContext.Provider value={useMemo(() => ({ value }), [value])}>
          <div {...rest}>{children}</div>
        </PanelContext.Provider>
      </div>
    </motion.div>
  );
};

export const ResizablePanelContent = ({
  value,
  children,
  className,
  ...rest
}: { value: string; children: ReactNode } & ComponentProps<"div">) => {
  const panel = useContext(PanelContext);
  const isActive = panel.value === value;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.15, duration: 0.3, ease: "easeInOut" },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.2, ease: "easeInOut" },
          }}
        >
          <div className={className} {...rest}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
