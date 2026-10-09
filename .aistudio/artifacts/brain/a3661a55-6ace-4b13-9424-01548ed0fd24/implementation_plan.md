# Directory Sample CSV & Parser Attribute Enhancement Plan

Enhance the sample CSV template and parser to cover the remaining directory attributes requested by the user: **Featured Project**, **Compliance Badges**, and **Verified Status**, while keeping profile claiming fields automated through system workflows.

---

## User Decision & Scope Summary

- **Missing Attributes to Add**:
  1. **Featured Project (`featuredProject`)**: Key flagship project or case study showcase (e.g., *"500-Bed Super Specialty ICU Setup; Completed 2024"*).
  2. **Compliance Badges (`complianceBadges`)**: Semicolon-delimited badges verified for the vendor/advisor (e.g., *"Verified by NOVA Admin; Active AERB License; ISO 13485"*).
  3. **Verified Status (`verified`)**: Explicit verification boolean column (`true` / `false` or `yes` / `no`).
- **Profile Claiming Attributes (`isClaimed`, `claimStatus`, `claimedByUserId`)**: Kept automated by NOVA administrative workflows and claim review approvals, excluded from CSV columns to maintain security and prevent unauthorized claiming.

---

## Proposed Changes

### 1. Update CSV Generator (`src/utils/directoryStorage.ts`)
- Update `generateSampleDirectoryCSV()`:
  - Add 3 new columns to headers:
    - `"Featured Project"`
    - `"Compliance Badges"`
    - `"Verified"`
  - Expand all sample rows (VitalTech Biomedical, SurgiClean Modular Cleanrooms, AeroMed NABH & Quality Advisors) with high-quality, realistic healthcare data for these columns.

### 2. Update CSV Parser (`src/utils/directoryStorage.ts`)
- In `parseDirectoryCSV()`:
  - Parse `featuredProject` using aliases: `['featuredproject', 'featured_project', 'project', 'flagship']`.
  - Parse `complianceBadges` using aliases: `['compliancebadges', 'compliance_badges', 'badges', 'compliance']`, split by `;` or `|`, trimmed and filtered.
  - Parse `verified` using aliases: `['verified', 'is_verified', 'verification']`. Support values like `true`/`false`, `yes`/`no`, `1`/`0`. Default to `true` if blank.
  - Ensure sanitized `DirectoryItem` objects retain these fields for database synchronization.

### 3. Update Admin Console UI Documentation (`src/components/AdminConsoleView.tsx`)
- Update the CSV column guide and tooltip inside the Bulk CSV Importer modal:
  - List the new columns (`Featured Project`, `Compliance Badges`, `Verified`).
  - Provide formatting examples (e.g. semicolon-separated badges, boolean verification).
  - Clarify that profile claiming continues to be handled automatically via the Claims Review console.

---

## Verification Plan

1. **Compilation**: Run `compile_applet` to ensure TypeScript types and exports match without errors.
2. **CSV Sample Generation Verification**:
   - Verify generated CSV string contains all 23 headers and corresponding row values.
3. **Parser Round-Trip Verification**:
   - Feed the sample CSV back into `parseDirectoryCSV` to verify that `featuredProject`, `complianceBadges`, and `verified` parse cleanly into `DirectoryItem[]`.
4. **Database Ingestion Verification**:
   - Ensure the parsed items map directly into the database schema via `/api/directory/bulk`.
