# Squad-Up — UI & Design System Style Guide

This document defines the professional UI/UX standards, typography, copy guidelines, and component conventions for the Squad-Up platform.

---

## 🎯 Design Principles

1. **Clarity & Focus**: Minimal cognitive load. Microcopy is direct, professional, and action-oriented.
2. **Professional Aesthetics**: No informal emojis in headers, cards, or navigation labels. Use SVG icon libraries (`react-icons/fi`, `react-icons/hi2`, `react-icons/bs`).
3. **Subtle Motion**: Use Framer Motion strictly for functional feedback (page transitions, subtle fades, modal mounts). Avoid excessive or distracting animations.
4. **Accessible Contrast (WCAG 2.1 AA)**: All text must meet minimum contrast ratios against backgrounds in both light and dark mode.
5. **Keyboard & Screen Reader First**: Interactive elements must include proper `aria-label` attributes and focus rings.

---

## 🎨 Color Palette & Tokens

- **Primary Accent**: Violet / Indigo (`bg-violet-600`, `text-violet-500`, `border-violet-500/30`)
- **Success / Positive**: Emerald / Green (`bg-emerald-500/10`, `text-emerald-400`)
- **Warning / Medium**: Amber / Yellow (`bg-amber-500/10`, `text-amber-400`)
- **Danger / High Priority**: Red (`bg-red-500/10`, `text-red-400`)
- **Neutral Backgrounds**: Dark (`bg-gray-950`, `bg-gray-900`), Light (`bg-gray-50`, `bg-white`)

---

## 🔤 Typography & Copy Conventions

### Microcopy Guidelines

| Bad (Informal / Emoji) | Good (Professional Label) |
|------------------------|----------------------------|
| `👥 Create Squad` | `Create Squad` (with `FiUsers` icon) |
| `💬 Open Chat` | `Open Chat` (with `FiMessageSquare` icon) |
| `🎯 Task Board` | `Task Board` (with `FiCheckSquare` icon) |
| `📋 Daily Stand-up` | `Daily Stand-up` (with `FiClipboard` icon) |
| `🧪 Skill Lab` | `Skill Lab` (with `FiCode` icon) |
| `🥇 Rank 1` | `Rank 1` (with `FiAward` gold badge) |
| `🚀 Great!` | `High Energy` (with `FiTrendingUp` icon) |

---

## 🛡️ Accessibility Checklist

- [ ] All icon-only buttons include `aria-label="..."` or screen-reader text `<span className="sr-only">...</span>`.
- [ ] Inputs have associated `<label>` elements or `aria-label`.
- [ ] Color is never the sole indicator of state; always pair with text or an icon.
- [ ] Modal dialogues trapped focus and include keyboard `Esc` dismiss handlers.
