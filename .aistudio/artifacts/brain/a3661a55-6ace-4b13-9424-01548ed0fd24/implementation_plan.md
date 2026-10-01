# Directory Search Query Parameters, Explicit Search Button & Filtered QR Code Generation

Enable bidirectional synchronization between Directory Search criteria and URL query parameters, introduce an explicit "Search" action button for intentional filter execution, and extend QR code generation in the Marketing & Pamphlet Studio to encode filtered directory URLs for physical flyers and digital sharing.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The revised plan incorporates all user requirements and feedback:
> - **Explicit Search Button**: Added a dedicated "Search Directory" action button beside the search keyword input (with Enter-key trigger) to allow users to consciously execute searches and push history states.
> - **Bidirectional Query Parameter Sync**:
>   - URL parameters (`q`, `role`, `stage`, `category`, `location`) hydated on mount and kept in sync with browser Back/Forward (`popstate`).
>   - Default/all values are omitted from the URL to keep paths clean.
> - **QR Code Generator Integration**:
>   - Extended `PamphletSection.tsx` and QR generation utilities to support all 5 directory criteria (`q`, `role`, `stage`, `category`, `location`).
>   - Scanning the generated QR code lands directly on the filtered directory view with pre-selected filters.
>   - Added a "Generate QR for this Search" action in the Directory header so administrators and users can instantly export a QR flyer for their currently filtered view.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. Synchronizes the 5 search criteria (`q`, `role`, `stage`, `category`, `location`) between the Directory UI and the browser URL query string.
  2. Adds an explicit "Search" button that commits the keyword search and updates the URL and listing results.
  3. Upgrades the QR Code & Pamphlet generator (`PamphletSection.tsx`) with filter criteria options, generating QR codes that embed full query strings (e.g. `https://www.nova-h.in/directory?role=vendor&location=Mumbai&category=Diagnostic+Imaging`).
  4. Provides a 1-click "Share / QR Code for this Search" button on the Directory page that opens the QR studio with the active search pre-loaded.
- **Target Audience**: Hospital promoters, verified suppliers, and consultants who need to bookmark searches or print flyers with QR codes targeting specific specialties and cities.
- **Key Value**: Professional query-parameter deep linking, intentional search triggers, and cross-channel marketing through QR codes.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Explicit Search & Filter Execution**:
   - The user selects `Stage: Equipment Procurement`, `Category: Diagnostic Imaging`, and types `CT Scan` in the keyword box.
   - Clicking the explicit **"Search Directory"** button (or pressing Enter) applies the filter, scrolls smoothly to results, and updates the URL to `/directory?q=CT+Scan&stage=Equipment+Procurement&category=Diagnostic+Imaging`.
2. **Instant Search QR Generation**:
   - Above the directory results, a **"Generate QR Code"** button is displayed.
   - Clicking it opens the QR Pamphlet Studio pre-populated with the exact active search URL.
   - The user can download high-res PNG/SVG QR codes or print A4 flyer pamphlets featuring the filtered search.
3. **Scanning a QR Code**:
   - A hospital promoter scans a physical flyer at a conference.
   - Their phone opens `/directory?role=vendor&location=Bengaluru&category=Modular+OT`.
   - The page instantly hydrates: the location is set to Bengaluru, category to Modular OT, and only matching verified vendors are presented.
4. **Browser Back/Forward Navigation**:
   - Pressing browser Back/Forward smoothly steps through previous filter combinations without reloading the page.

#### B. Visual Polish & Anti-Slop Discipline
- Complies with *Frontend Design Constitution*:
  - Single-elevation input bar with uniform $40\text{px}$ control heights.
  - Primary blue accent on the "Search Directory" button with clear search icon.
  - Crisp URL parameter encoding handling spaces, `&`, and `+`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Explicit Search Button vs Live Typing**
  - *Chosen Approach*: Maintain local draft text while typing, and commit search to URL/results when the user clicks the explicit "Search" button or presses Enter (with a clear button to reset).
  - *Why*: Directly satisfies the user's explicit request and prevents unnecessary URL thrashing while composing long technical terms.

- **Decision 2: Query Parameter Utility (`src/utils/directoryQueryParams.ts`)**
  - *Chosen Approach*: Centralized helper with `getDirectoryParamsFromUrl()`, `buildDirectorySearchUrl()`, and `updateDirectoryUrlParams()`.
  - *Why*: Shared between `DirectorySearch.tsx`, `PamphletSection.tsx`, and `Navbar.tsx`, avoiding duplicated URL parsing logic.

- **Decision 3: Filtered QR Code Generation**
  - *Chosen Approach*: In `PamphletSection.tsx`, provide controls to customize the target directory URL with role, location, stage, category, and keyword parameters.
  - *Why*: Fulfills Requirement #2 seamlessly so printed pamphlets can target specific regions and vendor categories.

---

### 4. Technical Architecture & Parameter Mapping

#### Query Parameter Schema

```
Key        Type                           Default (Omitted)    Description
─────────────────────────────────────────────────────────────────────────────
q          string                         "" (empty)           Search keywords
role       'all' | 'vendor' | 'advisor'   'all'                Partner community role
stage      string                         'All'                Hospital project stage
category   string                         'All'                Specialty or category
location   string                         'All'                City or territory
```

#### Shared Directory URL Generator (`src/utils/directoryQueryParams.ts`)

```ts
export const buildDirectoryUrl = (criteria: DirectorySearchParams, base: string = '/directory'): string => {
  const params = new URLSearchParams();
  if (criteria.q?.trim()) params.set('q', criteria.q.trim());
  if (criteria.role && criteria.role !== 'all') params.set('role', criteria.role);
  if (criteria.stage && criteria.stage !== 'All') params.set('stage', criteria.stage);
  if (criteria.category && criteria.category !== 'All') params.set('category', criteria.category);
  if (criteria.location && criteria.location !== 'All') params.set('location', criteria.location);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};
```

---

### 5. Step-by-Step Implementation Sequence

1. **`src/utils/directoryQueryParams.ts`**:
   - Implement `getDirectoryParamsFromUrl()`, `buildDirectoryUrl()`, and `updateDirectoryUrlParams()`.
2. **`src/components/DirectorySearch.tsx`**:
   - Hydrate initial filter state from URL query parameters on mount.
   - Add explicit **"Search Directory"** button with `Search` icon alongside the keyword input.
   - Wire Enter-key submission and button click to update search results and push/replace URL query parameters.
   - Add a **"Generate QR Code"** action button in the directory controls that opens the Pamphlet Studio with the current search query string.
   - Attach `popstate` listener to synchronize state on browser Back/Forward navigation.
3. **`src/components/PamphletSection.tsx`**:
   - Add query parameter configuration controls (Role, Location, Category, Keyword) so administrators can generate tailored QR codes.
   - Support receiving incoming query parameters when navigated from `DirectorySearch`.
4. **Verification**:
   - Run `compile_applet` and `lint_applet` to confirm zero errors.
   - Test explicit search execution, browser Back/Forward navigation, and QR code generation for filtered URLs.
