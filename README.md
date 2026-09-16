# NOVA — Network for Owners, Vendors & Advisors

> **Where Hospital Projects Find the Right People.**
> An integrated healthcare infrastructure ecosystem connecting Hospital Owners, Equipment Vendors, and Specialized Advisors.

---

## 🏗️ Architecture & Sections

This platform faithfully implements the **NOVA Homepage Wireframe** and specifications:

1. **Sticky Header**: Brand logo, navigation (`For Owners`, `For Vendors`, `For Advisors`, `Toolkit`, `How It Works`, `Directory`, `About`), Sign In / Sign Up, and live CI/CD pipeline trigger.
2. **Hero Section**:
   - Headline: *Where Hospital Projects Find the Right People*
   - Interactive stakeholder diagram: `Hospital Owner` ↔ `Vendors` ↔ `Advisors`
   - Equation: `Owners + Vendors + Advisors = NOVA`
   - Core Tagline: *Better Hospitals, Brighter Tomorrows*
3. **What is NOVA?**: Callout narrative and foundational pillars (*Right Requirement, Right Time, Right Location, Right Quality*).
4. **Three User Groups**: Interactive cards for Owners, Vendors, and Advisors with actionable pathways.
5. **How NOVA Works**: 5-step sequential journey (*Tell us what you need → Discover → Understand → Connect → Move project forward*).
6. **Hospital Owners Toolkit**: Interactive 15-stage guide viewer from concept to commissioning with downloadable checklists and milestones.
7. **Location-Based Search / Directory**: Real-time filtering by Indian metropolitan and regional locations, healthcare disciplines, project stages, and keyword search.
8. **Why Join NOVA?**: 3-column value matrix for Owners, Vendors, and Advisors.
9. **Future Features**: Upcoming modules including Templates & Checklists, Project Tools, Case-based Consulting, AI-assisted Hospital Consulting, and Resource Library.
10. **Final CTA & Footer**: Dual action cards for hospital builders and suppliers, complete with legal disclaimers, support links, and social channels.

---

## 🚀 Version Control & CI/CD Automated Publishing

The codebase is version-controlled with Git and pre-configured with production-ready CI/CD workflows under `.github/workflows/`:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- Runs on every `push` and `pull_request` to `main`
- Verifies package dependencies
- Executes TypeScript static analysis (`npm run lint`)
- Builds the production distribution (`npm run build`)
- Saves build artifacts

### 2. Continuous Automated Deployment (`.github/workflows/deploy.yml`)
- Automatically deploys the static application on push to `main`
- Configured for GitHub Pages / Cloudflare Pages / Container hosting
- Includes atomic rollback protection and concurrency management

### 3. Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server (binds to http://localhost:3000)
npm run dev

# Run TypeScript type check
npm run lint

# Build production distribution
npm run build

# Automated publish script
./deploy.sh
```

### 4. Connecting to Your Remote Git Repository

```bash
# Link to your remote GitHub / GitLab repo
git remote add origin https://github.com/YOUR_ORGANIZATION/nova-hospital-network.git

# Set main branch
git branch -M main

# Push and activate the CI/CD pipeline
git push -u origin main
```
