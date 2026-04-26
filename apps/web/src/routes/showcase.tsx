// Component showcase route — visual reference for the @ultimate-ts-starter/ui package.
// Mirrors the items published by the registry (registry.json + scripts/build-registry.mjs)
// plus the underlying shadcn primitives they compose with.
//
// Path is /showcase rather than /components to avoid colliding with the
// shadcn `components.json` config file at the web app root, which Vite's
// dev server otherwise resolves first.
//
// To remove: delete this file, drop the "/showcase" link from header.tsx,
// remove apps/web/public/r, registry.json, and scripts/build-registry.mjs.

import { createFileRoute } from "@tanstack/react-router";
import {
  AnimatedButton,
  AnimatedCard,
  AnimatedFade,
  AnimatedList,
  AnimatedPage,
  AnimatedPress,
} from "@ultimate-ts-starter/ui/components/animated";
import { AnimatedThemeToggler } from "@ultimate-ts-starter/ui/components/animated-theme-toggler";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ultimate-ts-starter/ui/components/card";
import { Checkbox } from "@ultimate-ts-starter/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ultimate-ts-starter/ui/components/dropdown-menu";
import { Input } from "@ultimate-ts-starter/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@ultimate-ts-starter/ui/components/input-otp";
import { Label } from "@ultimate-ts-starter/ui/components/label";
import {
  ResizablePanel,
  ResizablePanelContent,
} from "@ultimate-ts-starter/ui/components/resizable-panel";
import { Skeleton } from "@ultimate-ts-starter/ui/components/skeleton";
import {
  SkeletonCard,
  SkeletonList,
} from "@ultimate-ts-starter/ui/components/skeletons";
import { Toaster } from "@ultimate-ts-starter/ui/components/sonner";
import { StatusButton } from "@ultimate-ts-starter/ui/components/status-button";
import { useState } from "react";
import { toast } from "sonner";

const Section = ({
  title,
  description,
  registryName,
  children,
}: {
  title: string;
  description?: string;
  registryName?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3 border-b border-border pb-8">
    <div>
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {registryName === undefined ? null : (
          <code className="text-xs text-muted-foreground">
            npx shadcn@latest add /r/{registryName}.json
          </code>
        )}
      </div>
      {description === undefined ? null : (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    <div className="rounded-lg border border-border bg-card p-6">
      {children}
    </div>
  </section>
);

const ComponentsRoute = () => (
  <AnimatedPage className="mx-auto w-full max-w-4xl space-y-8 p-6">
    <header className="space-y-1">
      <h1 className="text-3xl font-bold">Components</h1>
      <p className="text-muted-foreground">
        Visual reference for{" "}
        <code className="text-sm">@ultimate-ts-starter/ui</code>. Items
        published via the registry are marked with a copy-pasteable{" "}
        <code className="text-sm">shadcn add</code> command.
      </p>
    </header>

    <Section
      title="Button"
      description="Base shadcn button — variants and sizes."
    >
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </div>
    </Section>

    <Section title="Card" description="Container with header / content slots.">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Description goes here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Card content body.</p>
        </CardContent>
      </Card>
    </Section>

    <Section
      title="Input"
      description="Text input with label, plus the OTP variant."
    >
      <div className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label htmlFor="demo-email">Email</Label>
          <Input id="demo-email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label>One-time code</Label>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    </Section>

    <Section title="Checkbox">
      <div className="flex items-center gap-2">
        <Checkbox id="demo-check" />
        <Label htmlFor="demo-check">Accept terms</Label>
      </div>
    </Section>

    <Section title="Dropdown Menu">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Section>

    <Section title="Skeleton" description="Loading placeholders.">
      <div className="space-y-3 max-w-sm">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </Section>

    <Section
      title="Skeleton patterns"
      description="Pre-composed skeleton layouts."
      registryName="skeletons"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonList count={3} />
      </div>
    </Section>

    <Section title="Toast" description="Sonner-based toast notifications.">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast("Default toast");
          }}
        >
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.success("Saved successfully");
          }}
        >
          Success
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            toast.error("Something went wrong");
          }}
        >
          Error
        </Button>
      </div>
      <Toaster richColors position="top-right" />
    </Section>

    <Section
      title="Animated wrappers"
      description="Drop-in motion wrappers — press, hover, page, list, fade."
      registryName="animated"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <AnimatedButton>Animated Button</AnimatedButton>
          <AnimatedPress>
            <Button variant="secondary">Press wrapper</Button>
          </AnimatedPress>
        </div>
        <AnimatedFade>
          <p className="text-sm text-muted-foreground">Fades in on mount.</p>
        </AnimatedFade>
        <AnimatedCard className="max-w-sm">
          <CardHeader>
            <CardTitle>Animated card</CardTitle>
            <CardDescription>Lifts on hover.</CardDescription>
          </CardHeader>
        </AnimatedCard>
        <AnimatedList className="space-y-2">
          {["Stagger one", "Stagger two", "Stagger three"].map((label) => (
            <Card key={label} className="p-3">
              <p className="text-sm">{label}</p>
            </Card>
          ))}
        </AnimatedList>
      </div>
    </Section>

    <Section
      title="Animated theme toggler"
      description="View Transitions API circular reveal — click to swap modes."
      registryName="animated-theme-toggler"
    >
      <AnimatedThemeToggler />
    </Section>

    <Section
      title="Resizable panel"
      description="Smoothly animates height when content changes."
      registryName="resizable-panel"
    >
      <ResizablePanelDemo />
    </Section>

    <Section
      title="Status button"
      description="Idle → loading → success / error state machine."
      registryName="status-button"
    >
      <div className="flex flex-wrap gap-2">
        <StatusButton onClick={() => simulateAsync({ shouldFail: false })}>
          Save (succeeds)
        </StatusButton>
        <StatusButton
          variant="destructive"
          onClick={() => simulateAsync({ shouldFail: true })}
        >
          Delete (fails)
        </StatusButton>
      </div>
    </Section>
  </AnimatedPage>
);

// Demo helper for the StatusButton — resolves or rejects after 1.2s.
const simulateAsync = ({
  shouldFail,
}: {
  shouldFail: boolean;
}): Promise<void> =>
  // eslint-disable-next-line promise/avoid-new -- demo helper, real callers would use fetch/mutation
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("demo"));
      } else {
        resolve();
      }
    }, 1200);
  });

const ResizablePanelDemo = () => {
  const [step, setStep] = useState<"short" | "tall">("short");
  return (
    <div className="space-y-3 max-w-md">
      <Button
        variant="outline"
        onClick={() => {
          setStep((value) => (value === "short" ? "tall" : "short"));
        }}
      >
        {step === "short" ? "Expand" : "Collapse"}
      </Button>
      <ResizablePanel
        value={step}
        className="rounded-md border border-border bg-muted"
      >
        <ResizablePanelContent value="short">
          <div className="p-4">
            <p className="text-sm">Short content.</p>
          </div>
        </ResizablePanelContent>
        <ResizablePanelContent value="tall">
          <div className="p-4">
            <p className="text-sm">First line.</p>
            <p className="text-sm">Second line.</p>
            <p className="text-sm">Third line.</p>
            <p className="text-sm">Fourth line.</p>
          </div>
        </ResizablePanelContent>
      </ResizablePanel>
    </div>
  );
};

export const Route = createFileRoute("/showcase")({
  component: ComponentsRoute,
});
