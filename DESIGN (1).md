---
name: Skyline Vibrant
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#40484d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#70787e'
  outline-variant: '#bfc8ce'
  surface-tint: '#096685'
  primary: '#004a62'
  on-primary: '#ffffff'
  primary-container: '#006382'
  on-primary-container: '#9addff'
  inverse-primary: '#89d0f3'
  secondary: '#006686'
  on-secondary: '#ffffff'
  secondary-container: '#7ed4fd'
  on-secondary-container: '#005b78'
  tertiary: '#56337a'
  on-tertiary: '#ffffff'
  tertiary-container: '#6f4b94'
  on-tertiary-container: '#e6c9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0e8ff'
  primary-fixed-dim: '#89d0f3'
  on-primary-fixed: '#001e2b'
  on-primary-fixed-variant: '#004d66'
  secondary-fixed: '#c0e8ff'
  secondary-fixed-dim: '#7bd1fa'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d66'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#dcb8ff'
  on-tertiary-fixed: '#2b024f'
  on-tertiary-fixed-variant: '#59367d'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
  metric:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
---

## Brand & Style
The design system for MediSync is anchored in a **Corporate Modern** aesthetic that balances clinical precision with high-tech approachability. The brand personality is authoritative yet airy, designed to evoke feelings of clarity, reliability, and forward-thinking innovation in the premium healthcare space.

The visual language utilizes significant whitespace (breathability) and a "vibrant-minimalist" approach. It avoids the heavy, sterile feeling of traditional medical software by introducing soft gradients, translucent accents, and a cool-tinted environment that feels sophisticated and calm. The target audience expects a frictionless, high-end experience that mirrors the quality of the medical care they receive.

## Colors
The palette is built on a foundation of "Cool-Tinted" neutrals and high-contrast accents. 

- **Background & Surface:** The environment uses a very light cool-white (#f5f6ff) to reduce eye strain, while active surfaces are pure white to pop against the backdrop.
- **Primary Palette:** "Sky Blue" functions as the core driver for action. Use the deep shade (#006382) for high-contrast text and primary CTA backgrounds, while the lighter shade (#7bd1fa) serves as a soft background for active states or toggle tracks.
- **Accents:** "Lavender" is reserved for high-level categorization, premium features, and data visualization clusters to distinguish medical data from navigation.
- **Semantic:** Standards are followed for utility, but with slightly desaturated tones to maintain the "Skyline" aesthetic.

## Typography
This design system utilizes **Inter** exclusively to lean into a tech-forward, geometric sans-serif feel. 

- **Headlines & Metrics:** Use Bold (700) weights with slightly tighter letter spacing for a premium, authoritative look. 
- **Labels:** Use Medium (500) weights to ensure clarity at smaller scales, particularly for form headers and navigation items.
- **Body:** Regular (400) weight is used for all descriptive text with generous line heights (1.5 - 1.6) to ensure maximum readability in a healthcare context.

## Layout & Spacing
The layout follows an **8px linear scale** to maintain vertical rhythm and systematic consistency. 

- **Grid Model:** A 12-column fluid grid is used for desktop and tablet, transitioning to a single-column fluid layout for mobile. 
- **Rhythm:** Use `lg` (24px) for standard gutters and `xl` (32px) for page margins to create a sense of luxury and space. 
- **Alignment:** All components must snap to the 8px grid. Use larger spacing values (`2xl` or `3xl`) between major sections to emphasize the "airy" design pillar.

## Elevation & Depth
Hierarchy in this design system is established through **Ambient Shadows** rather than borders. 

- **Base Layer:** The light-blue background (#f5f6ff) sits at the lowest level.
- **Surfaces:** Cards and containers are pure white (#ffffff). They utilize a "Skyline Shadow": a very soft, large-spread drop shadow (Blur: 30px, Y: 10px) with low opacity (approx 6-8%) tinted with the Deep Navy text color to ensure it feels integrated rather than muddy.
- **Interactive Layers:** Modals and dropdowns use an even deeper spread to simulate higher elevation. 
- **Borders:** Avoid harsh borders. If a separator is required, use a 1px line in a 5% opacity of the Deep Navy color.

## Shapes
The shape language is "Rounded" and friendly. 

- **Large Containers:** Cards, modals, and main content areas use a **16px (1rem)** radius to soften the corporate edges and feel modern.
- **Small Elements:** Buttons, input fields, and tags use an **8px (0.5rem)** radius to maintain a professional, slightly sharper structure for precision-heavy interactions.
- **Specialty:** User avatars and specific icon backgrounds may use a "Pill" (full-round) shape to provide visual variety.

## Components
- **Buttons:** Primary buttons use the Sky Blue (#006382) background with white text. Hover states shift to a slightly brighter tone. Standard height is 48px for touch-friendliness.
- **Input Fields:** Use an 8px radius with a subtle 1px border in a very light grey, which disappears on focus in favor of a 2px Sky Blue glow.
- **Cards:** White surfaces with the 16px radius and "Skyline Shadow." No borders. Content within should follow the 24px internal padding rule.
- **Chips & Tags:** Use the Lavender accent (#c8a0f0) with 10% opacity for the background and the full-strength color for the text. This creates a soft, modern categorization tool.
- **Lists:** Clean rows separated by whitespace or the 5% Navy hairline divider. Use generous 16px vertical padding for list items.
- **Data Viz:** Healthcare metrics should utilize the boldest weights of Inter. Graphs should primarily use Sky Blue and Lavender, with semantic colors reserved strictly for health alerts (e.g., heart rate warnings).