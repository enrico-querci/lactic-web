# Public product website

The root route is the public Lactic / Lactic Studio website. Product tabs update
the hero, native app screenshots, and feature copy without leaving the page.
`/#studio` opens the coach view directly; `/#lactic` opens the client view.
The existing locale provider supplies Italian/English and remembers the choice.

Visitors go to `/login` from the calls to action. Signed-in visitors can open
their role-specific programme dashboard from the same controls. The landing page
stays available to both roles; authentication and invitation routes are unchanged.

## Design and content

The page uses the native design system documented in lactic-ios:
chalk `#F5F6F0`, graphite `#192118`, lime `#CCF36B`, and accessible green
`#466B12`. Styles are scoped to `components/marketing/website.module.css`.
Marketing copy lives in `components/marketing/copy.ts`.

The website accurately distinguishes the live web portal from the native apps
in development. Do not add App Store download links until the apps are released.
Studio programme creation, assignments, and progress review refer to the web
portal; the native Studio screenshot shows the implemented client roster.

## Screenshot provenance

All images in `public/images/marketing/` are actual simulator captures from the
native apps, taken on 2026-09-24 with synthetic DEBUG-only fixtures. They contain
no production client data. Capture with Italian app language and light appearance:

| File                 | Simulator                       | Launch arguments           |
| -------------------- | ------------------------------- | -------------------------- |
| `lactic-home.png`    | iPhone 17, iOS 26.5             | `--home-design-preview`    |
| `lactic-workout.png` | iPhone 17, iOS 26.5             | `--workout-design-preview` |
| `lactic-studio.png`  | iPad Pro 13-inch (M5), iOS 26.5 | `--studio-design-preview`  |

Set a consistent status bar with `simctl status_bar`, launch using
`-AppleLanguages '(it)' -AppleLocale it_IT`, and capture with `simctl io`.
The built-in English fixture programme names and notes remain unchanged.
Next Image serves optimized responsive variants; the originals stay in Git.

## Verification and deployment

Run `npm run lint` and `npm run build`. Check both product tabs, keyboard
Left/Right/Home/End navigation, direct `/#studio` navigation, Italian/English
switching and persistence, login links, and narrow/desktop layouts.

Use the existing lactic-web Vercel Git integration for PR previews. Production
deployment remains tied to merging the reviewed PR into `main`; no new Vercel
project, environment variables, or paid services are needed.
