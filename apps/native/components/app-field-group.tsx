import { FieldGroup } from "@expo/ui";
import type { ReactNode } from "react";

interface AppFieldSection {
  children: ReactNode;
  key: string;
  title?: string;
}

interface AppFieldGroupProps {
  sections: readonly AppFieldSection[];
}

/**
 * A native @expo/ui grouped settings form (iOS Settings-style sections). Host-
 * less; mount inside an <AppCard>/<Host>. Takes a data-driven `sections` array —
 * each becomes a <FieldGroup.Section> whose `children` are the rows (@expo/ui
 * islands). `key` is the stable React key; `title` is the section caption.
 */
export const AppFieldGroup = ({ sections }: AppFieldGroupProps) => (
  <FieldGroup>
    {sections.map((section) => (
      <FieldGroup.Section key={section.key} title={section.title}>
        {section.children}
      </FieldGroup.Section>
    ))}
  </FieldGroup>
);
