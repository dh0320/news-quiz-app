# 地球人調査センター / Earth Observation Center

15分でニュースを学ぶビジュアルノベル型学習アプリ。ゾルク博士とピノがナビゲートする「地球人調査レポート」形式で、毎日のニュースを楽しく理解できます。

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## プロジェクト構成

```
news-quiz/
├── public/
│   └── assets/          # キャラクター画像
├── src/
│   ├── main.jsx         # エントリポイント
│   ├── App.jsx          # メインアプリケーション
│   └── data/
│       └── episodes/    # エピソードデータ (JSON)
├── index.html
├── package.json
└── vite.config.js
```

## テーマ

- **サイバー調** — デフォルト。ネオンカラーのSF調
- **和モダン怪奇** — 和風テイスト
- **コミック調** — ポップなアメコミ風

## 技術スタック

- React 18
- Vite
- Lucide React (アイコン)
