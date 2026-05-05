# Frontend Design System & Guidelines (FRONTEND_GUIDELINES.md)

## 1. Design Principles

### Core Principles
1. **Operational Clarity**: UI must prioritize readability under pressure (reception dashboard).
2. **Real-Time Responsiveness**: Changes must be visually immediate and noticeable.
3. **State Visibility**: Every system state (overbooked, conflict, fatigue) must be explicit.
4. **Low Cognitive Load**: Color + hierarchy should reduce decision time.
5. **Consistency Across Roles**: Same visual language for admin, reception, doctor, patient.

---

## 2. Design Tokens

### Color Palette

#### Primary (Neon Cyan/Blue Theme)
```css
--color-primary-50: #e0f7ff;
--color-primary-100: #b3ecff;
--color-primary-200: #80e0ff;
--color-primary-300: #4dd4ff;
--color-primary-400: #26ccff;
--color-primary-500: #00c2ff; /* Main */
--color-primary-600: #00a3d6;
--color-primary-700: #0082aa;
--color-primary-800: #006180;
--color-primary-900: #004659;
```

#### Background (Dark System)
```css
--color-bg-primary: #0b1220;
--color-bg-secondary: #111827;
--color-bg-card: #1f2937;
--color-bg-hover: #243041;
```

#### Neutral
```css
--color-neutral-50: #f9fafb;
--color-neutral-100: #e5e7eb;
--color-neutral-200: #d1d5db;
--color-neutral-300: #9ca3af;
--color-neutral-400: #6b7280;
--color-neutral-500: #4b5563;
--color-neutral-600: #374151;
--color-neutral-700: #1f2937;
--color-neutral-800: #111827;
--color-neutral-900: #030712;
```

#### Semantic Colors
```css
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

#### Slot State Colors (Critical for system)
```css
--slot-open: #22c55e;
--slot-overbooked: #f59e0b;
--slot-full: #ef4444;
```

### Usage Rules
- **Primary** → CTAs, highlights
- **Success (Green)** → Available slots, healthy states
- **Warning (Yellow)** → Overbooked
- **Error (Red)** → Conflict / critical
- **Background** → Dark for focus

---

## 3. Typography

```css
--font-sans: 'Inter', system-ui, sans-serif;
```

### Font Sizes
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Usage
- **Dashboard metrics** → `text-3xl bold`
- **Labels** → `text-sm medium`
- **Queue items** → `text-base`

---

## 4. Spacing Scale

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
```

---

## 5. Layout System

### Grid
- 12-column grid
- Gap: 24px

### Container
```jsx
<div className="max-w-[1400px] mx-auto px-6">
```

---

## 6. Component Library

### Button

#### Primary
```jsx
<button className="
  px-4 py-2
  bg-primary-500 hover:bg-primary-600
  text-white font-medium
  rounded-lg
  transition-all duration-200
">
  Action
</button>
```

#### Danger (Conflict actions)
```jsx
<button className="
  px-4 py-2
  bg-error hover:bg-red-600
  text-white
  rounded-lg
">
  Auto Resolve
</button>
```

#### Slot Button (Critical Component)
```jsx
<button className="
  px-3 py-2 rounded-md text-sm font-medium
  border
  bg-[#0b1220]
  hover:bg-[#243041]
">
  09:30
</button>
```
**Variants:**
- **Open** → `border-green` + `text-green`
- **Overbooked** → `border-yellow` + icon `⚠`
- **Full** → `border-red`

### Queue Card
```jsx
<div className="
  flex items-center justify-between
  bg-bg-card
  p-4 rounded-lg
  border border-neutral-700
">
</div>
```

### Priority Badge
```jsx
<span className="px-2 py-1 text-xs rounded bg-red-500 text-white">
  P1
</span>
```
**Variants:**
- **P1** → red
- **P2** → yellow
- **P3** → blue

### Conflict Panel
```jsx
<div className="
  bg-red-900/20
  border border-red-500
  p-4 rounded-lg
">
</div>
```

### Doctor Card
```jsx
<div className="
  bg-bg-card
  p-4 rounded-lg
  border
  flex items-center gap-4
">
</div>
```

### Input Field
```jsx
<input className="
  w-full px-3 py-2
  bg-bg-secondary
  border border-neutral-600
  rounded-md
  text-white
  focus:ring-2 focus:ring-primary-500
"/>
```

---

## 7. State Indicators

### Loading
```jsx
<div className="animate-pulse h-4 bg-neutral-700 rounded w-full"></div>
```

### Empty State
```jsx
<div className="text-center text-neutral-400 py-10">
  No data available
</div>
```

### Error State
```jsx
<div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded">
  Error occurred
</div>
```

---

## 8. Accessibility Guidelines
- **Minimum contrast**: 4.5:1
- All buttons keyboard accessible
- Focus ring visible

---

## 9. Animation Guidelines
- **Duration**: 200–300ms
- Use transform + opacity only

**Examples:**
- Queue reorder → smooth translate
- Conflict alert → pulse

---

## 10. Icon System
- **Library**: Lucide React
- **Size**:
  - Small: 16px
  - Default: 20px
  - Large: 24px

---

## 11. Responsive Design

### Mobile (Patient UI)
- Single column
- Step-by-step flow

### Desktop (Reception/Admin)
- Multi-panel layout

---

## 12. Performance Guidelines
- Avoid unnecessary re-renders (Zustand selective updates)
- Virtualize long queues
- Lazy load heavy panels

---

## Critical Notes
This design system is:
- Custom-tailored to your UI (not generic Tailwind)
- Built for real-time dashboards
- Optimized for decision-heavy environments
