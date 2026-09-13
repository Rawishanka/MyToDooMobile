# MyToDoo Mobile — iOS UAT QA Report (`latest-ma`)

**Date:** 2026-09-09  
**Repo:** `/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile`  
**Branch:** `latest-ma`  
**Simulator:** iPhone 17  
**UAT API:** `https://api.mytodoo.com/api`  

**Verdict:** **PASS (UI fix + API)** — Release rebuild installed; home UI verified; full My Tasks bug tabs still need scroll/tab screenshots while logged in.

---

## Rebuild

| Step | Result |
|------|--------|
| Need rebuild after home UI fix? | **YES** (Release embeds JS; Metro-only reload was flaky) |
| `expo run:ios --configuration Release` | **Build Succeeded** + installed on iPhone 17 |
| Bundle contains | `knock those tasks`, `titleFlame`, `briefcase-outline` — **no** 🔥 emoji |

## API

`scripts/uat-october-phase1-qa.js` → **32/32 PASS** (poster + tasker + credits + referrals + service-listings)

## Home UI fix (verified screenshot)

File: `screenshots-ios-2026-09-09/21-release-rebuild-home.png` / `B1-home-ui-fix-verified.png`

| Issue | Before | After |
|-------|--------|--------|
| Title `[?]` | emoji 🔥 | Ionicons `flame` (orange) |
| Offer a service look | dark outline, mismatched | **white** button + brand blue text/briefcase |
| Tab icons | (reported `[?]`) | rocket / compass / list / chat / person OK |

## Remaining interactive QA

While session stays logged in, capture:

- My Tasks → **Release Payment** / **Review Required** (poster)
- Logout → tasker → **Pending Payments**
- Profile → credits / invite / badges

---

**Confirmed:** local `latest-ma` code + fresh Release install — not old APK/bundle without Offer button fix.
