# Life of Pi - AI Handoff

## Project Location

Local project directory:

`/Volumes/192.168.2.20/Life of Pi project`

Original SMB path:

`smb://192.168.2.20/E/Life of Pi project`

GitHub repository:

`https://github.com/taopipi1-bit/projcet-pi`

GitHub Pages URL:

`https://taopipi1-bit.github.io/projcet-pi/`

## Current Architecture

This is a single-file mobile-first PWA.

Main files:

- `index.html` - GitHub Pages entry file.
- `Life_of_Pi.html` - PWA launch file referenced by `manifest.json`.
- `manifest.json` - PWA metadata, app name, icons, start URL.
- `serve.js` - local LAN static server for phone testing.
- `icon-180.png`, `icon-192.png`, `icon-512.png` - PWA icons.
- `Life_of_Pi_prompt.md` - original product/design prompt.
- `CLAUDE.md` - old guidance file. It contains useful product philosophy, but its "not started yet" status is outdated.

Important: keep `index.html` and `Life_of_Pi.html` identical unless intentionally changing the launch behavior.

There is no build step, no package manager, and no external runtime dependency for the app itself. Changes are made directly in the HTML files.

## Recommended Onboarding For A New AI

Read these files in this order:

1. `AI_HANDOFF.md`
2. `index.html`
3. `Life_of_Pi.html`
4. `manifest.json`
5. `serve.js`
6. `Life_of_Pi_prompt.md`
7. `CLAUDE.md`

Treat `AI_HANDOFF.md` as the current operational truth.

Treat `CLAUDE.md` as partially stale. Its design philosophy and constraints are useful, but its project status is wrong because the app is already implemented.

Before making edits, run:

```sh
git status --short --branch
cmp -s index.html Life_of_Pi.html; printf 'html_cmp=%s\n' $?
```

If `html_cmp=0`, edit both files consistently. If not, inspect why before changing anything.

## Development Rules

- Keep the app single-file and dependency-free.
- Do not add npm dependencies, CDN libraries, or a build system unless the user explicitly approves a larger migration.
- Use inline SVG icons. Do not add external icon libraries.
- Keep the interface mobile-first. Primary target width is around 390px.
- Avoid horizontal scrolling.
- Keep `index.html` and `Life_of_Pi.html` identical after normal app changes.
- Keep data access through the existing `db` layer. Do not directly scatter `localStorage` reads/writes through feature code.
- Any change that modifies user data should still trigger the existing sync path through `db.*.save`, `db.*.add`, `db.*.update`, `db.*.del`, or `db.settings.set`.
- Avoid destructive data migrations unless there is a written migration plan and backup path.

## Edit Workflow

Normal feature/fix workflow:

1. Inspect the relevant render function and event handlers in `index.html`.
2. Make the same change in `Life_of_Pi.html`.
3. Verify both files are identical.
4. Check inline JS syntax.
5. Run local server if visual/mobile testing is needed.
6. Commit.
7. Push to GitHub.
8. Wait for GitHub Pages to refresh.
9. Verify the public URL with a cache-busting query string.

Useful search targets:

- `renderCountdowns`
- `renderCheckins`
- `renderCognitions`
- `renderReviews`
- `openSyncSettings`
- `cloudSync`
- `bootstrap`
- `data-action`

Most interactions use delegated click handling near the end of `bootstrap()`. If adding a button, add a clear `data-action` and route it there unless local event binding is already used for that UI.

## Product Modules

The app has four main tabs:

- Countdown / 倒计时
- Check-in / 打卡
- Cognition / 认知
- Review / 复盘

The app stores user data in browser `localStorage` under these keys:

- `lop:countdowns`
- `lop:habits`
- `lop:checkins`
- `lop:cognitions`
- `lop:reviews`
- `lop:settings`
- `lop:schema_version`

Cloud sync config is stored separately:

- `lop:gist:pat`
- `lop:gist:id`
- `lop:gist:lastSyncAt`

## Cloud / Web Setup

There are two GitHub-related systems:

1. GitHub Pages
   - Hosts the app on the public web.
   - Updating app code requires committing and pushing to the GitHub repository.

2. GitHub Gist
   - Used as the app's cloud data backend.
   - The app syncs a single file named `life-of-pi.json`.
   - The user configures this in the app with PAT + Gist ID.

Token distinction:

- A `gist` token is for app data sync.
- A `public_repo` or `repo` token is for publishing code to the GitHub repository.

Do not ask the user to paste tokens into chat. If needed, use a temporary local page or terminal prompt.

## User-Facing Mental Model

Explain this project to the user this way:

- GitHub Pages = where the app lives on the internet.
- GitHub Gist = where the user's app data syncs.
- PAT/token = key that lets the app or Git write to GitHub.

The user may refer to the GitHub Pages site, the PWA, the phone app icon, Gist sync, and GitHub tokens as one thing. Clarify only as much as needed to solve the issue.

## PWA / Phone Behavior

The app can be opened from:

- Public web URL: `https://taopipi1-bit.github.io/projcet-pi/`
- PWA launch file: `https://taopipi1-bit.github.io/projcet-pi/Life_of_Pi.html`
- Local LAN server during development, such as `http://192.168.2.17:5173`

If the user's home-screen app does not show a recent change:

1. Ask them to fully close and reopen the home-screen app.
2. Ask them to open Safari directly with a cache-busting URL:

   `https://taopipi1-bit.github.io/projcet-pi/Life_of_Pi.html?v=test`

3. If Safari shows the change but the home-screen icon does not, it is a PWA/cache issue, not a failed deploy.
4. If needed, ask them to remove the home-screen icon and add it again from the public URL.

This app currently does not have a service worker file in the repository. Offline behavior is not guaranteed.

## Recent Implemented Changes

Deletion support has been added for all four modules:

- Cognition entries can be deleted.
- Review entries can be deleted.
- Countdown cards/details can be deleted.
- Check-in habits can be deleted.
- Check-in stats page habits can be deleted.

Deleting a habit also deletes its historical check-in records:

`db.checkins.save(db.checkins.list().filter(c => c.habitId !== id))`

The latest visible habit delete buttons use the `habit-delete` class to make them red and obvious.

Relevant commits:

- `5b0e2e5` - Add delete actions for cognition and reviews.
- `2c0854b` - Add delete actions for countdowns and habits.
- `5777cfb` - Make habit delete buttons visible.

## Verification Commands

Check repo state:

```sh
git status --short --branch
git log --oneline --decorate -n 5
```

Check that both HTML files are identical:

```sh
cmp -s index.html Life_of_Pi.html; printf 'html_cmp=%s\n' $?
```

Check inline JavaScript syntax:

```sh
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
fs.writeFileSync('/tmp/lop-check.js', scripts.join('\n'));
NODE
node --check /tmp/lop-check.js
```

Run local LAN server:

```sh
node serve.js
```

Local server usually prints phone URLs such as:

`http://192.168.2.17:5173`

Verify public GitHub Pages content has a recent marker:

```sh
curl -L -H 'Cache-Control: no-cache' 'https://taopipi1-bit.github.io/projcet-pi/Life_of_Pi.html?v=test' | rg 'habit-delete|deleteHabit|deleteCognition'
```

Verify raw GitHub file after push:

```sh
curl -L 'https://raw.githubusercontent.com/taopipi1-bit/projcet-pi/main/Life_of_Pi.html' | rg 'habit-delete|deleteHabit|deleteCognition'
```

## Publishing

Commit:

```sh
git add index.html Life_of_Pi.html AI_HANDOFF.md
git commit -m "Describe change"
```

Push:

```sh
git push origin main
```

If GitHub asks for credentials:

- Username: `taopipi1-bit`
- Password field requires a GitHub token, not the GitHub/Gmail password.
- For publishing, token must include `public_repo` or `repo`.

After push, GitHub Pages can lag for 30-90 seconds.

Cache-busting test URL pattern:

`https://taopipi1-bit.github.io/projcet-pi/Life_of_Pi.html?v=test`

Do not reuse or store a token that the user pasted into chat. If a token was exposed in chat, tell the user to revoke/delete it after the push succeeds.

If the user cannot use terminal prompts on phone, create a temporary local token-submission page that:

- listens only on the local machine/LAN,
- accepts the token by form POST,
- uses it once for `git push`,
- does not print the token,
- shuts down after success.

This was used successfully before.

## Sync Behavior Details

The cloud sync module is in `index.html` / `Life_of_Pi.html` under the comment:

`云同步（GitHub Gist 后端，单文件 life-of-pi.json）`

Behavior summary:

- On app boot, if PAT + Gist ID are configured, it tries to pull from Gist.
- Local writes trigger `cloudSync.markDirty()`.
- Dirty writes debounce for about 1.5 seconds, then push to Gist.
- The sync file name is `life-of-pi.json`.
- Gist sync excludes `lop:gist:*` keys so the token/config is not written into the synced data snapshot.
- If boot pull fails, automatic push is blocked to avoid overwriting cloud data incorrectly.

When adding new user data keys, update the data snapshot rules if needed.

## Data Safety

Before risky changes, recommend exporting/backing up the current Gist data or copying localStorage contents.

Avoid adding automatic destructive cleanup. The user expects visible confirmation before delete operations.

Deletion behavior currently includes confirmation dialogs:

- Countdown delete removes that countdown only.
- Cognition delete removes that cognition entry.
- Review delete removes that review entry.
- Habit delete removes the habit and its related check-in records.

## Design Notes

The product intentionally avoids pressure-heavy language:

- Do not show "today incomplete" as an alarm.
- Do not show "X days remaining" for countdowns; use "already walked X / N days".
- Do not turn mood into KPI charts.
- Reviews should not score or grade the user.
- Keep the visual style restrained and app-like.

Existing design constraints:

- White/black/gray base palette with orange accent.
- No external icon library.
- Cards, typography, and motion should stay consistent with existing CSS.
- Use clear, touch-sized controls on mobile.

## Current Known Notes

- `.DS_Store` may appear as an untracked file. Ignore it unless cleaning repository noise.
- `README.md` is currently minimal.
- `CLAUDE.md` contains useful design philosophy but has outdated project status.
- Avoid external dependencies/CDNs. This project is intended to remain a single-file HTML app.
- Use inline SVG icons only.
- Keep mobile layout safe at around 390px width.
- The latest committed branch should be `main` tracking `origin/main`.
- Check `.gitignore` before committing new generated files.
- Screenshots in the repo are visual references and should not be regenerated unless specifically needed.
