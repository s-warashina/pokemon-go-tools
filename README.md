# Pokemon GO IV Hex Calculator

[![Typecheck](https://github.com/s-warashina/pokemon-go-tools/actions/workflows/typecheck.yml/badge.svg)](https://github.com/s-warashina/pokemon-go-tools/actions/workflows/typecheck.yml)

ポケモンGOの個体値(こうげき・ぼうぎょ・HP)を16進数で入力し、合計値とIV%を計算する静的Webアプリです。  
例: `FFF` → 15 + 15 + 15 = 45 / 45 → 100%

## セットアップ

```bash
bun install
```

## 使い方

```bash
bun run build
```

`dist/` にHTML/CSS/JSが出力されます。

```bash
bun run preview
```

`dist/` をローカルで確認できます。

```bash
bun run typecheck
```

型チェックのみ実行します。

## 仕様

- こうげき・ぼうぎょ・HPは0-9 / A-Fの1桁入力 (大文字化)
- どこかの欄に `FFF` のような3桁を貼り付けると3項目に分割
- スライダー入力にも対応 (0-15)
- 合計は0-45、IV%は合計/45で算出
- IV%は整数表示し、括弧内に小数1桁を表示

## GitHub Pages

GitHub Pagesを使う場合は、以下のどちらかが必要です。

1. `dist/` をGitHub Actionsでデプロイ
2. 出力先を `docs/` に変更してPages設定で `docs/` を公開

## CI

- `.github/workflows/pages.yml` でGitHub Pagesにデプロイ
- `.github/workflows/typecheck.yml` で型チェック
