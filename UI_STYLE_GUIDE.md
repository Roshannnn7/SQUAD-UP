# SquadUp — Humanized UI & Design System Style Guide

This document outlines the design philosophy, iconography standards, component conventions, animation patterns, and accessibility requirements for the SquadUp platform.

---

## 🎯 Humanized Design Principles

1. **Human-Centered Aesthetic**: Interfaces should feel warm, intentional, and human-crafted — avoiding generic AI templates, stock placeholders, and robotic visual noise.
2. **Professional Iconography & Typography**: Emojis are strictly removed from UI titles, navigation labels, form selects, badges, and system toasts. All visual indicators rely on vector SVG icon sets (`react-icons/fi`, `react-icons/hi2`, `react-icons/bs`).
3. **Subtle Functional Motion**: Motion designed with Framer Motion enhances usability through purposeful feedback (subtle page fade-ins, smooth tab transitions, and micro-hover states). Avoid flashy, jarring, or unnecessary loop animations.
4. **Guided Multi-Step Flows**: Complex interactions (such as onboarding) are broken down into logical, multi-step wizards with visual progress indicators, clear role selection cards, and guided step controls.
5. **Accessible by Default (WCAG 2.1 AA)**: High-contrast color scales, keyboard focus rings (`focus:ring-2 focus:ring-violet-500`), explicit `<label>` bindings, and screen-reader `aria-label` attributes across all interactive components.

---

## 🎨 Color Tokens & Design System Scale

### Color Palette
- **Primary Accent**: Violet / Indigo (`violet-600` `#7c3aed`, `indigo-600` `#4f46e5`)
- **Secondary Accent**: Cyan / Sky (`cyan-500` `#06b6d4`, `sky-500` `#0ea5e9`)
- **Success / Positive**: Emerald (`emerald-600` `#059669`, `emerald-500/10` background)
- **Warning / Alert**: Amber / Gold (`amber-500` `#f59e0b`, `amber-400` `#fbbf24`)
- **Danger / High Priority**: Rose / Red (`rose-500` `#f43f5e`, `red-500/10` background)
- **Backgrounds**: Light (`slate-50` `#f8fafc`, `white` `#ffffff`), Dark (`gray-950` `#030712`, `gray-900` `#111827`)

### Typography Scale
- **Display Headings**: `text-4xl` to `text-7xl`, `font-extrabold`, tracking `tight`, tracking `-0.02em`
- **Section Titles**: `text-2xl` to `text-3xl`, `font-bold`
- **Card Subheadings**: `text-lg` to `text-xl`, `font-bold`
- **Body Text**: `text-base` / `text-sm`, `text-slate-600` (Light) / `text-slate-300` (Dark), `leading-relaxed`
- **Badges & Microcopy**: `text-xs`, `font-semibold` / `font-bold`, uppercase tracking `wider`

---

## 🔤 Iconography & Microcopy Replacement Map

| Informal / Emoji Pattern | Humanized Standard Label | Recommended SVG Icon (`react-icons`) |
|--------------------------|--------------------------|-------------------------------------|
| `🎓 Student` | `Student` | `FiBookOpen` / `FiUser` |
| `👨‍🏫 Mentor` | `Mentor` | `FiBriefcase` / `FiAward` |
| `👥 Create Squad` | `Create Squad` | `FiUsers` / `FiPlus` |
| `💬 Open Chat` | `Open Chat` | `FiMessageSquare` |
| `🎯 Task Board` | `Task Board` | `FiCheckSquare` |
| `📋 Daily Stand-up` | `Daily Stand-up` | `FiCalendar` / `FiClipboard` |
| `🧪 Skill Lab` | `Skill Lab` | `FiCode` / `FiZap` |
| `🏆 Winner / Leaderboard` | `Winner / Leaderboard` | `FiAward` |
| `🗺️ Squad Roadmap` | `Squad Roadmap` | `FiMap` |
| `☀️ No Check-ins` | `No Check-ins` | `FiSun` |
| `➕ Add` | `Add` | `FiPlus` |
| `🚀 Task Created` | `Task Created` | `FiCheckCircle` |

---

## 🚀 Onboarding Flow Standards

- **Step 1: Role Selection**: Interactive role selection cards for Students and Mentors with distinct icons, descriptions, keyboard selection (`Enter` / `Space`), and active state outlines.
- **Step 2: Background Information**: Step-specific form inputs for academic institution (students) or current company and experience (mentors).
- **Step 3: Skills & Social Links**: Skills tags, portfolio links, and bio summary with real-time validation.
- **Navigation**: Progress step bar at top + explicit "Back" and "Next / Complete" guided buttons.

---

## 🛡️ WCAG 2.1 AA Accessibility Checklist

- [x] All icon-only buttons include descriptive `aria-label="..."` or `<span className="sr-only">...</span>` text.
- [x] Form inputs have corresponding `<label htmlFor="...">` elements or `aria-label`.
- [x] All interactive controls include visible focus rings (`focus:ring-2 focus:ring-violet-500 focus:outline-none`).
- [x] Minimum touch target height of 44px on mobile navigation links and form buttons.
- [x] State transitions (loading, selected roles, active tabs) are announced via text, aria attributes, or clear SVG indicators.

