# Zlide Product Strategy

> 文件名稱：`product-strategy.md`
> 性質：產品策略文件（活文件，隨策略演進持續更新）
> 最後更新：2026-05

---

## 1. MTP（Massive Transformative Purpose）

```
讓每一場簡報，都能在任何設備上立即開始。
```

英文版：

```
No USB. No login. Just present.
```

### MTP 的意義

Zlide 存在的理由，是現有工具預設了你有帳號、有自己的設備、願意留下痕跡。Zlide 不做這個預設。

Zlide 的真實競爭對手不是 Google Slides 或 Canva，而是：

- USB 隨身碟（USB 病毒、設備故障、忘記帶）
- 在別人的電腦登入 Google Drive / OneDrive（帳號留存、隱私風險、耗時）
- 用 LINE / Email 傳檔給自己（不穩定、格式跑版）
- AirDrop / 藍牙傳輸（連線失敗、速度慢）

Zlide 解決的是**簡報的最後一哩路**，不是簡報的製作工具。

### MTP 決策測試

當團隊面對功能決策，用這個問題判斷：

> 這個功能讓每一場簡報更容易在任何設備上立即開始嗎？

如果答案是「不確定」，這個功能可能不屬於 Zlide。

---

## 2. 產品定位

Zlide 是**簡報最後一哩路的基礎設施**。

它不是：
- 雲端硬碟（不是 Google Drive、Dropbox）
- 簡報製作工具（不是 Canva、Google Slides、Pitch）
- 檔案管理平台（沒有檔案列表、沒有資料夾、沒有刪除 UI）

它是：
- 一個讓講者在任何設備上立即開始簡報的通道
- 一個對公用設備友善的存取機制
- 一個用完即走、不留痕跡的工具

### 「消失」是核心承諾，不只是技術實作

目前「到期自動刪除」是為了降低儲存成本，但它同時也是一個對用戶的承諾：

```
你走了，Zlide 不會在這台電腦留下任何東西。
```

這個承諾在公用設備場景（教室、會議室、活動現場）裡具有強烈說服力。未來可發展為隱私優先的差異化定位。

---

## 3. 目標用戶與核心場景

### 主要用戶

**講者（上傳方）**：在自己的設備上傳 PDF，取得簡報代碼，到現場輸入代碼開始簡報。

### 核心場景（優先順序）

| 場景 | 說明 |
|---|---|
| 教室 | 老師在教室電腦開啟簡報，不想登入私人帳號 |
| 會議室 | 講者用會議室共用設備，快速進入簡報狀態 |
| 演講 / 活動現場 | 主辦方提供設備，講者不需要提前傳檔 |

### 設計原則：輸入代碼優先

首頁的視覺層級是「輸入代碼」在上、「上傳 PDF」在下。這是刻意設計：

```
講者上台 → 拿出手機看代碼 → 輸入代碼 → 立即開始簡報
```

上傳是事前準備，輸入代碼是現場最高頻的動作。

---

## 4. 產品原則

### 絕對不做

這些方向會把 Zlide 變成另一個雲端平台，違反產品定位：

- 使用者可見的管理頁 / 檔案列表
- 手動刪除 UI
- 帳號 / 會員系統（Prototype 階段）
- Dashboard
- 觀看次數 UI
- 協作功能

### 平台化的正確方向

```
✅ 場景的深度（在教室、會議室場景做到極致）
❌ 功能的廣度（加入越來越多功能，變成平台）
```

Zlide 的護城河是：**在特定場景裡，沒有工具比它更好用、更快、更無摩擦。**

---

## 5. 平台化路徑

Zlide 的長期目標是成為平台，但平台化路徑是**場景深度優先**：

```
Phase 1：PDF 簡報，核心流程跑通（現在）
Phase 2：更多格式支援（HTML、PPTX、Keynote）
Phase 3：場景化功能（教室模式、會議室模式）
Phase 4：機構採購（學校、企業會議室標配）
Phase 5：硬體整合（會議室設備內建 Zlide）
```

每個 Phase 的判斷標準：**這個 Phase 是否讓特定場景的使用者體驗產生質變？**

---

## 6. 市場策略

### 6.1 中文市場（當前）

目標語言：繁體中文
主要場景：台灣教育與企業市場

核心文案方向：
```
不用 USB，不用登入雲端帳號。
輸入代碼，在任何電腦立即開始簡報。
```

### 6.2 英文市場（下一階段）

目標語言：英文
主要場景：國際教育（classroom）、企業會議室（conference room）、演講活動（event presentation）

核心文案方向：
```
No USB. No login. Just present.
```

英文用戶的語境與中文不同，文案不是翻譯，而是重新針對痛點描述：

```
Forgot your USB? Don't want to log into Google Drive on someone else's computer?
Upload your PDF, get a code, and start presenting on any device.
```

### 6.3 i18n 架構建議

進入英文市場前需要決定路由策略：

```
zlide.app/        → 中文（或根據 Accept-Language 自動判斷）
zlide.app/en/     → 英文
```

---

## 7. 文案指引

### 品牌語氣

- 直接、具體、有畫面
- 不用技術術語（不說「臨時簡報存取工具」）
- 強調「不需要做什麼」比「可以做什麼」更有力

### 對外溝通用詞

| 避免 | 改用 |
|---|---|
| 臨時簡報 | 任何設備都能開啟的簡報 |
| 臨時存取工具 | 簡報通道 |
| 指定期限後自動刪除 | 到期自動刪除，不留痕跡 |
| 雲端硬碟 | 雲端帳號 |

「不留痕跡」比「自動刪除」更能傳達隱私承諾。

### Metadata 規範（繁體中文版）

```typescript
title: "Zlide - 到任何電腦，立即開始簡報"
description: "不用 USB，不用登入 Google Drive。上傳 PDF 取得簡報代碼，在教室、會議室、任何電腦輸入代碼即可開講。檔案到期自動刪除，不留痕跡。"
```

### Metadata 規範（英文版）

```typescript
title: "Zlide - Present on Any Computer, Instantly"
description: "No USB, no Google Drive login. Upload your PDF, get a 6-character code, and start presenting on any computer — in a classroom, meeting room, or anywhere. Files are automatically deleted after expiry. No trace left behind."
```

### Keywords 策略

中文重點 keywords：
```
簡報代碼、會議室簡報、教室簡報、公用電腦簡報、無需登入簡報、不用 USB
```

英文重點 keywords：
```
presentation code、present on any computer、no USB presentation、
share presentation without login、present without Google Drive、
classroom presentation tool、meeting room presentation
```

避免使用的 keywords：
- `線上簡報`（競爭過強，Zlide 定位不符）
- `臨時簡報`（搜尋量低，用戶不會這樣搜尋）

---

## 8. 開放問題

以下問題尚未決策，需要在下一個策略週期討論：

1. **英文市場時間點**：Beta 結束後立即進入，還是等核心流程更穩定？
2. **英文市場場景優先級**：教育（classroom）、企業（conference room）、演講活動（event presentation）哪個先？
3. **i18n 路由**：`zlide.app/en` 還是獨立英文域名（例如 `zlide.io`）？
4. **「消失」的隱私定位**：何時從技術實作升級為核心行銷訴求？需要什麼條件（例如端對端加密）？
5. **機構採購路徑**：何時開始接觸學校或企業採購決策者？
6. **格式擴展**：HTML / PPTX / Keynote 支援的優先級與時間點？

---

## 9. 文件關係

| 文件 | 性質 | 讀者 |
|---|---|---|
| `product-strategy.md`（本文件） | 產品策略，活文件 | 產品決策者 |
| `prototype-plan.md` | 技術建造指南 | 開發者、AI coding assistant |

`prototype-plan.md` 在 Prototype 階段結束後可封存。`product-strategy.md` 隨產品長期維護。

---

*本文件根據 2026-05 產品策略討論整理，下次更新時請同步修訂版本日期。*