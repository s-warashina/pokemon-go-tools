# Pokemon GO IV Hex Calculator

[![Typecheck](https://github.com/s-warashina/pokemon-go-tools/actions/workflows/typecheck.yml/badge.svg)](https://github.com/s-warashina/pokemon-go-tools/actions/workflows/typecheck.yml)

ポケモンGOの個体値(こうげき・ぼうぎょ・HP)を16進数で入力し、合計値とIV%を計算する静的Webアプリです。  
例: `FFF` → 15 + 15 + 15 = 45 / 45 → 100%

## 使い方

```bash
bun run build
```

`dist/` にHTML/CSS/JSが出力されます。

```bash
bun run preview
```

`dist/` をローカルで確認できます。

## 仕様

- 入力は0-9 / A-Fのみ (大文字化)
- 3項目の合計を45で割ってIV%を算出
- `FFF` を1つの欄に貼り付けると3項目に分割

## GitHub Pages

GitHub Pagesを使う場合は、以下のどちらかが必要です。

1. `dist/` をGitHub Actionsでデプロイ
2. 出力先を `docs/` に変更してPages設定で `docs/` を公開
