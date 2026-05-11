# Zlide Prototype 開發規畫與進度期程

> 文件名稱建議：`prototype-plan.md`  
> 平台名稱：**Zlide**  
> 預計主網域：`https://zlide.app`  
> 目前狀態：Prototype Feature Complete → Release Candidate 準備階段

---

## 1. 專案概述

### 1.1 專案名稱

```text
Zlide
```

中文輔助描述名：

```text
Zlide 簡報碼
```

### 1.2 品牌定位

Zlide 是一個「臨時簡報存取平台」。使用者可以在自己的設備上傳 PDF 簡報，取得一組簡報代碼，然後在會議室、公用電腦、教室講台或投影設備上輸入代碼，即可直接開始簡報。

Zlide 的核心價值：

```text
上傳簡報，取得代碼，到哪都能立即開講。
```

### 1.3 產品目的

Zlide 主要解決以下問題：

- 不想攜帶 USB
- 不想在公用電腦登入 Google Drive、OneDrive、Canva 等雲端服務
- 不想在公用電腦留下私人帳號、登入紀錄或檔案
- 希望簡報可以短期暫存、自動失效、自動刪除
- 希望在會議室、教室、活動現場快速開啟簡報

---

## 2. Prototype 目標

Prototype 階段的目標不是建立完整商業平台，而是驗證 Zlide 的核心使用流程是否成立。

### 2.1 核心驗證流程

```text
使用者上傳 PDF
→ Zlide 產生簡報代碼
→ 使用者在另一台電腦輸入簡報代碼
→ 開啟簡報
→ 使用 PDF viewer 簡報
→ 到期後自動失效或刪除
```

### 2.2 Prototype 要回答的問題

- 使用者是否覺得「上傳 PDF → 輸入代碼簡報」足夠方便？
- 6 位英數簡報代碼是否好記、好輸入？
- PDF viewer 是否足以支援基本簡報需求？
- 使用者是否信任「短期保存、自動刪除」的設計？
- 不登入的操作流程是否符合 Zlide 的產品定位？
- Oracle Cloud A1 VM 是否足以支撐 Zlide prototype 運作？

---

## 3. Prototype 功能範圍

### 3.1 本階段要做的功能

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
- 透過 `/p/[code]` 開啟簡報
- PDF.js 顯示 PDF
- 單頁簡報模式
- 上一頁 / 下一頁
- 鍵盤切頁
- 全螢幕模式
- 頁碼顯示

#### 管理端

- 透過管理連結查看簡報資訊
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

### 3.2 本階段不做的功能

Prototype 階段先排除：

- 會員登入
- 付款系統
- 簡報歷史列表
- PPT / PPTX 轉 PDF
- AI 摘要
- 簡報筆記
- 團隊管理
- 權限群組
- 防截圖 / DRM
- 多人同步簡報
- 自訂網域
- 長期保存
- 搜尋簡報
- 複雜後台管理系統

---

## 4. 核心產品決策

### 4.1 檔案格式

```yaml
supported_file_type: PDF only
```

Prototype 只支援 PDF，不支援 PPT、PPTX、圖片或影片。

### 4.2 檔案大小限制

建議初始設定：

```yaml
max_file_size: 20MB
```

之後如果測試順利，可再提高到：

```yaml
max_file_size: 50MB
```

### 4.3 簡報代碼格式

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

### 4.4 簡報代碼字元集

避免容易混淆的字元：

```text
ABCDEFGHJKLMNPQRSTUVWXYZ23456789
```

排除：

```text
0 O 1 I L
```

### 4.5 保存期限

Prototype 提供：

```yaml
retention_options:
  - 1h
  - 24h
  - 3d
  - 7d

default_retention: 7d
```

### 4.6 登入策略

Prototype 階段：

```yaml
login_required: false
```

不做會員登入，改用：

```text
觀看簡報代碼 + 管理刪除連結
```

---

## 5. 技術架構

### 5.1 建議架構

```text
[使用者瀏覽器]
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
        +--> [PostgreSQL Database]
        |
        +--> [Local Private PDF Storage]
        |
        +--> [Cleanup Cron Job]
```

### 5.2 部署環境

```yaml
cloud_provider: Oracle Cloud
machine: VM.Standard.A1.Flex 2 OCPU / 12GB
os: Ubuntu
container_runtime: Docker
orchestration: Docker Compose
reverse_proxy: Caddy
https: Caddy Auto TLS
primary_domain: zlide.app
```

### 5.3 應用程式技術

```yaml
frontend:
  framework: Next.js
  language: TypeScript
  styling: Tailwind CSS
  pdf_viewer: PDF.js

backend:
  framework: Next.js API Routes / Route Handlers
  runtime: Node.js
  validation: Zod
  orm: Prisma

database:
  type: PostgreSQL

storage:
  type: local private filesystem
  path: /opt/zlide/data/uploads
```

---

## 6. 系統目錄規劃

Oracle A1 VM 上建議目錄：

```text
/opt/zlide
├── app
│   └── Next.js application
├── data
│   ├── uploads
│   │   └── private PDF files
│   ├── postgres
│   │   └── PostgreSQL data
│   └── caddy
├── config
│   └── caddy
├── logs
├── backups
├── docker-compose.yml
├── Caddyfile
└── scripts
    └── cleanup-expired.ts
```

---

## 7. 頁面規劃

### 7.1 首頁 `/`

#### 功能

- 上傳 PDF
- 選擇保存期限
- 輸入簡報代碼
- 進入簡報

#### 首頁文案建議

```text
Zlide
上傳簡報，取得代碼，到哪都能立即開講。

不用 USB，不用登入雲端硬碟。
上傳 PDF，取得一組簡報代碼，到任何電腦輸入代碼即可開始簡報。

檔案將於指定期限後自動刪除。
請勿上傳高度機密、敏感個資或未授權公開的文件。
```

#### UI 概念

```text
--------------------------------
Zlide
上傳簡報，取得代碼，到哪都能立即開講。

[ 選擇 PDF ] [ 保存期限 ] [ 上傳簡報 ]

或

輸入簡報代碼
[ K7P9Q2 ] [ 開始簡報 ]
--------------------------------
```

### 7.2 上傳成功頁 `/upload/success`

#### 顯示內容

```text
你的簡報已準備好

簡報代碼：
K7P9Q2

觀看連結：
https://zlide.app/p/K7P9Q2

管理連結：
https://zlide.app/manage/{management-token}

到期時間：
2026-05-17 00:00
```

#### 按鈕

- 複製簡報代碼
- 複製觀看連結
- 開啟簡報
- 前往管理頁

### 7.3 簡報頁 `/p/[code]`

#### 功能

- 驗證簡報代碼
- 檢查是否過期
- 檢查狀態是否 active
- 載入 PDF
- 顯示 PDF viewer

#### Viewer 功能

- 上一頁
- 下一頁
- 頁碼顯示
- 全螢幕
- 鍵盤操作

#### 鍵盤規則

```text
ArrowRight: 下一頁
Space: 下一頁
ArrowLeft: 上一頁
F: 全螢幕
Esc: 離開全螢幕
```

### 7.4 管理頁 `/manage/[token]`

#### 功能

- 顯示原始檔名
- 顯示到期時間
- 顯示目前狀態
- 顯示觀看次數
- 手動刪除簡報

#### 刪除後顯示

```text
此簡報已刪除，原簡報代碼已失效。
```

---

## 8. API 規劃

### 8.1 上傳簡報

```http
POST /api/presentations
Content-Type: multipart/form-data
```

#### Request

```text
file: PDF
retention: 1h | 24h | 3d | 7d
```

#### Response

```json
{
  "code": "K7P9Q2",
  "viewUrl": "https://zlide.app/p/K7P9Q2",
  "manageUrl": "https://zlide.app/manage/long-random-token",
  "expiresAt": "2026-05-17T00:00:00+08:00"
}
```

### 8.2 查詢簡報

```http
GET /api/presentations/[code]
```

#### 成功 Response

```json
{
  "code": "K7P9Q2",
  "fileName": "demo.pdf",
  "expiresAt": "2026-05-17T00:00:00+08:00",
  "status": "active"
}
```

#### 失敗 Response

```json
{
  "error": "代碼無效或已過期"
}
```

### 8.3 取得 PDF

```http
GET /api/presentations/[code]/file
```

後端必須檢查：

```text
code 是否存在
status 是否 active
expires_at 是否尚未過期
檔案是否存在
```

通過後才 stream PDF。

### 8.4 刪除簡報

```http
DELETE /api/manage/[token]
```

#### 行為

```text
驗證 management token
刪除 PDF 檔案
更新 status = deleted
寫入 deleted_at
```

#### Response

```json
{
  "status": "deleted"
}
```

---

## 9. 資料庫設計

### 9.1 presentations table

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

### 9.2 狀態定義

```yaml
status:
  active: 可存取
  deleted: 已刪除
```

過期可透過 `expires_at < now()` 判斷，不一定需要額外存 `expired` 狀態。

---

## 10. 安全設計

### 10.1 HTTPS

必須啟用 HTTPS。

建議使用：

```text
Caddy Auto TLS
```

### 10.2 PDF 私有儲存

PDF 不放在：

```text
public/uploads
```

PDF 應放在：

```text
/opt/zlide/data/uploads
```

並只能透過後端 API 讀取。

### 10.3 檔案驗證

後端必須驗證：

- 副檔名是否為 `.pdf`
- MIME type 是否為 `application/pdf`
- 檔案開頭 magic bytes 是否為 `%PDF`
- 檔案大小是否未超過限制

### 10.4 Rate Limit

建議規則：

```yaml
upload:
  limit: 每個 IP 限制上傳頻率
code_lookup:
  limit: 每個 IP 限制短碼查詢頻率
file_access:
  limit: 每個 IP 限制 PDF 讀取頻率
```

### 10.5 錯誤訊息模糊化

不要回傳：

```text
這個代碼存在但已過期
```

應統一回傳：

```text
代碼無效或已過期
```

### 10.6 搜尋引擎索引

簡報頁與管理頁加入：

```html
<meta name="robots" content="noindex,nofollow" />
```

或在 Next.js metadata 中設定：

```ts
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

### 10.7 管理 Token

管理連結使用長隨機 token。資料庫不存明文 token，只存：

```text
management_token_hash
```

---

## 11. 到期與刪除機制

### 11.1 讀取時檢查

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

### 11.2 定期清理

使用 cron job 執行 cleanup script。

#### Cleanup 流程

```text
1. 查詢 expires_at < now() 且 status = active 的資料
2. 刪除 storage_path 對應 PDF
3. 更新 status = deleted
4. 寫入 deleted_at
```

#### Oracle VM cron 建議

```cron
0 * * * * cd /opt/zlide && docker compose exec -T app npm run cleanup:expired >> /opt/zlide/logs/cleanup.log 2>&1
```

---

## 12. 目前開發狀態

目前 Zlide 已進入：

```text
Prototype Feature Complete → Release Candidate 準備階段
```

### 已完成 / 大致完成

- Phase 0：基礎環境與專案結構
- Phase 1：Prisma schema 與 presentations 資料模型
- Phase 2：PDF 上傳與簡報代碼產生
- Phase 3：簡報查詢與 PDF 讀取
- Phase 4：PDF Viewer 與簡報模式
- Phase 5：管理連結與刪除機制
- Phase 6：過期清理腳本
- Phase 7：Rate limit 與基礎安全

### 下一階段重點

- Oracle A1 VM 真實部署
- `zlide.app` DNS 與 Caddy HTTPS 驗證
- Cleanup cron job 實際啟用
- Docker Compose 部署驗證
- Viewer 跨裝置測試
- 端對端整合測試
- UI/UX 最終打磨

---

## 13. Phase 8：整合測試與體驗修正

### 13.1 目標

確保 Zlide prototype 可以被實際使用者順利走完整流程。

### 13.2 測試情境

#### 上傳測試

- 正常 PDF 可上傳
- 非 PDF 被拒絕
- 超過大小限制被拒絕
- 空檔案被拒絕
- 檔名含特殊字元不會造成錯誤

#### 簡報代碼測試

- 有效簡報代碼可開啟
- 無效簡報代碼顯示錯誤
- 過期簡報代碼顯示錯誤
- 刪除後簡報代碼顯示錯誤

#### Viewer 測試

- PDF 正常載入
- 頁碼正確
- 鍵盤操作正常
- 全螢幕正常
- 投影設備可正常顯示
- 手機可上傳
- 桌機可簡報

#### 刪除測試

- 管理連結可開啟
- 可刪除簡報
- 刪除後 PDF 檔案移除
- 刪除後簡報代碼失效

#### 到期測試

- 到期後不可讀取
- cleanup job 可刪除檔案
- cleanup 不會誤刪未過期檔案

### 13.3 完成條件

```text
可從上傳到簡報到刪除完整走完流程
沒有明顯阻斷性錯誤
可提供給少量使用者試用
```

---

## 14. Prototype Release Candidate Checklist

### Core Flow

- [ ] 首頁可開啟
- [ ] 可上傳 PDF
- [ ] 可選保存期限
- [ ] 成功產生簡報代碼
- [ ] 成功產生觀看連結
- [ ] 成功產生管理連結
- [ ] 可複製簡報代碼
- [ ] 可複製觀看連結
- [ ] 可透過首頁輸入簡報代碼開啟
- [ ] 可透過 `/p/[code]` 直接開啟
- [ ] PDF 正常顯示
- [ ] 可上一頁 / 下一頁
- [ ] 可鍵盤切頁
- [ ] 可全螢幕
- [ ] 可透過管理連結刪除
- [ ] 刪除後簡報代碼失效

### Expiration / Cleanup

- [ ] 1 小時保存可正常計算
- [ ] 24 小時保存可正常計算
- [ ] 3 天保存可正常計算
- [ ] 7 天保存可正常計算
- [ ] 過期後 metadata API 拒絕
- [ ] 過期後 file API 拒絕
- [ ] cleanup script 可手動執行
- [ ] cron 可定期執行 cleanup
- [ ] cleanup 會刪除過期 PDF
- [ ] cleanup 不會誤刪未過期 PDF

### Security

- [ ] PDF 不在 public folder
- [ ] file API 不暴露 storagePath
- [ ] file API 每次都重新驗證
- [ ] management token 不明文存 DB
- [ ] public code 非流水號
- [ ] public code 使用安全亂數
- [ ] 上傳 API 有 rate limit
- [ ] 查詢 API 有 rate limit
- [ ] file API 有 rate limit
- [ ] 非 PDF 被拒絕
- [ ] 偽裝 PDF 被拒絕
- [ ] 超大 PDF 被拒絕
- [ ] 錯誤訊息模糊化
- [ ] noindex / nofollow 已設定
- [ ] `.env` 未 commit

### Deployment

- [ ] `zlide.app` DNS 指向 Oracle A1 VM
- [ ] Docker Compose 可 build
- [ ] Docker Compose 可重啟
- [ ] app service restart policy 設定
- [ ] db service restart policy 設定
- [ ] caddy service restart policy 設定
- [ ] uploads volume 正常
- [ ] postgres volume 正常
- [ ] Caddy HTTPS 正常
- [ ] Oracle firewall 開啟 80 / 443
- [ ] PostgreSQL 未對外公開
- [ ] README 有部署步驟
- [ ] docs/deployment.md 完成

### UX

- [ ] 首頁文案清楚
- [ ] 隱私提醒清楚
- [ ] 簡報代碼顯示清楚
- [ ] 複製成功有提示
- [ ] 上傳中有 loading
- [ ] 上傳失敗有友善錯誤
- [ ] 簡報載入中有 loading
- [ ] 簡報錯誤有友善錯誤
- [ ] 手機上傳體驗可接受
- [ ] 桌機簡報體驗可接受
- [ ] 投影模式可接受

---

## 15. 文件交付清單

建議專案中至少準備這些文件：

```text
README.md
docs/development-plan.md
docs/architecture.md
docs/api-spec.md
docs/security-notes.md
docs/deployment.md
docs/test-plan.md
docs/release-checklist.md
.env.example
copilot-instructions.md
```

---

## 16. 第一版 `.env.example`

```env
# App
NODE_ENV=production
APP_URL=https://zlide.app

# Database
DATABASE_URL=postgresql://app:password@db:5432/zlide

# Upload
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_SIZE_MB=20

# Security
MANAGEMENT_TOKEN_SECRET=replace-with-random-secret
CODE_LENGTH=6

# Retention
DEFAULT_RETENTION=7d
```

---

## 17. Docker Compose 草案

```yaml
services:
  app:
    build:
      context: ./app
    container_name: zlide-app
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://app:password@db:5432/zlide
      UPLOAD_DIR: /data/uploads
      MAX_UPLOAD_SIZE_MB: 20
      APP_URL: https://zlide.app
    volumes:
      - ./data/uploads:/data/uploads
    depends_on:
      - db
    expose:
      - "3000"

  db:
    image: postgres:16
    container_name: zlide-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: zlide
      POSTGRES_USER: app
      POSTGRES_PASSWORD: password
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    expose:
      - "5432"

  caddy:
    image: caddy:latest
    container_name: zlide-caddy
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

---

## 18. Caddyfile 草案

```text
zlide.app {
  reverse_proxy app:3000

  header {
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "no-referrer"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
  }
}
```

---

## 19. 使用者測試計畫

### 19.1 測試對象

建議找以下使用情境的人測試：

- 會議簡報者
- 教師 / 講師
- 學生報告
- 活動講者
- 公司內部簡報者

### 19.2 測試任務

請測試者完成：

```text
1. 在自己的電腦上傳 PDF
2. 記下 Zlide 簡報代碼
3. 在另一台設備輸入代碼
4. 開啟簡報
5. 切換頁面
6. 進入全螢幕
7. 使用管理連結刪除簡報
```

### 19.3 觀察重點

- 是否知道下一步要做什麼？
- 是否能正確理解簡報代碼用途？
- 是否覺得比 USB 或雲端登入方便？
- 是否擔心簡報隱私？
- 是否需要更短或更長保存期限？
- 是否覺得 PDF viewer 夠用？
- 是否希望支援 QR Code？
- 是否希望之後有登入保存歷史？

---

## 20. 最終開發總結

Zlide 的開發方向可以收斂成一句話：

```text
先用 Oracle Cloud A1 VM 做出一個不登入、短期保存、輸入簡報代碼即可播放 PDF 的簡報 prototype。
```

第一版不要做太多功能，最重要的是完整跑通：

```text
上傳 PDF
→ 取得簡報代碼
→ 輸入簡報代碼
→ 開始簡報
→ 到期刪除
```

目前已進入 Release Candidate 準備階段，接下來應優先完成：

```text
1. zlide.app DNS 與 Caddy HTTPS
2. Oracle A1 VM Docker Compose 部署驗證
3. cleanup cron job
4. 端對端整合測試
5. Viewer 跨裝置測試
6. UI/UX 最終打磨
```
