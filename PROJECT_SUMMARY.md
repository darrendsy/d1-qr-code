# Project Summary: d1-qr-code

## Overview

A Cloudflare Worker + D1 application for managing QR codes. Built with TypeScript using a raw `fetch` handler routing pattern — no framework.

## Stack

- **Runtime**: Cloudflare Workers (edge serverless)
- **Database**: Cloudflare D1 (serverless SQLite)
- **Language**: TypeScript
- **Tooling**: Wrangler 4.56, pnpm
- **Dependencies**: `uqr` (pure-JS, edge-compatible QR code SVG generator)

## Database Schema

### `qr_codes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key, user-defined slug |
| `target_url` | TEXT | Redirect destination |
| `created_at` | DATETIME | Auto or provided on create |

### `qr_scans`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Auto-increment PK |
| `qr_id` | TEXT | FK → `qr_codes.id` |
| `ip` | TEXT | Visitor IP (from CF-Connecting-IP) |
| `user_agent` | TEXT | Browser/device string |
| `referer` | TEXT | HTTP referer header |
| `country` | TEXT | From `request.cf.country` |
| `timestamp` | DATETIME | Auto-set by DB |

> **Known gap**: Only one migration file exists (`0001_create_comments_table.sql`) from the original template. The `qr_codes` and `qr_scans` tables have no migration files — they were created directly in the database. Migration files for these tables should be added.

### `comments` (unused)
Original template table. No longer referenced by any route or service.

## Route Map

| Method | Path | File | Auth | Description |
|--------|------|------|------|-------------|
| GET | `/qr/:id` | `routes/qr.ts` | Public | Redirect to `target_url`, log scan |
| GET | `/admin/login` | `routes/login.ts` | Public | Login form |
| POST | `/admin/login` | `routes/login.ts` | Public | Verify password, set session cookie |
| GET | `/admin/logout` | `routes/login.ts` | Public | Clear session cookie, redirect to login |
| GET | `/admin/manage` | `routes/manage.ts` | Protected | Management list page |
| POST | `/admin/manage/create` | `routes/manageCreate.ts` | Protected | Create a new QR code |
| GET/POST | `/admin/manage/edit/:id` | `routes/manageEdit.ts` | Protected | Edit QR code ID and/or target URL |
| POST | `/admin/manage/delete/:id` | `routes/manageDelete.ts` | Protected | Delete QR code + its scans |
| GET | `/admin/qr/:id` | `routes/admin.ts` | Protected | Per-QR analytics page |
| GET | `/admin/qr-image/:id` | `routes/qrImage.ts` | Protected | Serve QR code as SVG image |
| GET | `/admin/export/qr/:id` | `routes/exportQr.ts` | Protected | Download scan data as CSV |
| GET | `/admin/export/qrs` | `routes/exportQrs.ts` | Protected | Download all QR codes as CSV |

## File Structure

```
src/
  index.ts                 — Router/dispatcher with auth guard for /admin/*
  renderHtml.ts            — Leftover from original template (unused, safe to delete)
  routes/
    qr.ts                  — Public QR redirect + scan logging
    login.ts               — Login form, password verify, logout
    admin.ts               — Per-QR analytics page (fetches aggregated stats)
    manage.ts              — Management list
    manageCreate.ts        — Create QR
    manageEdit.ts          — Edit QR ID and target URL (renames via transaction)
    manageDelete.ts        — Delete QR + scans
    qrImage.ts             — Generate and serve QR code SVG
    exportQr.ts            — Export scans for one QR as CSV
    exportQrs.ts           — Export all QR codes as CSV
  services/
    authService.ts         — HMAC-SHA256 session tokens, cookie helpers, isAuthenticated()
    qrService.ts           — CRUD + renameQr() (transactional ID rename with scan migration)
    scanService.ts         — Scan log writes/reads + aggregation queries
  views/
    loginView.ts           — Login page HTML
    adminView.ts           — Analytics HTML (stats cards, bar trend chart, doughnut country chart)
    manageView.ts          — Management list HTML with QR thumbnails
    manageEditView.ts      — Edit form HTML (ID + target URL, inline error display)
migrations/
  0001_create_comments_table.sql  — Original template migration (unused)
```

## Key Behaviours

- **QR redirect**: `GET /qr/:id` does a `302` redirect and logs IP, UA, referer, and country.
- **Authentication**: All `/admin/*` routes (except `/admin/login` and `/admin/logout`) require a valid HMAC-SHA256 signed session cookie. Password is stored as a Wrangler secret (`ADMIN_PASSWORD`). No secret set = open (local dev).
- **Session cookie**: `HttpOnly; Secure; SameSite=Strict`, 7-day expiry. Timing-safe token comparison.
- **QR image generation**: `GET /admin/qr-image/:id` returns an SVG encoding the public scan URL (`{origin}/qr/:id`) using `uqr`. Cached 24 h. Thumbnails shown in the manage list with a download link.
- **ID rename**: Editing a QR code ID runs a transaction — inserts new row (preserving `created_at`), migrates all `qr_scans` records, deletes old row. Inline error shown if the new ID is already taken.
- **Analytics page**: Server-side DB aggregation — daily scan counts (`GROUP BY DATE(timestamp)`), country distribution, and summary stats (total, unique IPs, today). Rendered with Chart.js bar + doughnut charts and a 20-row recent scans table with truncated UA strings.
- **CSV export**: Two flows — all QR codes list, and per-QR full scan history.

## Environment / Secrets

| Name | How to set | Purpose |
|------|-----------|---------|
| `ADMIN_PASSWORD` | `npx wrangler secret put ADMIN_PASSWORD` | Admin login password. If unset, auth is skipped (dev mode). |

## Known Issues / Areas for Development

1. **Missing migrations** — `qr_codes` and `qr_scans` have no `.sql` migration files.
2. **No TypeScript types** — most functions use implicit `any` (no typed env, request, or DB row shapes).
3. **No pagination** — manage list and scan history have no pagination.
4. **`renderHtml.ts`** — dead code from the original template, can be removed.
