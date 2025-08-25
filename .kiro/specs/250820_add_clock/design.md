# デザイン仕様書：時計表示機能

## 概要

既存の画面スリープ防止Webアプリケーションに、ルーティング機能とデジタル時計表示機能を追加する。アプリケーションを単一機能から多機能対応のハブ＆スポークモデルに拡張し、将来的な機能追加を容易にする。

## アーキテクチャ

### 現在の構造
- 単一ページアプリケーション（SPA）
- Vue 3 + TypeScript + Vite
- Tailwind CSS for styling
- 既存のWake Lock機能（`useWakeLock`コンポーザブル）

### 新しい構造
```
src/
├── main.js                 # アプリケーションエントリーポイント（ルーター設定追加）
├── App.vue                 # ルートコンポーネント（ルーター表示用に変更）
├── router/
│   └── index.ts           # Vue Routerの設定
├── views/                 # ページレベルコンポーネント
│   ├── HomeView.vue       # トップページ（既存機能 + 機能選択）
│   └── ClockView.vue      # 時計表示ページ
├── components/
│   ├── layout/
│   │   └── AppNavigation.vue  # ナビゲーションコンポーネント
│   ├── clock/
│   │   └── DigitalClock.vue   # デジタル時計コンポーネント
│   └── [既存コンポーネント]
└── composables/
    ├── useWakeLock.ts     # 既存（再利用）
    └── useClock.ts        # 時計機能用コンポーザブル
```

## コンポーネントとインターフェース

### 1. ルーティング設定

**Router Configuration (`src/router/index.ts`)**
```typescript
interface RouteConfig {
  path: string
  name: string
  component: Component
  meta?: {
    title: string
    requiresWakeLock?: boolean
  }
}
```

**ルート定義:**
- `/` - HomeView（トップページ）
- `/clock` - ClockView（時計表示ページ）

### 2. レイアウトコンポーネント

**AppNavigation (`src/components/layout/AppNavigation.vue`)**
- 機能間のナビゲーション
- 現在のページ表示
- 戻るボタン機能

**Props:**
```typescript
interface NavigationProps {
  showBackButton?: boolean
  currentPageTitle?: string
}
```

### 3. 時計関連コンポーネント

**DigitalClock (`src/components/clock/DigitalClock.vue`)**
- デジタル時計の表示
- リアルタイム更新
- レスポンシブデザイン

**Props:**
```typescript
interface ClockProps {
  format?: '24h' | '12h'  // デフォルト: '24h'
  showDate?: boolean      // デフォルト: true
  size?: 'small' | 'medium' | 'large'  // デフォルト: 'large'
}
```

**Emits:**
```typescript
interface ClockEmits {
  timeUpdate: (time: Date) => void
}
```

### 4. ページコンポーネント

**HomeView (`src/views/HomeView.vue`)**
- 既存のWake Lock機能
- 機能選択カード（時計機能への誘導）
- アプリケーション説明

**ClockView (`src/views/ClockView.vue`)**
- DigitalClockコンポーネントの表示
- 自動Wake Lock有効化
- ナビゲーション

## データモデル

### 時計データ構造
```typescript
interface ClockData {
  currentTime: Date
  formattedTime: string
  formattedDate: string
  isRunning: boolean
}

interface ClockFormat {
  timeFormat: '24h' | '12h'
  dateFormat: 'short' | 'long'
  locale: string
}
```

### ルーティング状態
```typescript
interface RouteState {
  currentRoute: string
  previousRoute?: string
  pageTitle: string
  requiresWakeLock: boolean
}
```

## エラーハンドリング

### 1. Wake Lock エラー
- 既存の`useWakeLock`のエラーハンドリングを再利用
- 時計ページでのWake Lock失敗時の適切なフィードバック

### 2. ルーティングエラー
- 存在しないルートへのアクセス時の404ハンドリング
- ナビゲーション失敗時のフォールバック

### 3. 時計機能エラー
- タイマー機能の失敗時の復旧処理
- 時刻取得エラーの処理

## テスト戦略

### 1. ユニットテスト
- `useClock`コンポーザブルのテスト
- `DigitalClock`コンポーネントのテスト
- ルーター設定のテスト

### 2. 統合テスト
- ページ間ナビゲーションのテスト
- Wake Lock機能との統合テスト
- レスポンシブデザインのテスト

### 3. E2Eテスト
- ユーザーフローのテスト（トップページ → 時計ページ → 戻る）
- Wake Lock自動有効化/無効化のテスト
- 時計表示の正確性テスト

## 技術的な実装詳細

### 1. Vue Router導入
```bash
npm install vue-router@4
```

### 2. 時計機能の実装方針
- `setInterval`を使用したリアルタイム更新
- `Date`オブジェクトを使用した時刻取得
- `Intl.DateTimeFormat`を使用したローカライゼーション

### 3. Wake Lock統合
- 既存の`useWakeLock`コンポーザブルを再利用
- 時計ページのマウント時に自動有効化
- アンマウント時に自動無効化

### 4. スタイリング方針
- 既存のTailwind CSSクラスを継続使用
- 時計表示用の大きなフォントサイズクラス
- レスポンシブブレークポイントの活用

### 5. パフォーマンス考慮事項
- 時計更新の最適化（1秒間隔の正確な制御）
- 不要な再レンダリングの防止
- メモリリークの防止（タイマーのクリーンアップ）