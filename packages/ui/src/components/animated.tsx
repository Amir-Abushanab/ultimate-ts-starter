"use client";

import type { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@ultimate-ts-starter/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Children } from "react";
import type * as React from "react";

import { Button } from "./button";
import type { buttonVariants } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

/*
 * Animated wrapper components.
 *
 * These add iOS-like micro-interactions to the base shadcn components.
 * All animations use the custom easings from animation.md:
 *   - ease-out-cubic for enters/interactions
 *   - ease-out-quart for page transitions
 *   - 200-300ms durations
 *   - transform + opacity only (GPU-accelerated)
 *   - Respects prefers-reduced-motion
 */

// ── Animated Button ─────────────────────────────
// Subtle scale-down on press (iOS-like), smooth hover color transition.

export const AnimatedButton = ({
  className,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => (
  <Button
    className={cn(
      "transition-[transform,background-color,border-color] duration-200 [transition-timing-function:var(--ease-out-cubic)] active:scale-[0.97] motion-reduce:transform-none",
      className
    )}
    {...props}
  />
);

// ── Animated Card ───────────────────────────────
// Hover: subtle lift + shadow. Appears with fade-in-up on mount.

export const AnimatedCard = ({
  className,
  ...props
}: React.ComponentProps<typeof Card>) => (
  <Card
    className={cn(
      "animate-[fade-in-up] transition-[transform,box-shadow] duration-300 [transition-timing-function:var(--ease-out-cubic)] hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none motion-reduce:animate-none",
      className
    )}
    {...props}
  />
);

// Re-export sub-components for convenience
AnimatedCard.Header = CardHeader;
AnimatedCard.Title = CardTitle;
AnimatedCard.Description = CardDescription;
AnimatedCard.Content = CardContent;
AnimatedCard.Footer = CardFooter;
AnimatedCard.Action = CardAction;

// ── Animated Press ──────────────────────────────
// Generic wrapper that adds iOS-like press feedback to any element.
// Wrap any interactive element to get scale-down on press.

export const AnimatedPress = ({
  className,
  children,
  as: Component = "div",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  as?: React.ElementType;
  children: React.ReactNode;
}) => (
  <Component
    className={cn(
      "transition-transform duration-150 [transition-timing-function:var(--ease-out-cubic)] active:scale-[0.97] motion-reduce:transform-none cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

// ── Animated Page ───────────────────────────────
// Wraps page content with a fade-in + slide-up entrance animation.
// Use this in route components for smooth page transitions.

export const AnimatedPage = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "animate-[slide-in-from-bottom] motion-reduce:animate-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ── Animated List ───────────────────────────────
// Renders children with staggered fade-in-up animations.
// Each child gets a slightly delayed entrance for a cascading effect.

export const AnimatedList = ({
  className,
  children,
  staggerMs = 50,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  /** Delay between each child's animation in ms (default: 50) */
  staggerMs?: number;
}) => (
  <div className={className} {...props}>
    {Children.map(children, (child, i) => (
      <div
        className="animate-[fade-in-up] motion-reduce:animate-none"
        style={{
          animationDelay: `${i * staggerMs}ms`,
          animationFillMode: "both",
        }}
      >
        {child}
      </div>
    ))}
  </div>
);

// ── Animated Fade ───────────────────────────────
// Simple fade-in wrapper. Use for elements appearing on the screen.

export const AnimatedFade = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("animate-[fade-in] motion-reduce:animate-none", className)}
    {...props}
  >
    {children}
  </div>
);
