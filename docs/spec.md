# Zlide Product Spec (Post-Launch)

## 🎯 Product Summary
Zlide 是臨時簡報存取平台：
上傳 PDF → 取得代碼 → 任意設備輸入代碼 → 開始簡報 → 自動過期

---

## 📍 Product Stage
- Prototype 已上線 ✅
- 目前重點：
  - bug fix
  - UX 優化
  - 小功能
  - 穩定性

---

## 👤 Target Users
- 商務簡報者
- 教師 / 講師
- 公用電腦使用者

---

## ⚠️ Problem
- 不想帶 USB
- 不想登入雲端
- 不想留下資料

---

## ✅ Core Flow
Upload → Code → Enter → Present → Expire

---

## ✅ Key Product Decisions

### ❗ No Management UI
不提供：
- 管理頁
- 刪除
- 檔案列表

👉 系統自動 cleanup

---

### ❗ Temporary-first
這是「通道」，不是 storage

---

## ⚙️ Config

- file_type: PDF
- max_size: 20MB
- code: 6 chars
- retention: 24h / 3d / 7d
- default: 3d

---

## ⚠️ Edge Cases
- code collision
- PDF 損毀
- 過期存取
- file missing
- cleanup 失敗

---

## ✅ Success Metrics
- 上傳成功率
- viewer 成功率
- 開啟時間
- cleanup 成功率

---

## ❓ Open Questions（給你思考）
- 是否支援 QR code？
- 是否要 analytics（不顯示 UI）
- 是否要 object storage？

---

## 🚀 Post-launch Focus
1. bug fix
2. cleanup 穩定
3. error handling
4. UX polish
5. 小功能（低風險）