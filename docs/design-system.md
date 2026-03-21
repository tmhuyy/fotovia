# Fotovia Design System

## Theme direction

Fotovia uses a **Premium Neutral** design style.

The interface should feel:

- premium
- clean
- calm
- visual-first
- photography-focused

The UI should support the images, not overpower them.

## Brand colors

Main color palette:

- Primary: `#171717`
- Background: `#FAF8F4`
- Surface: `#FFFFFF`
- Accent: `#C8A97E`
- Muted text: `#6B7280`
- Border: `#E7E0D6`
- AI accent: `#A78BFA`

## Tailwind theme token names

Use the following token names inside Tailwind config:

- `brand.primary`
- `brand.background`
- `brand.surface`
- `brand.accent`
- `brand.muted`
- `brand.border`
- `brand.ai`

## Semantic theme tokens

Use semantic tokens in components so light and dark mode can share the same UI structure.

Recommended semantic tokens:

- `bg-background`
- `bg-surface`
- `text-foreground`
- `text-muted`
- `border-border`
- `text-accent`
- `bg-accent`
- `text-ai`
- `bg-ai`

Components should prefer semantic tokens over direct brand tokens.

## Dark mode foundation

Dark mode uses the same semantic token names with dark values:

- background: `#121110`
- surface: `#1A1917`
- foreground: `#F5F2ED`
- muted: `#B9B0A7`
- border: `#2A2723`
- accent: `#C8A97E`
- ai: `#A78BFA`

Dark mode should feel premium, calm, and photography-focused with soft contrast and layered surfaces.

## Color usage rules

### Background
The main page background should use `brand.background` or `bg-background`.

### Surface
Cards, panels, and content blocks should use `brand.surface` or `bg-surface`.

### Primary text
Main text should use `brand.primary` or `text-foreground`.

### Secondary text
Supporting text should use `brand.muted` or `text-muted`.

### Border
Borders and dividers should use `brand.border` or `border-border`.

### Accent
Highlights, badges, and subtle emphasis can use `brand.accent` or `accent` tokens.

### AI accent
`brand.ai` or `ai` tokens should be used sparingly in AI-related sections only.

It should act as a supporting highlight, not the dominant brand color.

## Typography

Recommended font pairing:

- Heading font: **Playfair Display**
- Body font: **Inter**

### Typography tone

Headings should feel elegant and premium.

Body text should remain clean, modern, and easy to read.

## Border radius

Recommended radius scale:

- Cards: `rounded-2xl`
- Buttons: `rounded-full` or `rounded-xl`
- Inputs: `rounded-xl`
- Large showcase blocks: `rounded-3xl`

## Shadows

Use soft and light shadows only.

Avoid strong shadows, harsh contrast, or heavy elevation.

The interface should feel smooth and refined.

## Spacing

Spacing should feel generous and breathable.

Guidelines:

- use large vertical spacing between sections
- avoid crowded layouts
- keep content blocks visually separated
- prioritize clean composition

## Button styles

### Primary button

Primary buttons should use:

- dark background
- light text
- clear, premium appearance

### Secondary button

Secondary buttons should use:

- light background
- dark text
- subtle border

## Card style

Cards should follow this style:

- white surface
- soft border
- light shadow
- comfortable padding
- rounded corners

Cards should feel premium but simple.

## Homepage section direction

### Hero section

The hero section should include:

- a large heading
- short supporting text
- one strong primary CTA
- one secondary CTA
- premium visual presentation

### Featured photographers section

This section should feel editorial and clean.

Photographer cards should highlight:

- image
- name
- specialty
- location
- style badge or short metadata

### AI section

The AI section should introduce the classification feature clearly.

This section may use a slight AI accent, but the overall design should still stay within the Premium Neutral system.

Do not make the homepage feel like a generic tech startup landing page.

### Portfolio showcase section

This section should focus on imagery.

It should help the product feel like a real photography platform.

### CTA section

The CTA section should be simple, focused, and visually strong.

It should encourage users to:

- explore photographers
- try the AI matching feature
- start booking

## General design principles

Fotovia should feel like a premium photography platform first, and an AI-powered product second.

Design principles:

- keep visuals clean
- let photography remain the main focus
- avoid too many bright colors
- avoid noisy UI
- favor elegance over complexity
- favor clarity over decoration
