# Category Carousel Image — Backend & Admin Panel Requirements

## Overview

The MyToDoo mobile app **Welcome Screen** shows a horizontal auto-scrolling carousel of category cards under the section **"Need something done?"**.

Today, the mobile app uses **26 hardcoded image URLs** (static PNG links). The product goal is to replace these with **admin-uploaded category images** fetched from the existing categories API — **without using video** in the carousel.

> **Important:** We previously tried **promotional videos** in this carousel. That caused app lag, freezes, and crashes on real devices because multiple native video players were required. **Images are the correct and safe approach** for this UI.

This document is for the **backend team** and **admin panel developers**. No mobile code changes are included here — this defines what the API must provide so mobile can integrate safely later.

---

## Why Images (Not Videos) for This Carousel

| Approach | Result on mobile |
|----------|------------------|
| Hardcoded `Image` URLs (current) | Stable, no crashes |
| API-driven **images** via `Image` + CDN URL | Expected to be stable (same tech as current) |
| API-driven **videos** with auto-play | Lag, freeze, crash on Android/iOS |

The carousel must remain **image-only**. Videos may stay available elsewhere in admin for future use, but **must not be required** for the Welcome Screen carousel.

---

## Mobile UI Requirements (What Backend Must Support)

### Display shape: **Square**

The mobile carousel renders each item in a **square container** (width = height):

| Device | Container size (approx.) |
|--------|---------------------------|
| Phone  | ~35% of screen width × same height |
| Tablet | ~18% of screen width × same height |

Inside the square:

- Background: light blue (`#E3F2FD`)
- Image: shown with **contain** fit (~90% of square)
- Label: category name below the square
- Border radius: 12px

### Customer requirement

> Images uploaded from admin must look correct inside a **square frame**, not landscape-only artwork that gets cropped badly.

**Recommended upload spec for admins:**

| Property | Requirement |
|----------|-------------|
| Aspect ratio | **1:1 (square)** — mandatory |
| Recommended size | **512×512 px** or **800×800 px** |
| Minimum size | **400×400 px** |
| Maximum file size | **5 MB** (suggest; videos were 100 MB — images should be much smaller) |
| Formats | **PNG**, **JPG/JPEG**, **WebP** |
| Content | Main subject centered; leave safe padding (~10%) so `contain` mode does not clip text/logos |

Landscape-only images (e.g. 1920×1080) will **not fill the square nicely** — they will appear small with large empty margins. Backend/admin should validate or warn on non-square uploads.

---

## Recommended Flow: Admin Crop → Backend Resize → Mobile Display

This is the **best approach** so image details are not lost and the mobile square frame looks correct.

### Step 1 — Admin panel: upload + **1:1 crop tool** (recommended)

Admin does **not** need to prepare a perfect square file manually. Admin panel should:

1. Admin selects any image (landscape, portrait, or square)
2. Admin panel shows a **square crop overlay** (1:1 aspect ratio locked)
3. Admin **drags/zooms** to choose which part of the image stays visible
4. On Save, admin panel exports **one cropped square image** (e.g. 800×800 px)
5. That cropped file is sent to backend via `POST /admin/categories/{id}/carousel-image`

**Why crop in admin (not only on mobile)?**

- Admin sees exactly what customers will see
- Important text/logos are not cut off unexpectedly
- Mobile app stays simple and stable (no heavy image processing on phone)

**Admin panel libraries (examples for web team):**

- `react-easy-crop`, `react-image-crop`, or similar — all support fixed 1:1 aspect ratio

### Step 2 — Backend: receive square image + optional resize

Backend receives the **already cropped square** from admin panel.

Optional but recommended server-side processing (Sharp, ImageMagick, etc.):

| Action | Purpose |
|--------|---------|
| Validate 1:1 aspect ratio | Reject or warn if not square |
| Resize to **800×800** (max) | Standard size for CDN; faster mobile load |
| Compress (JPEG quality ~85 or WebP) | Smaller file, same visual quality on phone |
| Store original + display version (optional) | Future-proof if UI size changes |

**Important:** Backend should **downscale** large uploads (e.g. 2000×2000 → 800×800). Do **not** upscale small images — that does not add real detail.

**Do not** center-crop landscape images on the server **without** admin choosing the crop area — that can cut off important content. Prefer admin crop first; server only normalizes size/format.

### Step 3 — Mobile app: display inside square frame (no crop logic needed)

Mobile loads `carouselImageUrl` and shows it in the existing square container.

Current mobile behaviour (reference: `welcome-screen.tsx`):

- Square box: phone ~35% × 35%, tablet ~18% × 18%
- Image uses `resizeMode="contain"` — **full image visible**, nothing cut off
- Image area ~90% of the square; light blue background fills gaps if any

| If admin/backend sends… | Mobile result |
|-------------------------|---------------|
| **Square 800×800** (after admin crop) | Fills frame nicely; **best result** |
| Square but small (400×400) | Still OK; may look slightly soft when scaled up |
| Landscape (not cropped) | Image appears **small** inside square with large empty margins — **avoid** |

**Future mobile option (when integrating API images):**

- Keep `contain` = safest, no surprise cropping
- Or switch to `cover` **only if** admin always uploads pre-cropped squares — fills frame edge-to-edge

**Recommendation:** Admin crop + backend 800×800 square + mobile `contain` = **no detail loss**, stable, matches customer requirement.

### End-to-end diagram

```
Admin uploads photo (any shape)
        ↓
Admin panel 1:1 crop tool (admin picks visible area)
        ↓
Cropped square file (e.g. 800×800) → POST /admin/categories/{id}/carousel-image
        ↓
Backend: validate square → resize/compress → MinIO/CDN
        ↓
GET /categories returns carouselImageUrl
        ↓
Mobile: <Image uri={carouselImageUrl} resizeMode="contain" /> in square frame
        ↓
User sees correct square category card — no crash
```

### Who does what (summary)

| Layer | Responsibility |
|-------|----------------|
| **Admin panel** | Crop to 1:1; preview square frame before upload |
| **Backend** | Store CDN URL; optional resize to 800×800; validate format/size |
| **Mobile app** | Display URL in existing square UI; no video; no on-device crop required |

---

## Proposed Data Model (Category Document)

Add fields on the **Category** MongoDB document (mirroring the existing video fields pattern):

```javascript
{
  "_id": "64abc123",
  "name": "Carpentry",
  "count": 12,
  "locationType": "In-person",
  "order": 5,

  // NEW — Welcome Screen carousel image (square promotional image)
  "carouselImageUrl": "https://minio.mytodoo.com/mytodo-uploads/mytodo/public/category-carousel-images/carousel-64abc123-1716123456789.png",
  "carouselImageFileName": "carpentry_carousel.png",
  "carouselImageUploadedAt": "2026-06-06T10:00:00.000Z",

  // Existing video fields (optional — do NOT use for Welcome carousel)
  "videoUrl": "...",
  "videoFileName": "...",
  "videoUploadedAt": "..."
}
```

### Alternative: reuse `iconUrl`

The mobile `Category` type already includes optional `iconUrl`. If backend prefers not to add new fields:

- `iconUrl` could serve as the carousel image URL **only if** admin uploads are square and intended for this carousel.

**Recommendation:** Use a dedicated `carouselImageUrl` field to avoid confusion with small list icons used elsewhere.

---

## Required API Endpoints

### 1. Upload carousel image (Admin only)

**`POST /admin/categories/{id}/carousel-image`**

Uploads a square promotional image for the Welcome Screen carousel. Stores file on MinIO/CDN and saves the public URL on the category document. Replaces any previously uploaded carousel image.

**Authentication:** Admin Bearer token required

**Path parameter:**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Category MongoDB `_id` |

**Request body:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | binary | Yes | Image file (png, jpg, jpeg, webp). Max 5 MB suggested |

**Success — 200:**

```json
{
  "success": true,
  "message": "Category carousel image uploaded successfully",
  "data": {
    "_id": "64abc123",
    "name": "Carpentry",
    "carouselImageUrl": "https://minio.mytodoo.com/mytodo-uploads/mytodo/public/category-carousel-images/carousel-64abc123-1716123456789.png",
    "carouselImageFileName": "carpentry_carousel.png",
    "carouselImageUploadedAt": "2026-06-06T10:00:00.000Z"
  }
}
```

**Errors:**

| Code | Message example |
|------|-----------------|
| 400 | No file / invalid type / size exceeded / aspect ratio not square (optional validation) |
| 401 | Not authorized, token required |
| 404 | Category not found |
| 500 | Server error |

---

### 2. Remove carousel image (Admin only)

**`DELETE /admin/categories/{id}/carousel-image`**

Deletes the image from MinIO/CDN and clears carousel image fields on the category document.

**Authentication:** Admin Bearer token required

**Success — 200:**

```json
{
  "success": true,
  "message": "Category carousel image removed successfully"
}
```

**Errors:**

| Code | Message example |
|------|-----------------|
| 400 | No carousel image uploaded for this category |
| 401 | Not authorized |
| 404 | Category not found |

---

### 3. Get categories (Mobile — existing endpoint)

**`GET /categories`**

Must include `carouselImageUrl` (and optionally `carouselImageFileName`, `carouselImageUploadedAt`) for each category that has an admin-uploaded image.

**Authentication:** As currently implemented (public or authenticated — keep existing behaviour)

**Example response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123",
      "name": "Carpentry",
      "count": 12,
      "locationType": "In-person",
      "order": 5,
      "carouselImageUrl": "https://minio.mytodoo.com/mytodo-uploads/mytodo/public/category-carousel-images/carousel-64abc123-1716123456789.png",
      "carouselImageFileName": "carpentry_carousel.png",
      "carouselImageUploadedAt": "2026-06-06T10:00:00.000Z"
    },
    {
      "_id": "64def456",
      "name": "Plumbing",
      "count": 8,
      "carouselImageUrl": null
    }
  ],
  "total": 2
}
```

**Mobile filtering rule (for future integration):**

- Show in carousel **only** categories where `carouselImageUrl` is a non-empty string
- Categories without an uploaded image are **skipped** (no crash, no empty card)
- Order: use existing `order` field if present, else alphabetical by `name`

---

## CDN / Storage Requirements

Follow the same pattern as category video uploads:

1. Upload to MinIO bucket (e.g. `mytodo-uploads`)
2. Store under a public path, e.g. `mytodo/public/category-carousel-images/`
3. Return a **public HTTPS URL** in `carouselImageUrl`
4. URL must be accessible from mobile devices without extra auth headers
5. On replace/delete: remove old file from storage to avoid orphans

**CORS:** Ensure CDN/MinIO allows mobile app to fetch images (same as existing task/profile images).

---

## Admin Panel UI Requirements

For each category in admin:

1. **Upload carousel image** button → calls `POST /admin/categories/{id}/carousel-image`
2. **Preview** — show image in a **square crop preview** (1:1) so admin sees what mobile will look like
3. **Remove image** button → calls `DELETE /admin/categories/{id}/carousel-image`
4. **Validation messages:**
   - "Image must be square (1:1 aspect ratio)"
   - "Recommended size: 512×512 or 800×800 pixels"
   - "Max file size: 5 MB"
5. Optional: client-side crop tool forcing 1:1 before upload

**Do not** require a video upload for the Welcome Screen carousel.

---

## Mobile Integration Plan (Future — Not in This Task)

When backend is ready, mobile will:

1. Call existing `GET /categories`
2. Filter: `carouselImageUrl` present and non-empty
3. Render with React Native `<Image source={{ uri: carouselImageUrl }} />` — **same as current hardcoded carousel**
4. Keep square container styles unchanged
5. **No video players** in the carousel
6. Tap on card → navigate to create task with category pre-selected (same as today)

Estimated mobile change: small, low risk (replace hardcoded array with API-filtered list).

---

## Why This Will Not Crash the App

Verified against current mobile codebase behaviour:

1. **Current production carousel uses `<Image>` only** — hardcoded URLs, stable on UAT/Live APKs
2. **Replacing hardcoded URL with API URL uses the identical component** — no new native modules
3. **No `expo-video` / `react-native-video` in carousel** — avoids the crash root cause from the video experiment
4. **FlatList already limits rendered items** — performance pattern unchanged
5. **Missing image URL** → category omitted from list; optional fallback icon (existing error handling pattern)

**Confidence:** Image-based carousel from CDN is **low risk**. Video-based carousel was **high risk** and has been reverted on mobile.

---

## Testing Checklist (Backend + Admin)

- [ ] Upload square PNG → `carouselImageUrl` saved and returned in `GET /categories`
- [ ] Upload JPG/WebP → accepted
- [ ] Re-upload replaces old file and updates URL/timestamp
- [ ] Delete clears fields and removes file from MinIO
- [ ] Category without image → `carouselImageUrl` null/ absent (no error)
- [ ] Public URL opens in browser and returns 200
- [ ] Non-admin token → 401 on upload/delete
- [ ] Invalid category id → 404
- [ ] File too large / wrong type → 400 with clear message
- [ ] (Optional) Non-square image → warning or 400

---

## Environment URLs

| Environment | API base (mobile) |
|-------------|-------------------|
| UAT         | `https://api.mytodoo.com/api` |
| Live        | `https://au-live-api.mytodoo.com/api` |

Admin endpoints use the same API host with `/admin/...` prefix and admin authentication.

---

## Summary for Backend Team

| Item | Decision |
|------|----------|
| Media type for Welcome carousel | **Image only** (not video) |
| New field | `carouselImageUrl` (+ optional fileName, uploadedAt) |
| Upload endpoint | `POST /admin/categories/{id}/carousel-image` |
| Delete endpoint | `DELETE /admin/categories/{id}/carousel-image` |
| Mobile read | Existing `GET /categories` — include new fields |
| Image shape | **Square 1:1** (512×512 or 800×800 recommended) |
| Crash risk on mobile | **Low** (same as current image carousel) |

---

## Contact / Handoff

- **Mobile repo:** `MyToDooMobile`
- **Welcome screen file (reference):** `src/features/dashboard/screens/welcome-screen.tsx`
- **Categories API types (reference):** `src/api/categories-api.ts`
- **This document:** share with backend developer as the single source of truth for admin carousel images

Once backend deploys to UAT and sample categories have `carouselImageUrl` populated, notify the mobile team to switch from hardcoded images to API-driven images.
