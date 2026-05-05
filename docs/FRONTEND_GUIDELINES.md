# Frontend Design System & Guidelines (FRONTEND_GUIDELINES.md)

## 1. Design Principles

### Core Principles
1. **Operational Clarity**: UI must prioritize readability under pressure (reception dashboard).
2. **Real-Time Responsiveness**: Changes must be visually immediate and noticeable.
3. **State Visibility**: Every system state (overbooked, conflict, fatigue) must be explicit.
4. **Low Cognitive Load**: Color + hierarchy should reduce decision time.
5. **Skyline Vibrant Aesthetic**: A light, tech-forward, and energetic theme. Uses sky blues and lavenders to evoke clarity, innovation, and openness, moving away from heavy industrial tones or aggressive dark modes.

---

## 2. Design Tokens

### Color Palette

#### Primary (Sky Blue)
```css
--color-primary: #006382;
--color-on-primary: #e5f5ff;
--color-primary-container: #7bd1fa;
--color-on-primary-container: #00465d;
--color-primary-dim: #005672;
```

#### Secondary & Tertiary (Accents)
```css
--color-secondary: #346176;
--color-on-secondary: #e6f5ff;
--color-secondary-container: #b1ddf7;
--color-tertiary: #6f4b94;
--color-on-tertiary: #fbefff;
--color-tertiary-container: #d6adff; /* Lavender accents */
```

#### Background & Surfaces (Light System)
```css
--color-background: #f5f6ff;
--color-on-background: #252f43; /* Deep navy text */
--color-surface: #f5f6ff;
--color-surface-bright: #ffffff; /* Modals, inner cards */
--color-surface-container: #e0e8ff;
--color-on-surface: #252f43;
--color-on-surface-variant: #525b72;
--color-outline: #6d778e;
```

#### Semantic Colors
```css
--color-error: #b31b25;
--color-on-error: #ffefee;
--color-error-container: #fb5151;
--color-success: #22c55e;
--color-warning: #f59e0b;
```

#### Slot State Colors (Critical for system)
```css
--slot-open: #22c55e;
--slot-overbooked: #f59e0b;
--slot-full: #b31b25;
```

### Usage Rules
- **Primary Blue (`#006382`)** → CTAs, active highlights
- **Primary Container (`#7bd1fa`)** → Active states, softer backgrounds for primary elements
- **Tertiary Lavender (`#c8a0f0` / `#d6adff`)** → Chips, tags, data visualization
- **Background** → Clean white and off-white (`#f5f6ff`) for a highly readable, corporate/modern environment
- **Deep Navy (`#1a2438` / `#252f43`)** → High contrast text, replacing pure black

---

## 3. Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
```

### Font Styles
```css
--text-headline-lg: 700 32px/1.2 'Inter';
--text-headline-md: 600 24px/1.3 'Inter';
--text-body-md: 400 16px/1.5 'Inter';
--text-label-sm: 500 12px/1.4 'Inter'; /* letter-spacing: 0.05em */
```

### Usage
- **Headlines** → Bold weights to establish clear hierarchy
- **Body Text** → Generous line heights (1.5) for long-form reading
- **Labels** → Medium weights, tracked out, easily readable at small sizes

---

## 4. Layout System & Spacing

### Spacing Scale (8px rhythm)
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 48px;
--spacing-gutter: 16px;
--spacing-margin: 24px;
```

### Grid
- **Fluid grid** based on 8px spacing
- **Margins**: 24px on mobile, scaling up for desktop
- **Gutters**: 16px for clear separation of content blocks

---

## 5. Shape & Elevation

### Corner Radius
- **sm**: `0.25rem` (4px)
- **DEFAULT**: `0.5rem` (8px) - standard for Buttons, Inputs
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px) - large containers, Cards, Modals
- **xl**: `1.5rem` (24px) - extra large elements

### Elevation & Depth
- **Surface Level**: Base background uses light tint (`#f5f6ff`)
- **Raised Level**: Cards/modals use white (`#ffffff`) with soft, diffused shadows
- **Interactive Depth**: Buttons slightly increase shadow on hover for physical feedback

---

## 6. Component Library

### Button

#### Primary
```jsx
<button className="
  px-4 py-2
  bg-[#006382] hover:bg-[#005672]
  text-[#e5f5ff] font-medium
  rounded-lg /* 8px */
  shadow-sm hover:shadow-md
  transition-all duration-200
">
  Action
</button>
```

#### Secondary (Ghost)
```jsx
<button className="
  px-4 py-2
  border border-[#6d778e] hover:bg-[#e0e8ff]
  text-[#346176] font-medium
  rounded-lg
  transition-colors
">
  Cancel
</button>
```

#### Slot Button (Critical Component)
```jsx
<button className="
  px-3 py-2 rounded-lg text-sm font-medium
  bg-white shadow-sm border border-[#e0e8ff]
  hover:shadow-md
">
  09:30
</button>
```

### Card Container
```jsx
<div className="
  bg-white
  p-6 rounded-2xl /* 16px */
  shadow-sm
  border border-[#e0e8ff]
">
  {/* Card Content */}
</div>
```

### Chips / Tags (Tertiary)
```jsx
<span className="
  px-3 py-1 text-xs font-medium tracking-wide
  rounded-full bg-[#d6adff] text-[#4c2970]
">
  Category
</span>
```

### Input Field
```jsx
<input className="
  w-full px-4 py-2
  bg-white
  border border-[#6d778e]
  rounded-lg
  text-[#252f43]
  focus:border-[#006382] focus:ring-1 focus:ring-[#006382]
  outline-none transition-colors
"/>
```

---

## 7. State Indicators

### Loading
```jsx
<div className="animate-pulse h-4 bg-[#cfddff] rounded-full w-full"></div>
```

### Empty State
```jsx
<div className="text-center text-[#939db6] py-10 font-medium">
  No data available
</div>
```

### Error State
```jsx
<div className="bg-[#fb5151]/10 border border-[#fb5151] text-[#b31b25] p-3 rounded-lg">
  Error occurred
</div>
```

---

## 8. Accessibility Guidelines
- **Minimum contrast**: 4.5:1 (Ensure Deep Navy text on light backgrounds)
- All buttons keyboard accessible
- Focus ring visible (using Primary `#006382`)

---

## 9. Animation Guidelines
- **Duration**: 200–300ms
- Use transform + opacity for smooth interactions
- Hover states on buttons increase shadow slightly rather than huge layout shifts

---

## 10. Icon System
- **Library**: Lucide React
- **Styling**: Rendered in Deep Navy (`#252f43`) or Primary Blue (`#006382`) depending on context.

---

## 11. Performance Guidelines
- Avoid unnecessary re-renders (Zustand selective updates)
- Virtualize long queues
- Soft shadows should be CSS-based and not overload paint times
