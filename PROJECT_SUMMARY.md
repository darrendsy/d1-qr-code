# Project Summary: d1-qr-code

## Overview

A Cloudflare Worker + D1 application for managing QR codes. Built with TypeScript using a raw `fetch` handler routing pattern — no framework.

## Stack

- **Runtime**: Cloudflare Workers (edge serverless)
- **Database**: Cloudflare D1 (serverless SQLite)
- **Language**: TypeScript
- **Tooling**: Wrangler 4.56, pnpm

## Database Schema

### `qr_codes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | Primary key, user-defined slug |
| `target_url` | TEXT | Redirect destination |
| `created_at` | DATETIME | Auto or provided on import |

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

| Method | Path | File | Description |
|--------|------|------|-------------|
| GET | `/qr/:id` | `routes/qr.ts` | Redirect to `target_url`, log scan |
| GET | `/admin/qr/:id` | `routes/admin.ts` | Analytics page (Chart.js) |
| GET | `/admin/manage` | `routes/manage.ts` | Management list page |
| POST | `/admin/manage/create` | `routes/manageCreate.ts` | Create a new QR code |
| GET/POST | `/admin/manage/edit/:id` | `routes/manageEdit.ts` | Edit a QR code's target URL |
| POST | `/admin/manage/delete/:id` | `routes/manageDelete.ts` | Delete QR code + its scans |
| POST | `/admin/manage/import` | `routes/manageImport.ts` | Bulk CSV import |
| GET | `/admin/export/qr/:id` | `routes/exportQr.ts` | Download scan data as CSV |
| GET | `/admin/export/qrs` | `routes/exportQrs.ts` | Download all QR codes as CSV |

## File Structure

```
src/
  index.ts               — Router/dispatcher (ordered most→least specific)
  renderHtml.ts          — Leftover from original template (unused)
  routes/
    qr.ts                — Public QR redirect + scan logging
    admin.ts             — Per-QR analytics view
    manage.ts            — Management list
    manageCreate.ts      — Create QR
    manageEdit.ts        — Edit QR target URL
    manageDelete.ts      — Delete QR + scans
    manageImport.ts      — CSV import with inline parser
    exportQr.ts          — Export scans for one QR as CSV
    exportQrs.ts         — Export all QR codes as CSV
  services/
    qrService.ts         — CRUD + bulk import (with BEGIN/COMMIT transactions)
    scanService.ts       — Scan log writes/reads + upsertQr (misplaced, used by qrService)
  views/
    adminView.ts         — Analytics HTML (Chart.js trend line + country pie chart)
    manageView.ts        — Management list HTML with inline CSV import form
    manageEditView.ts    — Edit form HTML
migrations/
  0001_create_comments_table.sql  — Original template migration (unused)
```

## Key Behaviours

- **QR redirect**: `GET /qr/:id` does a `302` redirect and asynchronously logs IP, UA, referer, and country.
- **CSV import**: Supports `skip` (preserve existing) and `replace` (upsert) conflict modes. Runs inside a manual SQLite transaction for consistency.
- **CSV export**: Two export flows — all QR codes list, and per-QR full scan history.
- **Analytics**: Chart.js (CDN) renders a scan trend line and country distribution pie chart, based on the last 50 scans.

## Known Issues / Areas for Development

1. **No authentication** — all `/admin/*` routes are fully open.
2. **Missing migrations** — `qr_codes` and `qr_scans` have no `.sql` migration files.
3. **`upsertQr` is in `scanService.ts`** — it belongs in `qrService.ts`.
4. **No TypeScript types** — most functions use implicit `any` (no typed env, request, or DB row shapes).
5. **Scan trend chart is misleading** — `trendData` is always `1` per scan; it doesn't aggregate by day/hour.
6. **CSV parser is hand-rolled** — basic, may mishandle edge cases with multiline quoted fields.
7. **`renderHtml.ts`** — dead code from the original template, can be removed.
8. **No pagination** on the manage list or scan history beyond the 50-scan limit in `getScansByQrId`.
