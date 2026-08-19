# PROFILE_GUIDE.md — SquadUp Profile & Portfolio Standards

## User Schema: Field Sources

| Field | Source | Notes |
|---|---|---|
| `fullName` | Registration form (`POST /api/auth/register`) or Google OAuth name (`POST /api/auth/verify`) | Manual signup ALWAYS uses the typed name; Google OAuth uses Gmail display name |
| `username` | Auto-derived from fullName on first registration; editable in Settings | Unique, lowercase, alphanumeric + hyphens |
| `email` | Firebase auth | Never overridden |
| `profilePhoto` | User-uploaded photo (Firebase Storage) | Takes precedence over `avatarUrl` |
| `avatarUrl` | Selected from curated preset (DiceBear `avataaars-neutral` style, 12 options) | Used as fallback when `profilePhoto` is empty |
| `bio` | Set during onboarding Step 2, editable in Profile/Settings | Synced to `User.bio` AND `StudentProfile.bio` |
| `college` | Set during onboarding Step 2 as `StudentProfile.college`; denormalized to `User.college` | Displayed in profile hero and portfolio header |
| `program` | Derived from `degree + year` on profile completion; denormalized to `User.program` | e.g. `"BCA (Year 2)"` |
| `skills` | Set in onboarding Step 3; editable in Settings | Synced to both `User.skills` and `StudentProfile.skills` |
| `socialLinks` | Set in Settings or Profile edit mode | `{ github, linkedin, twitter, portfolio }` |
| `headline` | Set in Profile edit mode or Settings | Short descriptor displayed below username |
| `points` / `streak` / `badges` | Computed by gamification system | Read-only from profile perspective |

---

## Avatar Policy

**No random avatars.** The platform uses the following priority order:

1. `profilePhoto` — user-uploaded photo (Firebase Storage URL)
2. `avatarUrl` — curated preset chosen during onboarding or Settings > Avatar
3. Fallback DiceBear URL only in UI render, never persisted to DB

**Curated Set**: 12 avatars using DiceBear `avataaars-neutral` style with distinct seeds and muted background colors. Available at `/onboarding` (Step 2) and `/settings` (Avatar section).

---

## Registration Flow

### Manual Email/Password Signup
```
1. Firebase: createUserWithEmailAndPassword(email, password)
2. Backend:  POST /api/auth/register
             Body: { fullName, email, role, firebaseUid }
             → Creates User with typed fullName (never Gmail name)
             → Auto-generates username from fullName
3. Redirect: → /onboarding
```

### Google OAuth Signup
```
1. Firebase: signInWithPopup(auth, googleProvider)
2. Backend:  POST /api/auth/verify
             Body: { firebaseToken, role }
             → Reads name/picture from Google token (Firebase sign_in_provider = "google.com")
             → Creates User with Gmail display name and profile photo
3. Redirect: → /onboarding (if first time) or /dashboard/{role}
```

---

## Profile Completion Flow (Onboarding)

| Step | Content | API |
|---|---|---|
| 1 | Role selection (student / mentor) | — |
| 2 | Academic background (college, degree, year, bio) + avatar selection | — |
| 3 | Skills, GitHub/LinkedIn links → Submit | `PUT /api/auth/complete-student-profile` |

On completion, `User.isProfileComplete = true` and the following are denormalized onto `User`:
- `bio`, `college`, `program`, `skills`, `avatarUrl`, `profilePhoto`, `socialLinks`

---

## Profile API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Manual registration (preserves typed name) |
| `POST` | `/api/auth/verify` | Public | Google OAuth / Firebase token verification |
| `GET` | `/api/profiles/me` | Private | Returns own profile with roleProfile, experiences, education |
| `PUT` | `/api/auth/profile` | Private | Update User fields: fullName, username, bio, college, program, avatarUrl, profilePhoto, socialLinks, headline |
| `PUT` | `/api/profiles` | Private | Update skills, interests, privacy settings |
| `GET` | `/api/profiles/:userId` | Public | View another user's profile (respects privacy settings) |

---

## Portfolio Page Data Mapping

The portfolio page (`/portfolio/[userId]`) uses `GET /api/profiles/:userId` which returns:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "...",
    "username": "...",
    "college": "...",        // denormalized from StudentProfile
    "program": "...",        // denormalized from StudentProfile
    "profilePhoto": "...",
    "avatarUrl": "...",
    "bio": "...",
    "skills": [...],
    "socialLinks": {...},
    "points": 0,
    "streak": { "current": 0 },
    "badges": [...],
    "roleProfile": {         // StudentProfile or MentorProfile subdoc
      "college": "...",
      "degree": "...",
      "year": "..."
    },
    "experiences": [...],    // UserExperience docs
    "education": [...],      // UserEducation docs
    "recentPosts": [...],
    "mutualSquads": [...]    // only when viewing another user
  }
}
```

**Important**: Always read `data.college` (denormalized) or `data.roleProfile.college` — never `data.studentProfile.institution` (that field does not exist).

---

## Design Principles (Profile UI)

- **No emojis** in UI text. Use `react-icons/fi` for all icons.
- **Avatar fallback order**: `profilePhoto` > `avatarUrl` > DiceBear render-only
- **College display format**: `"BCA (Year 2) at Gulbarga University"` (program first, college after "at")
- **Handle display**: `@username` in violet, derived from fullName if username not set
- **Stats row**: XP · Streak · Badges · Squads · Connects (always 5 cells)
- **Edit mode**: inline, no separate edit page — toggle via "Edit Profile" button in hero
- **Settings page** (`/settings`): 6-section sidebar layout (Profile / Avatar / Skills / Links / Privacy / Security)

---

## WCAG 2.1 AA Compliance Checklist

- All interactive elements have `aria-label` or visible label text
- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All form inputs have associated `<label>` elements with `htmlFor`
- Toggle switches use `role="switch"` and `aria-checked`
- Avatar grid buttons have `aria-label="Avatar N"`
- Keyboard navigation: all buttons and links reachable via Tab
- Focus indicators visible (Tailwind `focus:ring-2 focus:ring-violet-400`)
