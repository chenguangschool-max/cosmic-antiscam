# 🌌 宇宙防詐任務

防詐騙教育遊戲，用 AI 即時生成題目、30 隻怪物圖鑑、雙軌解鎖系統。

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定 API Key
複製 `.env.example` 為 `.env.local`，填入你的 Anthropic API Key：
```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```
VITE_ANTHROPIC_API_KEY=sk-ant-你的API_Key
```

> API Key 申請：https://console.anthropic.com

### 3. 啟動開發伺服器
```bash
npm run dev
```

瀏覽器開啟 http://localhost:5173

---

## 🎮 遊戲功能

- **AI 題目生成**：每局 10 題，60% 詐騙題，每次不同
- **4 種模式**：新手／高手／教育／假日
- **30 隻怪物圖鑑**：α/β/γ/δ/Ω 五大系列，未解鎖顯示神秘代號
- **雙軌解鎖**：升等自動免費解鎖，或花金幣提前解鎖
- **道具商店**：9 種道具（冷靜龜、防護盾、跳題卡等）
- **升級系統**：答題獲得 XP，升等解鎖新怪物

---

## 🔧 專案結構

```
src/
├── App.jsx              # 頁面路由
├── GameContext.jsx      # 全域遊戲狀態
├── data.js              # 怪物、道具、模式資料
├── index.css            # 全域樣式 + 動畫
├── components/
│   ├── Stars.jsx        # 星空背景
│   ├── Toast.jsx        # 提示訊息
│   └── UnlockOverlay.jsx# 怪物解鎖動畫
└── pages/
    ├── MainMenu.jsx     # 主選單
    ├── ModeSelect.jsx   # 選擇模式
    ├── Quiz.jsx         # 答題系統（串接 AI）
    ├── Result.jsx       # 結算頁面
    ├── Codex.jsx        # 怪物圖鑑
    ├── Shop.jsx         # 道具商店
    └── Login.jsx        # 登入頁面
```

---

## 🔌 加入 Firebase（可選）

在 `Login.jsx` 中替換 `fakeLogin()` 為真實 Firebase Auth：

```bash
npm install firebase
```

參考 Firebase 文件：https://firebase.google.com/docs/auth

---

## 📦 打包部署

```bash
npm run build
```

輸出到 `dist/` 資料夾，可部署到 Vercel / Netlify / Firebase Hosting。
