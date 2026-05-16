# Zlide Architecture

## 🧠 Current Status
Already deployed. Focus = stability + incremental improvement.

---

## 🧩 System Overview

Browser
→ Caddy
→ Next.js
→ PostgreSQL
→ Local Storage
→ Cleanup Job

---

## 🔁 Flow

### Upload
API → validate → save file → DB → return code

### View
/p/[code]
→ metadata API
→ file API
→ PDF.js render

### Expire
API check + cron cleanup

---

## ⚠️ Critical Rules

- PDF 不可 public 存取
- metadata API & file API 都要驗證
- 不可回傳 storagePath
- 不可暴露 manageUrl

---

## ⚖️ Trade-offs

Local storage:
✅ simple
❌ not scalable

---

## ⚠️ Risks

- cleanup failure
- disk usage
- brute force code

---

## 🎯 Post-launch Strategy

- 不重構
- 修 bug
- 強化 logging
- 小功能優先