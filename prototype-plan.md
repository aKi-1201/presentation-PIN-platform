***

# 簡報網站 Prototype 開發規畫與進度期程

## 1. 專案概述

### 1.1 專案名稱

暫定：

```text
簡報 PIN 平台
Presentation PIN Platform
```

### 1.2 產品目的

建立一個讓使用者可以快速上傳 PDF 簡報，取得一組短碼，並在其他裝置上輸入短碼即可開始簡報的平台。

主要解決：

*   不想攜帶 USB
*   不想在公用電腦登入雲端硬碟、Canva、Google Drive、OneDrive
*   不想把私人帳號留在公用電腦
*   希望簡報檔能短期暫存、自動刪除
*   希望在會議室、教室、活動現場快速開啟簡報

***

## 2. Prototype 目標

Prototype 階段的目標不是建立完整商業平台，而是驗證核心使用流程是否成立。

### 2.1 核心驗證流程

```text
使用者上傳 PDF
→ 系統產生短碼
→ 使用者在另一台電腦輸入短碼
→ 開啟簡報
→ 使用 PDF viewer 簡報
→ 到期後自動失效或刪除
```

### 2.2 Prototype 要回答的問題

*   使用者是否覺得「上傳 PDF → 輸入短碼簡報」足夠方便？
*   6 位英數短碼是否好記、好輸入？
*   PDF viewer 是否足以支援基本簡報需求？
*   使用者是否信任「短期保存、自動刪除」的設計？
*   不登入的操作流程是否符合產品定位？
*   Oracle Cloud A1 VM 是否足以支撐 prototype 運作？

***

## 3. Prototype 功能範圍

## 3.1 本階段要做的功能

### 上傳端

*   PDF 上傳
*   檔案格式驗證
*   檔案大小限制
*   選擇保存期限
*   產生 6 位英數短碼
*   產生觀看網址
*   產生管理刪除連結

### 簡報端

*   首頁輸入短碼
*   透過 `/p/[code]` 開啟簡報
*   PDF.js 顯示 PDF
*   單頁簡報模式
*   上一頁 / 下一頁
*   鍵盤切頁
*   全螢幕模式
*   頁碼顯示

### 管理端

*   透過管理連結查看簡報資訊
*   手動刪除簡報
*   刪除後短碼立即失效

### 系統端

*   到期後拒絕存取
*   定期清除過期 PDF
*   基本 rate limit
*   HTTPS
*   PDF 私有儲存
*   noindex / nofollow
*   模糊化錯誤訊息

***

## 3.2 本階段不做的功能

Prototype 階段先排除：

*   會員登入
*   付款系統
*   簡報歷史列表
*   PPT / PPTX 轉 PDF
*   AI 摘要
*   簡報筆記
*   團隊管理
*   權限群組
*   防截圖 / DRM
*   多人同步簡報
*   自訂網域
*   長期保存
*   搜尋簡報
*   複雜後台管理系統

***

# 4. 核心產品決策

## 4.1 檔案格式

```yaml
支援格式: PDF only
```

Prototype 只支援 PDF，不支援 PPT、PPTX、圖片或影片。

***

## 4.2 檔案大小限制

建議初始設定：

```yaml
max_file_size: 20MB
```

之後如果測試順利，可再提高到：

```yaml
max_file_size: 50MB
```

***

## 4.3 短碼格式

```yaml
code_length: 6
code_type: 英數混合
```

使用者看到的短碼範例：

```text
K7P9Q2
D8MXA7
Q3R7NP
```

***

## 4.4 短碼字元集

避免容易混淆的字元。

```text
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```

排除：

```text
0 O
1 I L
```

***

## 4.5 保存期限

Prototype 提供：

```yaml
retention_options:
  - 1 小時
  - 24 小時
  - 3 天
  - 7 天

default_retention: 7 天
```

***

## 4.6 登入策略

Prototype 階段：

```yaml
login_required: false
```

不做會員登入。

改用：

```text
觀看短碼 + 管理刪除連結
```

***

# 5. 技術架構

## 5.1 建議架構

```text
[使用者瀏覽器]
        |
        v
[網域 + HTTPS]
        |
        v
[Caddy Reverse Proxy]
        |
        v
[Next.js Application]
        |
        +--> [PostgreSQL Database]
        |
        +--> [Local Private PDF Storage]
        |
        +--> [Cleanup Cron Job]
```

***

## 5.2 部署環境

```yaml
cloud_provider: Oracle Cloud
machine: VM.Standard.A1.Flex 2 OCPU / 12GB
os: Ubuntu
container_runtime: Docker
orchestration: Docker Compose
reverse_proxy: Caddy
https: Caddy Auto TLS
```

***

## 5.3 應用程式技術

```yaml
frontend:
  framework: Next.js
  language: TypeScript
  styling: Tailwind CSS
  pdf_viewer: PDF.js

backend:
  framework: Next.js API Routes
  runtime: Node.js
  validation: Zod
  orm: Prisma

database:
  type: PostgreSQL

storage:
  type: local private filesystem
  path: /opt/presentation-site/data/uploads
```

***

# 6. 系統目錄規劃

Oracle A1 VM 上建議目錄：

```text
/opt/presentation-site
├── app
│   └── Next.js application
├── data
│   ├── uploads
│   │   └── private PDF files
│   └── postgres
│       └── PostgreSQL data
├── logs
├── backups
├── docker-compose.yml
├── Caddyfile
└── scripts
    └── cleanup-expired.ts
```

***

# 7. 頁面規劃

## 7.1 首頁 `/`

### 功能

*   上傳 PDF
*   選擇保存期限
*   輸入簡報短碼
*   進入簡報

### UI 概念

```text
--------------------------------

上傳你的 PDF 簡報
[ 選擇檔案 ] [ 保存期限 ] [ 上傳 ]

或

輸入簡報代碼
[ K7P9Q2 ] [ 開始簡報 ]

--------------------------------
不用 USB，不用登入雲端硬碟。
上傳 PDF，取得代碼，到任何電腦輸入代碼即可簡報。

檔案將於指定期限後自動刪除。
請勿上傳高度機密或敏感文件。
--------------------------------
```

***

## 7.2 上傳成功頁 `/upload/success`

### 顯示內容

```text
你的簡報已準備好

簡報代碼：
K7P9Q2

觀看連結：
/p/K7P9Q2

管理連結：
/manage/{management-token}

到期時間：
2026-05-17 00:00
```

### 按鈕

*   複製簡報代碼
*   複製觀看連結
*   開啟簡報
*   前往管理頁

***

## 7.3 簡報頁 `/p/[code]`

### 功能

*   驗證短碼
*   檢查是否過期
*   檢查狀態是否 active
*   載入 PDF
*   顯示 PDF viewer

### Viewer 功能

*   上一頁
*   下一頁
*   頁碼顯示
*   全螢幕
*   鍵盤操作

### 鍵盤規則

```text
ArrowRight: 下一頁
Space: 下一頁
ArrowLeft: 上一頁
F: 全螢幕
Esc: 離開全螢幕
```

***

## 7.4 管理頁 `/manage/[token]`

### 功能

*   顯示原始檔名
*   顯示到期時間
*   顯示目前狀態
*   顯示觀看次數
*   手動刪除簡報

### 刪除後顯示

```text
此簡報已刪除，原簡報代碼已失效。
```

***

# 8. API 規劃

## 8.1 上傳簡報

```http
POST /api/presentations
Content-Type: multipart/form-data
```

### Request

```text
file: PDF
retention: 1h | 24h | 3d | 7d
```

### Response

```json
{
  "code": "K7P9Q2",
  "viewUrl": "/p/K7P9Q2",
  "manageUrl": "/manage/long-random-token",
  "expiresAt": "2026-05-17T00:00:00+08:00"
}
```

***

## 8.2 查詢簡報

```http
GET /api/presentations/[code]
```

### 成功 Response

```json
{
  "code": "K7P9Q2",
  "fileName": "demo.pdf",
  "expiresAt": "2026-05-17T00:00:00+08:00",
  "status": "active"
}
```

### 失敗 Response

```json
{
  "error": "代碼無效或已過期"
}
```

***

## 8.3 取得 PDF

```http
GET /api/presentations/[code]/file
```

### 行為

後端檢查：

```text
code 是否存在
status 是否 active
expires_at 是否尚未過期
檔案是否存在
```

通過後才 stream PDF。

***

## 8.4 刪除簡報

```http
DELETE /api/manage/[token]
```

### 行為

```text
驗證 management token
刪除 PDF 檔案
更新 status = deleted
寫入 deleted_at
```

### Response

```json
{
  "status": "deleted"
}
```

***

# 9. 資料庫設計

## 9.1 presentations table

```sql
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  public_code TEXT NOT NULL UNIQUE,
  management_token_hash TEXT NOT NULL,

  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,

  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'active',

  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,

  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_presentations_public_code
ON presentations (public_code);

CREATE INDEX idx_presentations_expires_at
ON presentations (expires_at);

CREATE INDEX idx_presentations_status
ON presentations (status);
```

***

## 9.2 狀態定義

```yaml
status:
  active: 可存取
  deleted: 已刪除
  expired: 已過期
```

Prototype 可只使用：

```text
active
deleted
```

過期可透過 `expires_at < now()` 判斷。

***

# 10. 安全設計

## 10.1 HTTPS

必須啟用 HTTPS。

建議使用：

```text
Caddy Auto TLS
```

***

## 10.2 PDF 私有儲存

PDF 不放在：

```text
public/uploads
```

PDF 應放在：

```text
/opt/presentation-site/data/uploads
```

並只能透過後端 API 讀取。

***

## 10.3 檔案驗證

後端必須驗證：

```text
副檔名是否為 .pdf
MIME type 是否為 application/pdf
檔案開頭 magic bytes 是否為 %PDF
檔案大小是否未超過限制
```

***

## 10.4 Rate Limit

建議規則：

```yaml
upload:
  limit: 每個 IP 限制上傳頻率

code_lookup:
  limit: 每個 IP 限制短碼查詢頻率

file_access:
  limit: 每個 IP 限制 PDF 讀取頻率
```

Prototype 建議先實作簡單版本即可。

***

## 10.5 錯誤訊息模糊化

不要回傳：

```text
這個代碼存在但已過期
```

應統一回傳：

```text
代碼無效或已過期
```

避免攻擊者推測哪些短碼曾經存在。

***

## 10.6 搜尋引擎索引

簡報頁與管理頁加入：



***

## 10.7 管理 Token

管理連結使用長隨機 token。

資料庫不存明文 token，只存 hash。

```text
management_token_hash
```

***

# 11. 到期與刪除機制

## 11.1 讀取時檢查

每次查詢或讀取 PDF 都檢查：

```text
status = active
expires_at > now()
```

若過期：

```text
拒絕存取
回傳：代碼無效或已過期
```

***

## 11.2 定期清理

使用 cron job 執行 cleanup script。

### Cleanup 流程

```text
1. 查詢 expires_at < now() 且 status = active 的資料
2. 刪除 storage_path 對應 PDF
3. 更新 status = deleted
4. 寫入 deleted_at
```

***

# 12. 開發進度期程

以下用「階段式里程碑」規劃。每一階段都包含目標、任務、完成條件與相依關係。

***

## Phase 0：專案初始化與基礎設施

### 目標

建立可開發、可部署、可連線的基礎環境。

### 任務清單

#### Repository

*   [ ] 建立 Git repository
*   [ ] 建立 README
*   [ ] 建立 docs 目錄
*   [ ] 建立 `.env.example`
*   [ ] 建立基本 branch flow

#### Oracle VM

*   [ ] 確認 Oracle A1 VM 可 SSH 登入
*   [ ] 設定 SSH key 登入
*   [ ] 關閉密碼登入
*   [ ] 開啟必要 port：80、443、22
*   [ ] 確認 PostgreSQL 不對外開放

#### Docker

*   [ ] 安裝 Docker
*   [ ] 安裝 Docker Compose
*   [ ] 建立 `docker-compose.yml`

#### Caddy

*   [ ] 建立 `Caddyfile`
*   [ ] 設定 reverse proxy
*   [ ] 設定 HTTPS
*   [ ] DNS 指向 VM

#### PostgreSQL

*   [ ] 建立 PostgreSQL container
*   [ ] 建立 database
*   [ ] 建立 app user
*   [ ] 測試 Next.js 可連線 DB

### 完成條件

```text
可以透過 HTTPS 開啟網站首頁
Next.js app 可正常啟動
PostgreSQL 可正常連線
```

### 相依關係

無。這是第一階段。

***

## Phase 1：資料模型與基礎後端

### 目標

完成資料庫 schema、Prisma 設定與基礎 API 架構。

### 任務清單

#### Prisma / DB

*   [ ] 安裝 Prisma
*   [ ] 建立 Prisma schema
*   [ ] 定義 Presentation model
*   [ ] 建立 migration
*   [ ] 執行 migration
*   [ ] 建立資料庫 index

#### Backend 基礎

*   [ ] 建立 API route 結構
*   [ ] 建立共用錯誤處理
*   [ ] 建立環境變數讀取
*   [ ] 建立 upload directory 檢查工具
*   [ ] 建立 hash utility
*   [ ] 建立 code generator
*   [ ] 建立 token generator

### 完成條件

```text
資料庫有 presentations table
API 能成功連線資料庫
短碼產生器可正常產生唯一短碼
```

### 相依關係

需完成 Phase 0。

***

## Phase 2：PDF 上傳與短碼產生

### 目標

完成第一條核心流程：

```text
上傳 PDF → 儲存檔案 → 建立資料 → 回傳短碼
```

### 任務清單

#### Frontend

*   [ ] 建立首頁上傳表單
*   [ ] 建立保存期限選單
*   [ ] 顯示上傳進度
*   [ ] 顯示錯誤訊息
*   [ ] 建立上傳成功頁

#### Backend

*   [ ] 建立 `POST /api/presentations`
*   [ ] 驗證檔案是否存在
*   [ ] 驗證副檔名
*   [ ] 驗證 MIME type
*   [ ] 驗證 magic bytes `%PDF`
*   [ ] 驗證檔案大小
*   [ ] 產生 public code
*   [ ] 產生 management token
*   [ ] hash management token
*   [ ] 儲存 PDF 到 private uploads folder
*   [ ] 建立 presentations record
*   [ ] 回傳 code、viewUrl、manageUrl、expiresAt

### 完成條件

```text
使用者可以上傳 PDF
系統會產生 6 位英數短碼
使用者可以看到觀看連結與管理連結
PDF 檔案成功存入 private folder
```

### 相依關係

需完成 Phase 1。

***

## Phase 3：短碼查詢與簡報開啟

### 目標

完成第二條核心流程：

```text
輸入短碼 → 查詢簡報 → 開啟 PDF
```

### 任務清單

#### Frontend

*   [ ] 首頁加入短碼輸入框
*   [ ] 輸入後導向 `/p/[code]`
*   [ ] 建立 `/p/[code]` 頁面
*   [ ] 顯示 loading 狀態
*   [ ] 顯示錯誤狀態

#### Backend

*   [ ] 建立 `GET /api/presentations/[code]`
*   [ ] 查詢 public\_code
*   [ ] 檢查 status
*   [ ] 檢查 expires\_at
*   [ ] 回傳簡報 metadata
*   [ ] 建立 `GET /api/presentations/[code]/file`
*   [ ] 驗證 code
*   [ ] stream PDF
*   [ ] 更新 view\_count
*   [ ] 更新 last\_viewed\_at

### 完成條件

```text
使用者可在另一台裝置輸入短碼
有效短碼可開啟簡報
無效或過期短碼會顯示錯誤
PDF 不可透過公開網址直接讀取
```

### 相依關係

需完成 Phase 2。

***

## Phase 4：PDF Viewer 與簡報模式

### 目標

讓平台不只是能看 PDF，而是能實際簡報。

### 任務清單

#### PDF.js

*   [ ] 整合 PDF.js
*   [ ] 載入 PDF 檔案
*   [ ] 顯示單頁
*   [ ] 取得總頁數
*   [ ] 管理目前頁碼

#### 簡報操作

*   [ ] 上一頁
*   [ ] 下一頁
*   [ ] 頁碼顯示
*   [ ] 鍵盤左右鍵切頁
*   [ ] Space 下一頁
*   [ ] 全螢幕按鈕
*   [ ] F 進入全螢幕
*   [ ] Esc 離開全螢幕
*   [ ] 基本 RWD

### 完成條件

```text
簡報頁可正常顯示 PDF
可使用按鈕切頁
可使用鍵盤切頁
可進入全螢幕簡報模式
```

### 相依關係

需完成 Phase 3。

***

## Phase 5：管理連結與手動刪除

### 目標

讓上傳者可以不用登入，也能刪除自己的簡報。

### 任務清單

#### Frontend

*   [ ] 建立 `/manage/[token]` 頁面
*   [ ] 顯示簡報資訊
*   [ ] 顯示到期時間
*   [ ] 顯示目前狀態
*   [ ] 顯示刪除按鈕
*   [ ] 刪除前確認

#### Backend

*   [ ] 建立 `GET /api/manage/[token]`
*   [ ] hash token 後查詢
*   [ ] 建立 `DELETE /api/manage/[token]`
*   [ ] 刪除 PDF 檔案
*   [ ] 更新 status = deleted
*   [ ] 寫入 deleted\_at
*   [ ] 刪除後讓短碼失效

### 完成條件

```text
使用者可透過管理連結刪除簡報
刪除後原短碼無法再開啟
PDF 檔案從 private folder 移除
```

### 相依關係

需完成 Phase 2，可與 Phase 4 部分並行。

***

## Phase 6：過期清理機制

### 目標

建立產品信任基礎：

```text
檔案會到期失效，並被清除
```

### 任務清單

#### Cleanup Script

*   [ ] 建立 `cleanup-expired` script
*   [ ] 查詢過期 active presentations
*   [ ] 刪除 PDF 檔案
*   [ ] 更新 status = deleted
*   [ ] 寫入 deleted\_at
*   [ ] 記錄 cleanup log

#### Cron

*   [ ] 在 VM 設定 cron
*   [ ] 確認 cron 可執行 script
*   [ ] 確認錯誤會寫入 log

#### Read-time Guard

*   [ ] 查詢簡報時檢查 expires\_at
*   [ ] 讀取 PDF 時檢查 expires\_at
*   [ ] 過期後統一顯示「代碼無效或已過期」

### 完成條件

```text
過期簡報無法被開啟
過期 PDF 會被清除
清理流程有 log 可檢查
```

### 相依關係

需完成 Phase 3。

***

## Phase 7：基本安全與防濫用

### 目標

避免 prototype 太容易被掃碼、濫用或上傳錯誤檔案。

### 任務清單

#### Rate Limit

*   [ ] 對上傳 API 加 rate limit
*   [ ] 對短碼查詢 API 加 rate limit
*   [ ] 對 PDF file API 加 rate limit
*   [ ] 超過限制時回傳合理錯誤

#### Security Headers

*   [ ] 設定基本 security headers
*   [ ] 設定 noindex / nofollow
*   [ ] 避免錯誤訊息暴露內部資訊

#### Upload Protection

*   [ ] 強化 PDF 檢查
*   [ ] 阻擋空檔案
*   [ ] 阻擋超過大小限制檔案
*   [ ] 阻擋非 PDF 檔案

#### Logging

*   [ ] 記錄上傳事件
*   [ ] 記錄讀取事件
*   [ ] 記錄刪除事件
*   [ ] 記錄錯誤事件

### 完成條件

```text
非 PDF 不可上傳
大量錯誤短碼查詢會被限制
簡報頁不會被搜尋引擎索引
API 不會回傳過度詳細錯誤
```

### 相依關係

需完成 Phase 3，建議在 Phase 6 後完善。

***

## Phase 8：整合測試與體驗修正

### 目標

確保 prototype 可以被實際使用者順利走完整流程。

### 測試情境

#### 上傳測試

*   [ ] 正常 PDF 可上傳
*   [ ] 非 PDF 被拒絕
*   [ ] 超過大小限制被拒絕
*   [ ] 空檔案被拒絕
*   [ ] 檔名含特殊字元不會造成錯誤

#### 短碼測試

*   [ ] 有效短碼可開啟
*   [ ] 無效短碼顯示錯誤
*   [ ] 過期短碼顯示錯誤
*   [ ] 刪除後短碼顯示錯誤

#### Viewer 測試

*   [ ] PDF 正常載入
*   [ ] 頁碼正確
*   [ ] 鍵盤操作正常
*   [ ] 全螢幕正常
*   [ ] 投影設備可正常顯示
*   [ ] 手機可上傳
*   [ ] 桌機可簡報

#### 刪除測試

*   [ ] 管理連結可開啟
*   [ ] 可刪除簡報
*   [ ] 刪除後 PDF 檔案移除
*   [ ] 刪除後短碼失效

#### 到期測試

*   [ ] 到期後不可讀取
*   [ ] cleanup job 可刪除檔案
*   [ ] cleanup 不會誤刪未過期檔案

### 完成條件

```text
可從上傳到簡報到刪除完整走完流程
沒有明顯阻斷性錯誤
可提供給少量使用者試用
```

### 相依關係

需完成 Phase 2 至 Phase 7。

***

# 13. Prototype 交付標準

當以下條件全部達成，可以視為 Prototype 完成。

## 13.1 核心流程完成

*   [ ] 使用者可以上傳 PDF
*   [ ] 系統會產生短碼
*   [ ] 使用者可在另一台裝置輸入短碼
*   [ ] 使用者可開啟 PDF 簡報
*   [ ] 使用者可全螢幕簡報
*   [ ] 使用者可用鍵盤切頁
*   [ ] 使用者可用管理連結刪除簡報
*   [ ] 過期簡報不可再開啟

***

## 13.2 安全底線完成

*   [ ] HTTPS 啟用
*   [ ] PDF 不公開存放
*   [ ] 後端驗證檔案類型
*   [ ] 有檔案大小限制
*   [ ] 有短碼查詢 rate limit
*   [ ] 錯誤訊息不洩漏過多資訊
*   [ ] 簡報頁 noindex
*   [ ] 管理 token 不明文存 DB

***

## 13.3 維運底線完成

*   [ ] Docker Compose 可啟動全部服務
*   [ ] PostgreSQL 資料持久化
*   [ ] PDF 檔案儲存在指定目錄
*   [ ] cleanup job 可執行
*   [ ] 有基本 log
*   [ ] 有 `.env.example`
*   [ ] README 有部署步驟

***

# 14. 建議開發順序總覽

```text
Phase 0  基礎設施
   ↓
Phase 1  資料模型與基礎後端
   ↓
Phase 2  PDF 上傳與短碼產生
   ↓
Phase 3  短碼查詢與簡報開啟
   ↓
Phase 4  PDF Viewer 與簡報模式
   ↓
Phase 5  管理連結與手動刪除
   ↓
Phase 6  過期清理機制
   ↓
Phase 7  基本安全與防濫用
   ↓
Phase 8  整合測試與體驗修正
```

***

# 15. 開發看板建議

你可以用以下欄位管理進度：

```text
Backlog
Ready
In Progress
Review
Testing
Done
```

***

## 15.1 初始 Backlog

```markdown
## Infrastructure
- [ ] 建立 Oracle VM 部署環境
- [ ] 設定 Docker Compose
- [ ] 設定 Caddy HTTPS
- [ ] 設定 PostgreSQL

## Backend
- [ ] 建立 presentations table
- [ ] 實作短碼產生器
- [ ] 實作 management token
- [ ] 實作 PDF upload API
- [ ] 實作 presentation lookup API
- [ ] 實作 PDF stream API
- [ ] 實作 delete API
- [ ] 實作 cleanup script

## Frontend
- [ ] 首頁上傳 UI
- [ ] 短碼輸入 UI
- [ ] 上傳成功頁
- [ ] 簡報播放頁
- [ ] 管理刪除頁

## Viewer
- [ ] 整合 PDF.js
- [ ] 單頁顯示
- [ ] 上一頁 / 下一頁
- [ ] 鍵盤切頁
- [ ] 全螢幕模式

## Security
- [ ] PDF 格式檢查
- [ ] 檔案大小限制
- [ ] Rate limit
- [ ] noindex
- [ ] 錯誤訊息模糊化
- [ ] Security headers

## Testing
- [ ] 正常上傳測試
- [ ] 錯誤檔案測試
- [ ] 有效短碼測試
- [ ] 無效短碼測試
- [ ] 過期測試
- [ ] 刪除測試
- [ ] Viewer 操作測試
```

***

# 16. 開發優先級

## P0：一定要做

*   PDF 上傳
*   短碼產生
*   短碼查詢
*   PDF 讀取
*   PDF viewer
*   到期檢查
*   手動刪除
*   HTTPS
*   私有儲存

***

## P1：Prototype 應該做

*   Rate limit
*   cleanup job
*   noindex
*   檔案 magic bytes 檢查
*   view count
*   last viewed time
*   鍵盤操作
*   全螢幕模式

***

## P2：之後再做

*   會員登入
*   儲存簡報歷史
*   付費方案
*   PPTX 轉 PDF
*   QR Code
*   簡報封面縮圖
*   自訂品牌
*   統計報表
*   活動模式

***

# 17. 主要風險與處理方式

## 17.1 短碼被猜測

### 風險

6 位短碼仍可能被暴力嘗試。

### 處理

*   使用英數混合短碼
*   避免連號
*   加 rate limit
*   錯誤訊息模糊化
*   限制保存期限

***

## 17.2 使用者上傳敏感文件

### 風險

使用者可能上傳公司機密、個資或未公開簡報。

### 處理

*   首頁顯示隱私提醒
*   預設短期保存
*   支援手動刪除
*   不主動分析 PDF 內容
*   不公開 PDF URL

***

## 17.3 VM 磁碟空間不足

### 風險

PDF 檔案累積造成磁碟滿載。

### 處理

*   限制單檔大小
*   限制保存期限
*   實作 cleanup job
*   加入磁碟容量監控
*   之後可搬到 Object Storage

***

## 17.4 PDF Viewer 相容性

### 風險

某些 PDF 在 PDF.js 顯示可能有差異。

### 處理

*   先支援常見 PDF
*   提供錯誤提示
*   測試不同來源 PDF
*   不在 prototype 階段處理所有特殊格式

***

## 17.5 Oracle A1 VM 單點故障

### 風險

VM 掛掉時服務會中斷。

### 處理

Prototype 可接受。正式 MVP 再考慮：

*   Object Storage
*   Managed DB
*   備份
*   監控
*   災難恢復

***

# 18. 開發完成後的使用者測試計畫

## 18.1 測試對象

建議找以下使用情境的人測試：

*   會議簡報者
*   教師 / 講師
*   學生報告
*   活動講者
*   公司內部簡報者

***

## 18.2 測試任務

請測試者完成：

```text
1. 在自己的電腦上傳 PDF
2. 記下簡報代碼
3. 在另一台設備輸入代碼
4. 開啟簡報
5. 切換頁面
6. 進入全螢幕
7. 使用管理連結刪除簡報
```

***

## 18.3 觀察重點

*   是否知道下一步要做什麼？
*   是否能正確理解短碼用途？
*   是否覺得比 USB 或雲端登入方便？
*   是否擔心簡報隱私？
*   是否需要更短或更長保存期限？
*   是否覺得 PDF viewer 夠用？
*   是否希望支援 QR Code？
*   是否希望之後有登入保存歷史？

***

# 19. 文件交付清單

建議專案中至少準備這些文件：

```text
README.md
docs/development-plan.md
docs/architecture.md
docs/api-spec.md
docs/security-notes.md
docs/deployment.md
.env.example
```

***

## 19.1 README.md 應包含

*   專案簡介
*   本機開發方式
*   環境變數
*   Docker Compose 啟動方式
*   基本功能說明

***

## 19.2 architecture.md 應包含

*   系統架構圖
*   技術選型
*   資料流程
*   儲存設計
*   安全設計
*   到期刪除設計

***

## 19.3 api-spec.md 應包含

*   API endpoint
*   request 格式
*   response 格式
*   錯誤格式
*   權限邏輯

***

## 19.4 deployment.md 應包含

*   Oracle VM 初始化
*   Docker 安裝
*   Caddy 設定
*   DNS 設定
*   環境變數
*   部署流程
*   cleanup cron 設定

***

# 20. 第一版 `.env.example`

```env
# App
NODE_ENV=production
APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://app:password@db:5432/presentation_app

# Upload
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=20

# Security
MANAGEMENT_TOKEN_SECRET=replace-with-random-secret
CODE_LENGTH=6

# Retention
DEFAULT_RETENTION=7d
```

***

# 21. Docker Compose 草案

```yaml
services:
  app:
    build:
      context: ./app
    container_name: presentation-app
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://app:password@db:5432/presentation_app
      UPLOAD_DIR: /data/uploads
      MAX_UPLOAD_SIZE_MB: 20
      APP_URL: https://your-domain.com
    volumes:
      - ./data/uploads:/data/uploads
    depends_on:
      - db
    expose:
      - "3000"

  db:
    image: postgres:16
    container_name: presentation-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: presentation_app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: password
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    expose:
      - "5432"

  caddy:
    image: caddy:latest
    container_name: presentation-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./data/caddy:/data
      - ./config/caddy:/config
    depends_on:
      - app
```

***

# 22. Caddyfile 草案

```text
your-domain.com {
  reverse_proxy app:3000

  header {
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "no-referrer"
  }
}
```

***

# 23. 第一個可執行開發目標

你可以把第一個真正的開發目標設定為：

```text
完成 PDF 上傳，並成功取得短碼。
```

這代表：

*   DB 可用
*   API 可用
*   檔案儲存可用
*   短碼邏輯可用
*   前端表單可用

這是整個產品最重要的第一個里程碑。

***

# 24. 建議你現在立刻建立的第一批 Issue

```markdown
## Issue 1：初始化 Next.js 專案
- 建立 TypeScript Next.js app
- 設定 Tailwind
- 建立首頁 layout
- 建立 .env.example

## Issue 2：建立 Docker Compose 環境
- 建立 app service
- 建立 PostgreSQL service
- 建立 Caddy service
- 確認服務可啟動

## Issue 3：建立 Prisma 資料模型
- 建立 Presentation model
- 建立 migration
- 建立 index
- 測試 DB 連線

## Issue 4：實作短碼產生器
- 建立 6 位英數短碼
- 排除易混淆字元
- 檢查唯一性
- 加入 unit test

## Issue 5：實作 PDF 上傳 API
- 接收 multipart file
- 檢查 PDF
- 儲存到 private folder
- 寫入 DB
- 回傳 code / viewUrl / manageUrl

## Issue 6：建立上傳頁面
- 建立 file input
- 建立 retention select
- 呼叫 upload API
- 顯示成功結果
```

***

# 25. Prototype 完成後的下一階段方向

當 Prototype 驗證成功後，再進入 MVP v1，可以考慮：

## 25.1 儲存升級

```text
Local filesystem → Oracle Object Storage / Cloudflare R2
```

***

## 25.2 帳號系統

```text
不登入可用
登入後可管理自己的簡報
```

***

## 25.3 使用體驗

*   QR Code
*   簡報封面預覽
*   最近簡報
*   自訂保存期限
*   更好的手機上傳體驗

***

## 25.4 商業化功能

*   長期保存
*   品牌頁
*   活動模式
*   自訂短碼
*   團隊方案

***

# 26. 最終開發總結

你的開發方向可以收斂成一句話：

> 先用 Oracle Cloud A1 VM 做出一個不登入、短期保存、輸入 PIN 即可播放 PDF 的簡報 prototype。

第一版不要做太多功能，最重要的是完整跑通：

```text
上傳 PDF
→ 取得短碼
→ 輸入短碼
→ 開始簡報
→ 到期刪除
```

建議你依照以下優先順序開始：

```text
1. 建立 VM / Docker / Caddy / PostgreSQL
2. 建立 Next.js + Prisma 專案
3. 完成 PDF 上傳 API
4. 完成短碼產生與成功頁
5. 完成短碼查詢與 PDF stream
6. 完成 PDF.js Viewer
7. 完成管理刪除
8. 完成 cleanup job
9. 加上基本安全與測試
```

這樣你的 prototype 會保持簡單、可控，而且能非常直接地驗證產品價值。
