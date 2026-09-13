# PROMPT — MyToDoo Mobile UAT: Clean APK from `latest-ma` + Emulator Full QA

Copy everything below the line into a new Cursor agent chat **with workspace**  
`/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile`

---

## Goal

1. Work **only** on branch **`latest-ma`** in **MyToDooMobile** (this repo).
2. Prove the APK is built from **this branch’s current HEAD** (bug-fix + October UI), **not** an old July/Sep-8 APK.
3. Uninstall any old MyToDoo from emulator/device.
4. Install **only** the freshly built APK.
5. Run **full UAT QA** against `https://api.mytodoo.com/api` with screenshots.
6. Report PASS/FAIL honestly — do **not** claim 100% if something fails.

Do **not** deploy Live. Do **not** use `Mytodoo_uat_v1.3.3.apk` or any APK older than this build.

---

## Environment

| Item | Value |
|------|--------|
| Repo | `/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile` |
| Branch | `latest-ma` (must match `origin/latest-ma`) |
| UAT API | `https://api.mytodoo.com/api` |
| Build script | `./build-uat-apk.sh` (uses `.env.uat`) |
| Fresh APK output | `builds/Mytodoo_uat.apk` |
| Copy for docs | `/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts/Mytodoo_uat_FROM_LATEST_MA_<YYYY-MM-DD>.apk` |
| Screenshots | `/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts/screenshots-uat-latest-ma/` |
| Emulator AVD | `JendoTablet` |
| SDK | `$HOME/Library/Android/sdk` |
| Poster login | `uat-cf-poster@mytodoo.com` / `UatCfPoster2026!` |
| Tasker login | `uat-abn-qa@mytodoo.com` / `UatAbnQA2026!` |

---

## Step 0 — Prove you are on the right codebase

```bash
cd "/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile"
git fetch origin
git checkout latest-ma
git pull origin latest-ma
git rev-parse HEAD
git log -5 --oneline
```

**Must find these strings in this branch** (if missing, STOP and report):

```bash
rg -n "Pending Payments|Release Payment|allowsContactInChat|Review Required|isReviewRequired" \
  src app --glob '!node_modules/**' | head -40
```

Expected areas: `mytasks-screen.tsx`, `TaskCard.tsx`, `TaskActionButtons.tsx`, `task-chat.tsx` / `contentModeration.ts`, credits/referral/service listing screens.

Record `GIT_SHA=$(git rev-parse HEAD)` and stamp it into the APK filename and QA report.

---

## Step 1 — Clean rebuild APK from THIS HEAD only

```bash
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# optional: stash local WIP so build is clean from committed latest-ma
git status -sb

./build-uat-apk.sh
```

After success:

```bash
ls -lh builds/Mytodoo_uat.apk
stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" builds/Mytodoo_uat.apk
# mtime MUST be NOW (today), not Sep 8 / July

# stamp with git sha
mkdir -p "/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts"
cp builds/Mytodoo_uat.apk \
  "/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts/Mytodoo_uat_FROM_LATEST_MA_$(date +%Y-%m-%d)_${GIT_SHA:0:7}.apk"
```

If Metro fails on missing modules: restore from git history on **this branch**, commit, rebuild. Do not fall back to an old APK file.

**FORBIDDEN:** installing `builds/Mytodoo_uat_v1.3.3.apk` or any APK whose mtime is older than this rebuild.

---

## Step 2 — Emulator: wipe old app, install NEW APK only

```bash
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# start AVD if needed
adb devices
# if empty:
emulator -avd JendoTablet -netdelay none -netspeed full &
# wait until:
adb wait-for-device
adb shell getprop sys.boot_completed   # expect 1

NEW_APK="/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/builds/Mytodoo_uat.apk"

# uninstall ALL old MyToDoo packages
for p in $(adb shell pm list packages | grep -iE 'mytodo|todoo' | cut -d: -f2 | tr -d '\r'); do
  echo "UNINSTALL $p"
  adb uninstall "$p" || true
done

adb install -r "$NEW_APK"

PKG=$(adb shell pm list packages | grep -iE 'mytodo|todoo' | head -1 | cut -d: -f2 | tr -d '\r')
echo "PKG=$PKG"
adb shell dumpsys package "$PKG" | grep -E 'versionName|versionCode|lastUpdateTime|codePath'

# lastUpdateTime MUST be today / just now
```

Launch:

```bash
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1
```

---

## Step 3 — Screenshot + UI QA checklist (UAT)

Screenshots dir:

```bash
SHOT="/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts/screenshots-uat-latest-ma"
mkdir -p "$SHOT"
# helper: adb exec-out screencap -p > "$SHOT/NN-name.png"
```

### A. Session / tabs (Bug 5 + Feature 1)
| # | Check | Screenshot |
|---|--------|------------|
| A1 | Logged out: **Find / My Tasks / Coms hidden** | `01-logged-out-tabs.png` |
| A2 | Login poster succeeds (UAT API) | `02-login-poster.png` |
| A3 | After login tabs visible | `03-logged-in-tabs.png` |

### B. Profile / Phase 1–2
| # | Check | Screenshot |
|---|--------|------------|
| B1 | Badges (mobile/email/abn/stripe) | `04-badges.png` |
| B2 | Credits screen | `05-credits.png` |
| B3 | Invite friends / referral link | `06-invite.png` |
| B4 | Browse: Tasks \| Services toggle | `07-services.png` |

### C. Bugs 2–3 (Pending / Release Payment)
| # | Check | Screenshot |
|---|--------|------------|
| C1 | Tasker My Tasks has **Pending Payments** tab | `08-pending-payments-tab.png` |
| C2 | Poster My Tasks has **Release Payment** tab | `09-release-payment-tab.png` |
| C3 | Poster CTA label exactly **Release Payment** when pending_completion | `10-release-payment-cta.png` |

### D. Bug 1 + 4 (contact moderation)
| # | Check | Screenshot |
|---|--------|------------|
| D1 | Offer/question with phone/email/website → blocked warning | `11-contact-blocked.png` |
| D2 | After assign, chat **allows** phone/email | `12-chat-contact-allowed.png` |

### E. Reviews / complete UX
| # | Check | Screenshot |
|---|--------|------------|
| E1 | **Review Required** tab exists | `13-review-required.png` |
| E2 | Tasker complete → auto message ~3s (no OK) if reproducible | `14-complete-toast.png` |
| E3 | Offer form shows platform fee preview | `15-offer-fees.png` |

### F. Search / ABN
| # | Check | Screenshot |
|---|--------|------------|
| F1 | Browse filter radius default **100 km** | `16-radius-100.png` |
| F2 | ABN section loads (checksum OK; live ABR GUID may still be missing on server) | `17-abn.png` |

Also run API smoke (from backend repo if available):

```bash
API_BASE=https://api.mytodoo.com/api node "/Users/janidu/Documents/mytodoo backend/mytodo-backend/scripts/uat-october-phase1-qa.js"
```

---

## Step 4 — Write QA report

Create:

`/Users/janidu/Documents/mytodoo backend/mytodo-backend/docs/qa-artifacts/UAT-QA-Report-latest-ma.md`

Must include:
- `GIT_SHA` of MyToDooMobile `latest-ma`
- Absolute path of APK installed
- `versionName` / `lastUpdateTime` from `dumpsys`
- Table of every check: PASS / FAIL / BLOCKED + screenshot filename
- Explicit line: **Confirmed NOT using old `Mytodoo_uat_v1.3.3.apk`**

---

## Success criteria

- [ ] APK mtime = this session rebuild  
- [ ] Installed app `lastUpdateTime` = this session  
- [ ] Branch features visible in UI (Pending Payments / Release Payment / Review Required / Services / Credits)  
- [ ] Logged-out tabs hidden  
- [ ] Report written with screenshots  

If any required UI string from Step 0 is missing in the installed app → rebuild failed or wrong APK; uninstall and rebuild again. **Never** reopen an old APK to “save time.”

---

## Notes for the agent

- Package name is often `com.mytodoo.mytodoolive` even for UAT builds — identify by **install time**, not package name alone.
- UAT web (`uat.mytodoo.com`) is separate; this prompt is **mobile APK only**.
- Live API / Live APK = out of scope.
