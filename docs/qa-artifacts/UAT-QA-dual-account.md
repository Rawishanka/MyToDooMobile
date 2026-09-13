# UAT Dual-Account QA

- Date: 2026-09-09T08:44:38.389Z
- Platform: android
- Git SHA: eeae1465b2fb3d998da04919b0197cc09efc28ef
- API: https://api.mytodoo.com/api
- Signup: **NOT used** (OTP/SMS unreliable on UAT)
- Accounts: poster `uat-cf-poster@mytodoo.com`, tasker `uat-abn-qa@mytodoo.com`
- Screenshots: `/Users/janidu/Documents/mytodoo_mobile/MyToDooMobile/docs/qa-artifacts/screenshots-uat-dual-account`

## Summary

PASS 3 / FAIL 2 / PARTIAL 0

## Results

- **PASS** `codebase-features`: all key UAT strings present
- **PASS** `api-login-poster`: HTTP 200; user=uat-cf-poster@mytodoo.com; token=yes
- **PASS** `api-login-tasker`: HTTP 200; user=uat-abn-qa@mytodoo.com; token=yes
- **FAIL** `android-device`: no adb device online
- **FAIL** `ui-session`: Neither Android nor iOS UI session completed

## Sinhala (short)

- Signup කරන්නේ නැහැ — UAT OTP/SMS වැඩ කරන්නේ නැහැ.
- Poster + Tasker QA accounts දෙකෙන්ම login try කළා.
- Codebase එකේ Pending Payments / Release Payment / Review Required තියෙනවා.
- UI interactive QA: පහළ results වගේ. Full PASS කියන්නේ screenshots + PASS rows තහවුරු වුණාම විතරයි.
