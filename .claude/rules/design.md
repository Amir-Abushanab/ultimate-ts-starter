---
description: Tailwind styling, spacing, typography, RTL, colors, responsive design, and accessibility patterns
globs:
  - "**/*.css"
  - "**/*.tsx"
---

# Design & Tailwind Styling Guidelines

## RTL (Right-to-Left) Support

Use Tailwind's logical properties instead of physical directional classes for RTL compatibility.

### Margin & Padding

| Don't Use | Use Instead | Description          |
| --------- | ----------- | -------------------- |
| `ml-*`    | `ms-*`      | margin-inline-start  |
| `mr-*`    | `me-*`      | margin-inline-end    |
| `pl-*`    | `ps-*`      | padding-inline-start |
| `pr-*`    | `pe-*`      | padding-inline-end   |

### Positioning

| Don't Use | Use Instead | Description        |
| --------- | ----------- | ------------------ |
| `left-*`  | `start-*`   | inset-inline-start |
| `right-*` | `end-*`     | inset-inline-end   |

### Text Alignment

| Don't Use    | Use Instead  |
| ------------ | ------------ |
| `text-left`  | `text-start` |
| `text-right` | `text-end`   |

### Borders & Rounded Corners

| Don't Use      | Use Instead    |
| -------------- | -------------- |
| `border-l-*`   | `border-s-*`   |
| `border-r-*`   | `border-e-*`   |
| `rounded-l-*`  | `rounded-s-*`  |
| `rounded-r-*`  | `rounded-e-*`  |
| `rounded-tl-*` | `rounded-ss-*` |
| `rounded-tr-*` | `rounded-se-*` |
| `rounded-bl-*` | `rounded-es-*` |
| `rounded-br-*` | `rounded-ee-*` |

### Transforms & Animations

When using transforms that involve horizontal movement:

```tsx
// Use logical values or the rtl: variant
<div className="translate-x-2 rtl:-translate-x-2">...</div>

// For icons that should flip in RTL (like arrows)
<ChevronRight className="rtl:rotate-180" />
```

### When Physical Properties Are Acceptable

- Absolutely positioned decorative elements that shouldn't flip
- Scroll positions
- Canvas/SVG coordinates

## Spacing & Layout

### Consistent Spacing Scale

Use Tailwind's spacing scale consistently. Prefer multiples of 4:

- `gap-1` (4px), `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- Avoid arbitrary values like `gap-[13px]` unless absolutely necessary

### Container Padding

- Use `px-4` or `px-6` for standard container padding
- Mobile breakpoints may need less: `px-3 sm:px-4 md:px-6`

### Component Spacing Patterns

```tsx
// Card content
<div className="p-4 space-y-3">

// Form fields
<div className="space-y-4">

// Button groups
<div className="flex gap-2">

// List items
<div className="space-y-2">
```

## Typography

### Heading Hierarchy

| Element | Classes                                      | Use For                     |
| ------- | -------------------------------------------- | --------------------------- |
| `<h1>`  | `text-3xl font-bold` or `text-4xl font-bold` | Page title (one per page)   |
| `<h2>`  | `text-2xl font-semibold`                     | Major sections              |
| `<h3>`  | `text-xl font-semibold`                      | Subsections                 |
| `<h4>`  | `text-lg font-medium`                        | Card titles, minor sections |
| `<h5>`  | `text-base font-medium`                      | List group headers          |

### Font Sizes

- `text-xs` (12px) - Labels, badges, timestamps
- `text-sm` (14px) - Secondary text, descriptions
- `text-base` (16px) - Body text
- `text-lg` (18px) - Subheadings
- `text-xl` (20px) - Section headings
- `text-2xl` (24px) - Page headings
- `text-3xl` (30px) - Hero titles

### Font Weights

- `font-normal` - Body text
- `font-medium` - Emphasis, labels
- `font-semibold` - Headings, important UI elements
- `font-bold` - Hero titles, strong emphasis

### Line Height

- Let Tailwind's defaults handle line height with font sizes
- Use `leading-relaxed` for long-form text
- Use `leading-tight` for headings

## Colors

### Prefer Semantic Colors

Use semantic color tokens by default. One-off colors are acceptable when semantic tokens don't fit (e.g., brand colors, data visualization, gradients):

```tsx
// Prefer semantic tokens
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">

// One-off colors are fine when needed
<div className="bg-linear-to-r from-purple-500 to-pink-500">
```

### Semantic Colors (both platforms)

- `background` / `foreground` - Page backgrounds and text
- `primary` / `primary-foreground` - Primary actions (blue)
- `secondary` / `secondary-foreground` - Secondary actions
- `destructive` / `danger` - Destructive actions (red)
- `success` / `warning` - Status feedback
- `muted` / `muted-foreground` - Subtle backgrounds and secondary text
- `card` / `surface` - Elevated containers
- `border` - Borders
- `ring` / `focus` - Focus rings

### Opacity Patterns

```tsx
// On colored backgrounds
<div className="bg-black/10 dark:bg-white/10">

// For hover states on colored backgrounds
<button className="hover:bg-black/10 dark:hover:bg-white/10">
```

## Interactive States

### Focus States

Always ensure visible focus states for accessibility:

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
```

### Hover States

- Use `transition-colors` for color changes
- Keep transitions short: `duration-200` or default
- Disable hover effects on touch devices when needed

### Disabled States

```tsx
<button className="disabled:opacity-50 disabled:pointer-events-none">
```

## User Feedback

### Prefer Local Feedback Over Toasts

Keep visual feedback close to where the user is looking.

**When to use local feedback:**

- Button state changes (loading -> success -> default)
- Inline validation messages
- Icon/color changes on the element itself

**When toasts are acceptable:**

- Background operations the user didn't directly trigger
- System-wide notifications (connectivity, auth expiry)
- Actions on items that will disappear (deleted items)

### Feedback Should Be Fast and Subtle

- Use optimistic updates when possible
- Transient success states should auto-dismiss after 1-2 seconds
- Loading states on buttons are better than full-screen spinners

## Responsive Design

### Breakpoint Order

Always write mobile-first:

```tsx
// GOOD
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// BAD
<div className="grid grid-cols-3 sm:grid-cols-2 xs:grid-cols-1">
```

### Hide/Show Patterns

```tsx
// Show only on mobile
<div className="sm:hidden">

// Hide on mobile, show on tablet+
<div className="hidden sm:block">
```

## Dark Mode

When using semantic colors, dark mode is automatic:

```tsx
// This works in both light and dark mode
<div className="bg-background text-foreground">
```

## Accessibility

### Reduced Motion

Framer Motion automatically respects `prefers-reduced-motion`. For CSS animations:

```tsx
<div className="motion-safe:animate-bounce motion-reduce:animate-none">
```

### Screen Reader Text

```tsx
<span className="sr-only">Close dialog</span>
```

### Focus Visible

Only show focus styles for keyboard navigation:

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-ring">
```

## Code Organization

### Apply Styles at the Right Level

Apply shared styles as high up the component tree as practical:

```tsx
// BAD - repetitive
<div>
  <p className="text-sm text-muted-foreground">First</p>
  <p className="text-sm text-muted-foreground">Second</p>
</div>

// GOOD - apply shared styles to parent
<div className="text-sm text-muted-foreground space-y-2">
  <p>First</p>
  <p>Second</p>
</div>
```

## Performance

### Image Sizing

Always set dimensions to prevent layout shift:

```tsx
<img className="size-16 object-cover" width={64} height={64} />
```

### Conditional Classes

Use `cn()` (clsx + tailwind-merge) for conditional classes:

```tsx
import { cn } from "@ultimate-ts-starter/ui/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```
