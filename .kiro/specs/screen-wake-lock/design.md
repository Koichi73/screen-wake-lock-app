# Design Document

## Overview

画面をスリープさせないwebアプリケーションは、Screen Wake Lock APIを使用してデバイスの画面が自動的にスリープモードに入ることを防ぎます。ユーザーフレンドリーなインターフェースと適切なエラーハンドリング、ブラウザ互換性チェックを提供します。

## Architecture

### Core Components
- **App.vue**: メインアプリケーションコンポーネント
- **WakeLockToggle.vue**: Wake Lockトグル機能コンポーネント
- **WarningModal.vue**: 注意書きモーダルコンポーネント
- **useWakeLock**: Wake Lock APIの管理を行うComposable
- **Compatibility Checker**: ブラウザサポートの検証ユーティリティ

### Technology Stack
- **Frontend Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite for fast development and building
- **API**: Screen Wake Lock API (navigator.wakeLock)
- **Styling**: Tailwind CSS for utility-first styling and responsive design
- **Package Manager**: npm/yarn

## Components and Interfaces

### useWakeLock Composable
```typescript
interface UseWakeLock {
  isActive: Ref<boolean>
  isSupported: Ref<boolean>
  error: Ref<string | null>
  requestWakeLock(): Promise<void>
  releaseWakeLock(): Promise<void>
  toggleWakeLock(): Promise<void>
}
```

### App.vue
```vue
<template>
  <!-- Main application layout -->
</template>
<script setup>
// Main app logic and component orchestration
</script>
```

### WakeLockToggle.vue
```vue
<template>
  <!-- Toggle button and status display -->
</template>
<script setup>
// Wake lock toggle functionality
</script>
```

### WarningModal.vue
```vue
<template>
  <!-- Modal with warning message and confirmation -->
</template>
<script setup>
// Modal display and confirmation logic
</script>
```

### Compatibility Checker
```typescript
export const isWakeLockSupported = (): boolean => {
  return 'wakeLock' in navigator
}

export const getUnsupportedMessage = (): string => {
  return 'このブラウザはScreen Wake Lock APIをサポートしていません'
}
```

## Data Models

### Wake Lock State
```javascript
interface WakeLockState {
  isActive: boolean
  wakeLockSentinel: WakeLockSentinel | null
  hasShownWarning: boolean
}
```

### UI State
```javascript
interface UIState {
  buttonText: string
  statusText: string
  isModalVisible: boolean
}
```

## Error Handling

### Browser Compatibility
- Screen Wake Lock API未サポートブラウザの検出
- 代替手段の提案またはエラーメッセージの表示

### API Errors
- Wake Lock取得失敗時のエラーハンドリング
- ユーザーフレンドリーなエラーメッセージの表示
- 自動的な状態リセット

### User Experience
- 非同期操作中のローディング状態
- 明確なフィードバックメッセージ
- エラー発生時の適切な状態復旧

## Testing Strategy

### Unit Tests
- Wake Lock Manager の各メソッドのテスト
- UI Controller の状態管理テスト
- Modal Manager の表示/非表示ロジックテスト
- Compatibility Checker の検証ロジックテスト

### Integration Tests
- Wake Lock API との統合テスト
- UI コンポーネント間の連携テスト
- エラーシナリオの統合テスト

### Browser Compatibility Tests
- Chrome, Firefox, Safari, Edge での動作確認
- モバイルブラウザでの動作確認
- 未サポートブラウザでの適切なフォールバック確認

### User Acceptance Tests
- トグル機能の動作確認
- モーダル表示と確認フローのテスト
- 状態表示の正確性確認
- エラーメッセージの適切性確認

## Implementation Details

### Modal Design
- Tailwind CSSを使用したオーバーレイ背景でページをブロック
- 中央配置のモーダルボックス（`fixed inset-0 flex items-center justify-center`）
- 日本語での注意書きテキスト
- Tailwind CSSでスタイリングされた「理解した」ボタンでの確認
- レスポンシブデザイン対応（`sm:`, `md:`, `lg:` ブレークポイント）

### State Management
- Vue 3 Composition APIのreactiveな状態管理
- useWakeLock ComposableでWake Lockの状態を管理
- コンポーネント間でのprops/emitsによる状態共有
- モーダル表示状態のリアクティブ管理

### Event Handling
- Vue 3のイベントハンドリング（@click, @submit等）
- Wake Lock 解除イベントの監視（addEventListener）
- コンポーネント間のカスタムイベント（emit）
- モーダル確認ボタンのイベント処理

### Responsive Design
- Tailwind CSSのレスポンシブユーティリティを活用
- モバイルデバイスでの適切な表示（`mobile-first` アプローチ）
- タッチインターフェースの考慮（適切なボタンサイズとタップターゲット）
- 画面サイズに応じたレイアウト調整（`sm:`, `md:`, `lg:` ブレークポイント）

### Styling Architecture
- Tailwind CSSのユーティリティクラスを使用
- カスタムCSSは最小限に抑制
- コンポーネントベースのクラス構成
- ダークモード対応の考慮（`dark:` プレフィックス）