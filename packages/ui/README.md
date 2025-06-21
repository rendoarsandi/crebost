# Crebost UI Package (`@crebost/ui`)

This package contains shared UI components and styles for the Crebost platform, built primarily using [ShadCN/UI](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com/).

## Core Components

This package exports various standard UI components like:
- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`
- `Label`
- `Dialog`
- `DropdownMenu`
- `Avatar`
- `Badge`
- `Separator`
- `Alert`
- `Select`
- `Tabs`
- `ThemeProvider`, `ClientThemeProvider` (for theme management)
- ...and more. Refer to `src/index.ts` for a full list of exports.

These components are generally based on Radix UI primitives and styled with Tailwind CSS, following ShadCN/UI conventions.

## Custom Shared Components

### `GradientText`

A component to render text with a CSS gradient.

**Props:**

*   `children`: `React.ReactNode` (required) - The text content to be displayed.
*   `className`: `string` (optional) - Any additional Tailwind CSS classes to apply to the `span` element.
*   `from`: `string` (optional) - The starting color for the gradient. Should be a Tailwind CSS class (e.g., `from-primary`, `from-pink-500`). Defaults to `from-primary`.
*   `via`: `string` (optional) - The middle color for the gradient. Should be a Tailwind CSS class (e.g., `via-blue-500`). If not provided, a two-color gradient is used.
*   `to`: `string` (optional) - The ending color for the gradient. Should be a Tailwind CSS class (e.g., `to-purple-600`, `to-red-500`). Defaults to `to-purple-600`.

**Example Usage:**

```tsx
import { GradientText } from '@crebost/ui';

// Default gradient (primary to purple-600)
<GradientText>Important Announcement</GradientText>

// Custom three-color gradient
<GradientText
  from="from-green-400"
  via="via-blue-500"
  to="to-purple-600"
  className="text-2xl font-bold"
>
  Special Offer!
</GradientText>

// Custom two-color gradient
<GradientText
  from="from-orange-400"
  to="to-red-600"
>
  Warning Text
</GradientText>
```

## Theming

Theming is handled by `ClientThemeProvider`, which uses CSS custom properties defined in `src/styles/globals.css`. This file includes definitions for light and dark modes, as well as base Tailwind CSS directives.

## Utilities

- `cn`: A utility function (exported from `src/lib/utils.ts`) for conditionally joining class names, commonly used with Tailwind CSS and component variants.

## Contribution

When adding new components:
1.  If it's a standard UI element, prefer using `shadcn-ui cli` to add the component to this package.
2.  If it's a custom shared component, create it under `src/components/ui/`.
3.  Ensure components are exported from `src/index.ts`.
4.  Add documentation for custom components in this README.
