# Clinical Tech & Enterprise Trust Design System

A battle-tested, high-density design system engineered for enterprise workflows, healthcare portals, B2B procurement networks, and mission-critical SaaS dashboards.

---

## 1. Design Philosophy

- **Institutional Trust**: Built with disciplined cool slate neutrals and medical sapphire accents rather than trendy gradients or arbitrary neon glows.
- **High Information Density**: Structured for fast scanning of complex tables, comparative matrices, RFQ pipelines, and multi-field technical forms.
- **Zero AI Slop**: Strict rejection of nested container fatigue, oversized decorative hero text, or low-contrast gray text on tinted backgrounds.
- **Dual-Theme First**: Purpose-built mathematical contrast targets for both crisp light daylight environments and low-strain dark clinical environments.

---

## 2. Color Palette & Token Hierarchy

### 2.1 Foundational Cool Neutrals

| Token Name | Light Mode | Dark Mode | Hex Light | Hex Dark | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Canvas Background** | `slate-50` | `slate-950` | `#F8FAFC` | `#020617` | Main viewport canvas, body backdrop |
| **Primary Surface** | `white` | `slate-900` | `#FFFFFF` | `#0F172A` | Cards, elevated tables, modals, flyouts |
| **Sub-Surface** | `slate-100` | `slate-800` | `#F1F5F9` | `#1E293B` | Inputs, sub-table headers, filter rows |
| **Interactive Hover** | `slate-200` | `slate-700` | `#E2E8F0` | `#334155` | Button hovers, active dropdown item hovers |
| **Border / Divider** | `slate-200` | `slate-800` | `#E2E8F0` | `#1E293B` | Structural containers, table cells, dividers |
| **Text Primary** | `slate-900` | `slate-50` | `#0F172A` | `#F8FAFC` | Headings, active values, high-contrast labels |
| **Text Secondary** | `slate-600` | `slate-400` | `#475569` | `#94A3B8` | Body paragraphs, descriptions, metadata |
| **Text Muted** | `slate-400` | `slate-500` | `#94A3B8` | `#64748B` | Timestamps, placeholder labels, disabled |

### 2.2 Semantic & Functional Colors

| Semantic Role | Light Foreground / Border | Light Background | Dark Foreground / Border | Dark Background | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Brand / Action** | `blue-700` / `blue-200` | `blue-50` / `blue-600` | `blue-400` / `blue-800` | `blue-950/50` / `blue-500` | Primary CTAs, active tabs, links |
| **Success & Verification** | `emerald-800` / `emerald-200` | `emerald-50` | `emerald-300` / `emerald-800` | `emerald-950/60` | Verified badges, accreditations (NABH, ISO) |
| **Attention & Alerts** | `amber-900` / `amber-200` | `amber-50` | `amber-300` / `amber-800` | `amber-950/50` | Action required, pending RFQs, matrix diffs |
| **Clinical / Telemetry** | `purple-800` / `purple-200` | `purple-50` | `purple-300` / `purple-800` | `purple-950/50` | Workflow automation, AI copilot, special roles |
| **Destructive / Urgency** | `red-700` / `red-200` | `red-50` | `red-400` / `red-800` | `red-950/50` | Deletion actions, warning badges, urgent tags |

---

## 3. Typography & Hierarchy Rules

### 3.1 Typeface Selection
- **Body & Display**: Geometric, modern sans-serif with tall x-height (e.g., `Plus Jakarta Sans`, `Inter`, or system UI stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).
- **Telemetry & Monospace**: `JetBrains Mono`, `SF Mono`, or standard `font-mono` for serial numbers, IDs, timestamps, and pricing codes.

### 3.2 Scale & Line Heights
- **Scale Factor**: 1.125 – 1.25 (Product/App scale optimized for dense layouts).
- **H1 (Page Hero / Top Bar)**: `text-2xl sm:text-3xl font-extrabold tracking-tight` (Line height: 1.2).
- **H2 / H3 (Card / Section Titles)**: `text-base sm:text-lg font-black` (Line height: 1.3).
- **Body / Descriptive**: `text-xs sm:text-sm font-normal leading-relaxed` (Line height: 1.5–1.6, line length capped at 65–75 characters).
- **Pill / Badge / Meta Labels**: `text-[10px]` or `text-[11px] font-bold uppercase tracking-wider`.

### 3.3 Strict Label Constraint
- Text inside buttons, pills, chips, tabs, and status badges must **always sit on a single line** (`whitespace-nowrap`).
- Never truncate or wrap text inside interactive badges.

---

## 4. Geometry, Radii & Spacing Formulas

### 4.1 Border Radii
- **Outer Shell / Cards / Panels**: `rounded-2xl` (16px).
- **Form Controls / Buttons / Inputs**: `rounded-xl` (12px).
- **Micro Badges / Sub-Chips**: `rounded-lg` (8px).
- **Pill Badges / Avatars**: `rounded-full` (9999px).

### 4.2 The Mathematical Nested Radius Rule
When placing a rounded element inside another rounded container with padding:
$$\text{Inner Radius} = \text{Outer Radius} - \text{Padding Between Containers}$$
*Example*: A card with `rounded-2xl` (16px) and `p-2` (8px padding) should have inner child blocks rounded with $16 - 8 = 8\text{px}$ (`rounded-lg`).

### 4.3 Padding & Spatial Math
- **Button Padding Ratio**: Horizontal padding is strictly twice vertical padding (e.g. `py-2 px-4` or `py-2.5 px-5`).
- **Surface Padding**: Minimum outer padding of `p-4` to `p-6`. Outer container padding must always be equal to or greater than inner child spacing.

---

## 5. Ready-to-Use Component Snippets (Tailwind CSS)

### 5.1 Dual-Theme Container Card
```html
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
  <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
    <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">Hospital Specification Summary</h3>
    <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500">#HSP-2026</span>
  </div>
  <p class="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
    Complete architectural and medical gas pipeline installation schedule.
  </p>
</div>
```

### 5.2 Primary & Ghost Action Buttons
```html
<!-- Primary CTA -->
<button class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
  <span>Submit Proposal</span>
</button>

<!-- Secondary Ghost Button -->
<button class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer">
  <span>Download RFP (PDF)</span>
</button>
```

### 5.3 Semantic Status Badges
```html
<!-- Verified Partner Badge -->
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
  Verified Partner
</span>

<!-- Pending Action Badge -->
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
  Action Required
</span>
```

### 5.4 Form Input Field
```html
<div class="space-y-1">
  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
    Hospital Bed Capacity <span class="text-red-500">*</span>
  </label>
  <input 
    type="text" 
    placeholder="e.g., 250 Beds (Tertiary Care)"
    class="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-colors"
  />
</div>
```

### 5.5 High-Density Data Matrix / Table Row
```html
<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
  <td class="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-xs border-b border-slate-200 dark:border-slate-800">
    NABH Accreditation
  </td>
  <td class="p-3.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
    Level 5 Full Assessment
  </td>
  <td class="p-3.5 text-right border-b border-slate-200 dark:border-slate-800">
    <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400">Compliant</span>
  </td>
</tr>
```
