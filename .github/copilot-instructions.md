# Copilot Instructions — Zlide

> 本文件供 VS Code GitHub Copilot / Copilot Chat 作為專案開發時的上下文指引。  

---

## 1. 專案背景

本專案名稱為 **Zlide**。

Zlide 是一個「臨時簡報存取平台」Prototype。

核心流程：

```text
使用者在私人設備上傳 PDF 簡報
→ Zlide 產生一組簡報代碼 / PIN
→ 使用者在公用電腦、會議室、教室或投影設備上輸入代碼
→ 直接開啟 PDF 簡報
→ 檔案於指定期限後自動失效並刪除
```

品牌定位：

```text
Zlide：上傳簡報，取得代碼，到哪都能立即開講。
```

主要網域：

```text
https://zlide.app
```

產品目標是解決：

- 不想攜帶 USB
- 不想在公用電腦登入 Google Drive / OneDrive / Canva 等雲端服務
- 不想在公用電腦留下個人帳號或檔案
- 希望簡報能短期暫存、快速開啟、自動刪除

本階段目標是開發 Prototype / Release Candidate，不是完整商業產品。

---

## 2. 目前產品定位

本產品不是：

- 雲端硬碟
- Canva 替代品
- 長期檔案保存服務
- 高強度 DRM / 防截圖平台

本產品是：

```text
臨時簡報通道
```

中文輔助描述可使用：

```text
Zlide 簡報碼
```

設計原則：

- 快速
- 簡單
- 不登入即可使用
- 短期保存
- 到期刪除
- 公用電腦友善
- 降低登入雲端帳號與使用 USB 的風險

---

## 3. 技術棧

請優先依照以下技術棧開發。

```yaml
frontend:
  framework: Next.js
  language: TypeScript
  styling: Tailwind CSS
  pdf_viewer: PDF.js / pdfjs-dist

backend:
  framework: Next.js API Routes / Route Handlers
  runtime: Node.js 20+
  validation: Zod
  orm: Prisma

database:
  type: PostgreSQL

storage:
  type: Local private filesystem for prototype
  path: /data/uploads

infrastructure:
  cloud: Oracle Cloud Always Free VM.Standard.A1.Flex 2 OCPU / 12GB
  os: Ubuntu
  container: Docker Compose
  reverse_proxy: Caddy
  https: Caddy Auto TLS
  primary_domain: zlide.app
```

---

## 4. Prototype 功能範圍

### 4.1 必做功能

#### 上傳端

- PDF 上傳
- 檔案格式驗證
- 檔案大小限制
- 選擇保存期限
- 產生 6 位英數簡報代碼
- 產生觀看網址
- 產生管理刪除連結

#### 簡報端

- 首頁輸入簡報代碼
- `/p/[code]` 開啟簡報
- PDF.js 顯示 PDF
- 單頁簡報模式
- 上一頁 / 下一頁
- 鍵盤切頁
- 全螢幕模式
- 頁碼顯示

#### 管理端

- `/manage/[token]` 管理頁
- 顯示簡報資訊
- 手動刪除簡報
- 刪除後簡報代碼立即失效

#### 系統端

- 到期後拒絕存取
- 定期清除過期 PDF
- 基本 rate limit
- HTTPS
- PDF 私有儲存
- noindex / nofollow
- 模糊化錯誤訊息

---

### 4.2 Prototype 階段不要做

除非使用者明確要求，請不要主動實作以下功能：

- 會員登入
- 付費系統
- PPT / PPTX 轉 PDF
- AI 摘要
- 簡報歷史列表
- 團隊協作
- 權限群組
- 防截圖 / DRM
- 多人同步簡報
- 自訂網域
- 長期保存
- 複雜後台管理系統

Prototype 階段請專注在：

```text
上傳 PDF → 取得簡報代碼 → 輸入簡報代碼 → 開始簡報 → 到期刪除
```

---

## 5. 核心產品決策

### 5.1 檔案格式

```yaml
allowed_file_type: PDF only
```

只接受 PDF。

不要在 Prototype 階段支援 PPT、PPTX、圖片、影片或其他格式。

### 5.2 檔案大小

預設：

```yaml
max_file_size_mb: 20
```

日後可調整為 50MB，但 Prototype 初期以 20MB 為佳。

### 5.3 簡報代碼格式

```yaml
code_length: 6
code_type: alphanumeric
```

範例：

```text
K7P9Q2
D8MXA7
Q3R7NP
```

### 5.4 簡報代碼字元集

使用以下字元集，避免容易混淆的字元：

```text
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```

排除：

```text
0 O 1 I L
```

### 5.5 保存期限

Prototype 支援：

```yaml
retention_options:
  - 1h
  - 24h
  - 3d
  - 7d

default_retention: 7d
```

### 5.6 登入策略

Prototype 階段不需要會員登入。

```yaml
login_required: false
```

使用：

```text
public code + management token
```

- `public_code`：給簡報者輸入，用來觀看簡報
- `management_token`：上傳者專用，用來管理或刪除簡報

---

## 6. 系統架構

目標架構：

```text
[User Browser]
    |
    v
[zlide.app + HTTPS]
    |
    v
[Caddy Reverse Proxy]
    |
    v
[Next.js Application]
    |
    +--> [PostgreSQL]
    |
    +--> [Private Local PDF Storage]
    |
    +--> [Cleanup Cron Job]
```

---

## 7. 建議目錄結構

專案根目錄建議：

```text
zlide/
├── app/
│   ├── page.tsx
│   ├── p/
│   │   └── [code]/
│   │       └── page.tsx
│   ├── manage/
│   │   └── [token]/
│   │       └── page.tsx
│   └── api/
│       ├── presentations/
│       │   ├── route.ts
│       │   └── [code]/
│       │       ├── route.ts
│       │       └── file/
│       │           └── route.ts
│       └── manage/
│           └── [token]/
│               └── route.ts
├── components/
├── lib/
│   ├── db.ts
│   ├── code.ts
│   ├── token.ts
│   ├── upload.ts
│   ├── rate-limit.ts
│   └── security.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── cleanup-expired.ts
├── docs/
├── docker-compose.yml
├── Caddyfile
├── .env.example
└── copilot-instructions.md
```

如果使用 `src/` 目錄，也可以將 `app/`, `components/`, `lib/` 放入 `src/`。

---

## 8. 資料模型

請使用 Prisma 管理 PostgreSQL schema。

### 8.1 Presentation Model

建議 Prisma model：

```prisma
model Presentation {
  id                  String    @id @default(uuid()) @db.Uuid

  publicCode          String    @unique @map("public_code")
  managementTokenHash String    @map("management_token_hash")

  originalFilename    String    @map("original_filename")
  storagePath         String    @map("storage_path")

  fileSizeBytes       BigInt    @map("file_size_bytes")
  mimeType            String    @map("mime_type")

  status              String    @default("active")

  expiresAt           DateTime  @map("expires_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  deletedAt           DateTime? @map("deleted_at")

  viewCount           Int       @default(0) @map("view_count")
  lastViewedAt        DateTime? @map("last_viewed_at")

  @@index([publicCode])
  @@index([expiresAt])
  @@index([status])
  @@map("presentations")
}
```

狀態值：

```ts
type PresentationStatus = "active" | "deleted";
```

過期狀態不一定需要存入 DB，可透過 `expiresAt < now` 判斷。

---

## 9. API 設計

### 9.1 上傳簡報

```http
POST /api/presentations
Content-Type: multipart/form-data
```

Request：

```text
file: PDF
retention: 1h | 24h | 3d | 7d
```

Response：

```json
{
  "code": "K7P9Q2",
  "viewUrl": "https://zlide.app/p/K7P9Q2",
  "manageUrl": "https://zlide.app/manage/long-random-token",
  "expiresAt": "2026-05-17T00:00:00+08:00"
}
```

### 9.2 查詢簡報

```http
GET /api/presentations/[code]
```

成功：

```json
{
  "code": "K7P9Q2",
  "fileName": "demo.pdf",
  "expiresAt": "2026-05-17T00:00:00+08:00",
  "status": "active"
}
```

失敗：

```json
{
  "error": "代碼無效或已過期"
}
```

### 9.3 取得 PDF

```http
GET /api/presentations/[code]/file
```

必須由後端檢查：

- `publicCode` 是否存在
- `status === "active"`
- `expiresAt > now`
- `storagePath` 對應檔案是否存在

通過後才 stream PDF。

禁止直接公開 PDF 檔案 URL。

### 9.4 管理與刪除簡報

```http
GET /api/manage/[token]
DELETE /api/manage/[token]
```

`token` 是管理連結中的長隨機字串。

DB 內只存 token hash，不存明文 token。

刪除流程：

```text
1. hash token
2. 查詢 managementTokenHash
3. 刪除 PDF 檔案
4. 更新 status = deleted
5. 寫入 deletedAt
```

---

## 10. 安全規則

### 10.1 PDF 不可公開存取

不要把上傳檔案放在：

```text
public/uploads
```

應放在：

```text
/data/uploads
```

並只能透過：

```text
/api/presentations/[code]/file
```

由後端驗證後回傳。

### 10.2 檔案驗證

後端必須檢查：

- 檔案存在
- 檔案大小不超過限制
- 副檔名為 `.pdf`
- MIME type 為 `application/pdf`
- magic bytes 以 `%PDF` 開頭

不要只依賴前端檢查。

### 10.3 管理 Token

管理 token 必須：

- 使用 cryptographically secure random generator
- 長度足夠
- 只在建立後回傳一次
- DB 只存 hash

建議使用 Node.js `crypto`。

### 10.4 簡報代碼安全

簡報代碼產生規則：

- 不使用流水號
- 不使用可預測規則
- 使用安全亂數
- 產生後查 DB 確認唯一
- 如果撞碼，重新產生

### 10.5 Rate Limit

至少保護：

- `POST /api/presentations`
- `GET /api/presentations/[code]`
- `GET /api/presentations/[code]/file`

Prototype 可使用簡單記憶體 rate limit；若日後多 instance 再改 Redis。

### 10.6 錯誤訊息

不要暴露過多資訊。

不要回傳：

```text
這個 code 存在但已過期
```

請統一回傳：

```text
代碼無效或已過期
```

### 10.7 noindex

簡報頁與管理頁都應加入：

```html
<meta name="robots" content="noindex,nofollow" />
```

或使用 Next.js metadata：

```ts
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

---

## 11. PDF Viewer 要求

請使用 PDF.js 或相容套件。

最低需求：

- 單頁顯示
- 上一頁
- 下一頁
- 頁碼顯示
- 全螢幕
- 鍵盤操作

鍵盤規則：

```text
ArrowRight: 下一頁
Space: 下一頁
ArrowLeft: 上一頁
F: 全螢幕
Esc: 離開全螢幕
```

請避免在後端進行 PDF 轉圖片、OCR 或重型處理。

Prototype 階段 PDF 顯示應盡量依賴瀏覽器端 PDF.js。

---

## 12. 到期與清理機制

### 12.1 讀取時檢查

每次查詢 metadata 或讀取 PDF 時，都必須檢查：

```ts
presentation.status === "active"
presentation.expiresAt > new Date()
```

若不符合，回傳：

```json
{
  "error": "代碼無效或已過期"
}
```

### 12.2 Cleanup Script

建立：

```text
scripts/cleanup-expired.ts
```

流程：

```text
1. 查詢 expiresAt < now 且 status = active 的簡報
2. 刪除 storagePath 對應 PDF
3. 更新 status = deleted
4. 寫入 deletedAt
5. 輸出 cleanup log
```

可由 cron 執行。

Oracle VM cron 建議：

```cron
0 * * * * cd /opt/zlide && docker compose exec -T app npm run cleanup:expired >> /opt/zlide/logs/cleanup.log 2>&1
```

---

## 13. UI / UX 原則

### 13.1 首頁

首頁應同時提供：

- 上傳 PDF
- 輸入簡報代碼

首頁文案可使用：

```text
Zlide
上傳簡報，取得代碼，到哪都能立即開講。

不用 USB，不用登入雲端硬碟。
上傳 PDF，取得一組簡報代碼，到任何電腦輸入代碼即可開始簡報。

檔案將於指定期限後自動刪除。
請勿上傳高度機密、敏感個資或未授權公開的文件。
```

### 13.2 上傳成功頁

上傳成功後顯示：

- 簡報代碼
- 觀看連結
- 管理連結
- 到期時間
- 複製按鈕

觀看連結應使用 `APP_URL` 組成，例如：

```text
https://zlide.app/p/K7P9Q2
```

### 13.3 簡報頁

簡報頁應盡量乾淨，避免干擾投影。

應支援：

- 大畫面顯示
- 全螢幕
- 鍵盤切頁
- 清楚頁碼

### 13.4 管理頁

管理頁應顯示：

- 原始檔名
- 到期時間
- 狀態
- 觀看次數
- 刪除按鈕

刪除前應有確認提示。

---

## 14. 程式碼風格

請遵守以下原則：

- 使用 TypeScript
- 儘量避免 `any`
- API input 使用 Zod 驗證
- 共用邏輯放在 `lib/`
- 不要把安全邏輯散落在 UI component 中
- 檔案處理需明確處理錯誤
- 不要在 log 中輸出完整 management token
- 不要在 log 中輸出敏感檔案內容
- 使用明確的 function name
- 優先簡單可讀，而不是過度抽象

---

## 15. 錯誤處理

API 錯誤格式建議統一：

```json
{
  "error": "錯誤訊息"
}
```

常見錯誤：

```text
400 Bad Request: 檔案格式錯誤、缺少參數
404 Not Found: 代碼無效或已過期
413 Payload Too Large: 檔案過大
429 Too Many Requests: 請求過於頻繁
500 Internal Server Error: 伺服器錯誤
```

對使用者顯示的訊息應簡潔，不揭露內部細節。

---

## 16. 環境變數

`.env.example` 建議：

```env
# App
NODE_ENV=development
APP_URL=http://localhost:3000

# Production example
# APP_URL=https://zlide.app

# Database
DATABASE_URL=postgresql://app:password@localhost:5432/zlide

# Upload
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=20

# Code
CODE_LENGTH=6

# Security
MANAGEMENT_TOKEN_SECRET=replace-with-random-secret

# Retention
DEFAULT_RETENTION=7d
```

不要將 `.env` commit 到 repository。

---

## 17. Docker / Deployment 原則

Prototype 使用 Oracle Cloud A1 VM + Docker Compose。

服務：

- `app`: Next.js app
- `db`: PostgreSQL
- `caddy`: HTTPS reverse proxy

正式部署建議目錄：

```text
/opt/zlide
```

PDF upload folder 必須使用 volume 掛載：

```yaml
volumes:
  - ./data/uploads:/data/uploads
```

PostgreSQL data 必須持久化：

```yaml
volumes:
  - ./data/postgres:/var/lib/postgresql/data
```

PostgreSQL 不應對外公開 port。

Caddyfile 正式網域：

```text
zlide.app {
  reverse_proxy app:3000
}
```

---

## 18. 測試重點

請優先測試：

### 上傳測試

- 正常 PDF 可上傳
- 非 PDF 被拒絕
- 空檔案被拒絕
- 超過大小限制被拒絕
- 檔名含特殊字元不會出錯

### 簡報代碼測試

- 有效簡報代碼可開啟
- 無效簡報代碼顯示錯誤
- 刪除後簡報代碼失效
- 過期後簡報代碼失效

### Viewer 測試

- PDF 正常載入
- 頁碼正確
- 上一頁 / 下一頁正常
- 鍵盤操作正常
- 全螢幕正常

### 刪除測試

- 管理連結可開啟
- 刪除後 PDF 檔案移除
- 刪除後 DB 狀態更新
- 刪除後簡報代碼不可再開啟

### Cleanup 測試

- 過期檔案會被刪除
- 未過期檔案不會被誤刪
- cleanup log 可追蹤

---

## 19. 開發優先順序

目前 Zlide 已接近 Feature Complete，接下來請優先處理 Release Candidate 工作：

```text
1. zlide.app DNS 與 Caddy HTTPS
2. Oracle A1 VM Docker Compose 部署驗證
3. cleanup cron job 實際啟用
4. 端對端整合測試
5. Viewer 跨裝置測試
6. UI/UX 最終打磨
7. README / deployment / test plan 文件補齊
```

若從零開始開發，順序如下：

```text
1. 專案初始化
2. Docker Compose / PostgreSQL / Caddy
3. Prisma schema
4. 短碼與 token utility
5. PDF upload API
6. 首頁 upload UI
7. 上傳成功頁
8. presentation lookup API
9. PDF stream API
10. /p/[code] 簡報頁
11. PDF.js viewer
12. /manage/[token] 管理頁
13. delete API
14. cleanup script
15. rate limit 與安全強化
16. 整合測試
```

---

## 20. Copilot 生成程式碼時的注意事項

當產生程式碼時，請遵守：

1. 使用 Zlide 作為產品名稱。
2. Production `APP_URL` 應使用 `https://zlide.app`。
3. 不要產生會員登入、付款、AI、PPT 轉檔等超出 Prototype 範圍的功能。
4. 不要把 PDF 放到 `public/` 目錄。
5. 不要直接暴露本機 PDF 路徑。
6. 不要用流水號當作 public code。
7. 不要把 management token 明文存入資料庫。
8. 不要在錯誤訊息中透露 code 是否存在。
9. 不要省略後端檔案驗證。
10. 不要只做前端檢查。
11. 不要在 log 中輸出敏感 token。
12. 優先完成核心流程，不要過度設計。

---

## 21. 建議 helper functions

請優先建立以下 helper：

```ts
generatePublicCode(): string
generateManagementToken(): string
hashToken(token: string): string
validateRetention(input: string): RetentionOption
calculateExpiresAt(retention: RetentionOption): Date
validatePdfFile(file: File | Buffer): Promise<void>
ensureUploadDir(): Promise<void>
getStoragePath(presentationId: string): string
isPresentationAccessible(presentation: Presentation): boolean
```

---

## 22. 建議安全實作方向

### 簡報代碼產生

使用 Node.js `crypto.randomInt` 或等價安全亂數。

不要使用：

```ts
Math.random()
```

產生簡報代碼時使用字元集：

```ts
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
```

### Token hash

可使用：

```ts
crypto.createHash("sha256")
```

若使用 secret，可用 HMAC：

```ts
crypto.createHmac("sha256", secret)
```

### PDF magic bytes

PDF 檔案開頭通常應包含：

```text
%PDF
```

後端需讀取檔案前幾個 bytes 檢查。

---

## 23. Definition of Done

Zlide Prototype / RC 完成條件：

- 使用者可以上傳 PDF
- 系統產生 6 位英數簡報代碼
- 使用者可在另一台裝置輸入簡報代碼
- 簡報頁可顯示 PDF
- 支援鍵盤切頁
- 支援全螢幕
- 管理連結可刪除簡報
- 過期後不可再存取
- cleanup job 可刪除過期 PDF
- PDF 不可公開直接存取
- 有基本 rate limit
- 有 noindex
- `zlide.app` 可透過 HTTPS 使用
- 有 README 與 `.env.example`

---

## 24. 後續可延伸但目前不要主動實作

日後可考慮：

- QR Code
- 登入後管理簡報列表
- Object Storage
- Cloudflare R2 / Oracle Object Storage
- 簡報封面縮圖
- 自訂保存期限
- 自訂短碼
- 活動模式
- 付費長期保存
- 團隊方案

但 Prototype / RC 階段請不要主動實作這些。

---

## 25. 最重要的開發原則

請永遠優先完成並保護這條核心流程：

```text
上傳 PDF
→ 取得簡報代碼
→ 輸入簡報代碼
→ 開始簡報
→ 到期刪除
```

如果某個功能不直接服務這條流程，Prototype 階段應延後。
