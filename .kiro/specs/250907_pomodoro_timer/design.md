# ポモドーロタイマー機能 設計書

## 概要

ポモドーロタイマー機能は、既存の画面スリープ防止Webアプリケーションに追加される新機能です。25分の作業時間と5分の休憩時間を自動管理し、効率的な時間管理を支援します。既存のアーキテクチャ（Vue 3 + TypeScript + Tailwind CSS）を活用し、Wake Lock機能との統合を図ります。

## アーキテクチャ

### ルーティング構成
```
/ (ホーム)
├── /clock (時計機能)
└── /pomodoro (ポモドーロタイマー) ← 新規追加
```

### コンポーネント階層
```
PomodoroView.vue
├── WakeLockControl.vue (既存コンポーネント再利用)
└── PomodoroTimer.vue (新規作成)
    ├── TimerDisplay.vue (新規作成)
    ├── TimerControls.vue (新規作成)
    └── SessionInfo.vue (新規作成)
```

## コンポーネントとインターフェース

### 1. PomodoroView.vue
**責務**: ポモドーロタイマーページの全体レイアウト
- Wake Lock制御セクション
- ポモドーロタイマーセクション
- 既存のClockView.vueと同様の構造

### 2. PomodoroTimer.vue
**責務**: ポモドーロタイマーのメインロジックとUI統合
- タイマー状態管理
- 子コンポーネントの統合
- アラーム制御

### 3. TimerDisplay.vue
**責務**: タイマーの視覚的表示
- 残り時間の表示（MM:SS形式）
- 現在のセッション種別表示（作業時間/休憩時間）
- 進行状況の視覚的インジケーター

### 4. TimerControls.vue
**責務**: タイマー操作ボタン
- スタート/ストップ/再開ボタン
- リセットボタン
- ボタン状態の動的変更

### 5. SessionInfo.vue
**責務**: セッション情報の表示
- 現在のサイクル数
- セッション種別の詳細表示

## データモデル

### PomodoroState インターフェース
```typescript
interface PomodoroState {
  // タイマー状態
  isRunning: boolean
  isPaused: boolean
  
  // 時間管理
  remainingTime: number // 秒単位
  totalTime: number // 秒単位
  
  // セッション管理
  sessionType: 'work' | 'break'
  cycleCount: number
  
  // 設定
  workDuration: number // デフォルト: 25分 (1500秒)
  breakDuration: number // デフォルト: 5分 (300秒)
}
```

### TimerConfig インターフェース
```typescript
interface TimerConfig {
  workDuration: number
  breakDuration: number
  alarmDuration: number // デフォルト: 3秒
}
```

## コンポーザブル設計

### usePomodoro.ts
**責務**: ポモドーロタイマーのコアロジック

**主要メソッド**:
- `startTimer()`: タイマー開始
- `pauseTimer()`: タイマー一時停止
- `resumeTimer()`: タイマー再開
- `resetTimer()`: タイマーリセット
- `switchSession()`: セッション切り替え（作業↔休憩）

**リアクティブ状態**:
- `state`: PomodoroState
- `formattedTime`: 表示用フォーマット済み時間
- `isWorkSession`: 作業時間かどうか
- `isBreakSession`: 休憩時間かどうか

### useAudio.ts
**責務**: アラーム音の管理

**主要メソッド**:
- `playAlarm()`: アラーム音再生
- `stopAlarm()`: アラーム音停止
- `setVolume(volume: number)`: 音量設定

## エラーハンドリング

### タイマー関連エラー
1. **ブラウザタブ非アクティブ時の精度低下**
   - Web Workers使用を検討
   - 復帰時の時間補正機能

2. **音声再生エラー**
   - ブラウザの自動再生ポリシー対応
   - ユーザー操作後の音声テスト

3. **Wake Lock統合エラー**
   - 既存のuseWakeLock.tsのエラーハンドリングを活用
   - 互換性チェック機能の再利用

### エラー表示戦略
- 非破壊的なトースト通知
- 機能継続可能なグレースフルデグラデーション

## テスト戦略

### 1. 単体テスト
**対象**: コンポーザブル関数
- `usePomodoro.ts`の各メソッド
- `useAudio.ts`の音声制御
- タイマー状態遷移のテスト

**テストケース例**:
```typescript
describe('usePomodoro', () => {
  test('作業時間終了時に休憩時間に自動切り替え', () => {
    // テストロジック
  })
  
  test('リセット時に初期状態に戻る', () => {
    // テストロジック
  })
})
```

### 2. コンポーネントテスト
**対象**: Vue コンポーネント
- ボタンクリック時の状態変更
- プロップスとイベントの正常動作
- 条件付きレンダリングの検証

### 3. 統合テスト
**対象**: 機能全体の動作
- タイマー完了からセッション切り替えまでの流れ
- Wake Lock機能との連携
- ルーティング動作

## UI/UXデザイン

### レスポンシブデザイン
- **モバイル**: 縦向きレイアウト、大きなボタン
- **タブレット**: 横向き対応、適度な余白
- **デスクトップ**: 中央配置、視認性重視

### カラーテーマ
- **作業時間**: 青系（集中を促す色）
- **休憩時間**: 緑系（リラックスを促す色）
- **警告/エラー**: 赤系（既存デザインと統一）

### アニメーション
- タイマー切り替え時のスムーズな遷移
- ボタン状態変更時のフィードバック
- 進行状況の視覚的表現（プログレスバー）

## パフォーマンス考慮事項

### タイマー精度
- `setInterval`の代わりに`requestAnimationFrame`使用を検討
- バックグラウンドタブでの動作保証

### メモリ管理
- タイマーの適切なクリーンアップ
- コンポーネント破棄時のリソース解放

### 音声リソース
- 軽量な音声ファイル使用
- 遅延読み込み対応

## セキュリティ考慮事項

### 音声再生
- ユーザー操作後の再生（ブラウザポリシー準拠）
- 音声ファイルの適切な配信

### Wake Lock統合
- 既存のセキュリティ実装を継承
- 権限要求の適切な処理

## 既存機能との統合

### Wake Lock機能
- `useWakeLock.ts`コンポーザブルの再利用
- `WakeLockControl.vue`コンポーネントの配置
- 既存のエラーハンドリング機能の活用

### ナビゲーション
- `HomeView.vue`にポモドーロタイマーカード追加
- ルーティング設定の拡張
- 既存のナビゲーションパターンの踏襲

### スタイリング
- Tailwind CSSクラスの一貫した使用
- 既存コンポーネントとの視覚的統一性
- アクセシビリティ対応の継承