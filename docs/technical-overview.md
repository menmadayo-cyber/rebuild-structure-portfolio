# 技術概要

Rebuild Structureポートフォリオサイト（本リポジトリ）の技術構成・ディレクトリ構成・各フォルダの役割をまとめたもの。

## 技術構成

- HTML5・CSS3・必要最小限のVanilla JavaScriptのみで構成された、**ビルド処理不要の静的サイト**。
- フレームワーク・CSSライブラリ・npmパッケージへの依存なし。新しいライブラリやビルドツールは、明確な理由がない限り追加しない方針とする。
- CSSは`css/style.css`1本に集約し、`docs/design-system.md`のトークン（色・余白・フォントサイズ等）に準拠する。
- JavaScriptは`js/main.js`1本のみ。役割は (1) ヘッダー高さのCSS変数への反映 (2) スマートフォン用メニューの開閉（背景スクロール抑止・フォーカス移動を含む） (3) FAQの開閉、の3つに限定している。
- 公開用ファイルの選別のみ、`scripts/build-static.mjs`（Node.js標準機能のみ、npmパッケージ不要）が`dist/`を生成する。本番サイト（`https://rebuild-structure.jp`）は開発用のPrivateリポジトリからCloudflare Pagesへデプロイしており、本リポジトリはその技術構成を紹介する技術ポートフォリオ・ショーケースです（詳細は`docs/deployment-guide.md`）。

`works/ai-secretary-app.html`等、各制作事例ページで紹介しているNext.js・Google OAuth・Vercel・Make・Google Apps Script等の技術・ツールは、それぞれの事例（プロトタイプ・イベント運営システム等）で使用したものであり、本ポートフォリオサイト自体の実装には含まれない。各事例固有の使用技術は、対応する`works/*.html`内「使用技術・ツール」を参照。

## ディレクトリ構成

```
.
├── index.html                  トップページ（11セクション構成）
├── privacy.html                 プライバシーポリシー
├── 404.html                     404エラーページ
├── css/
│   └── style.css                全ページ共通スタイル（design-system.mdのトークンに準拠）
├── js/
│   └── main.js                  スマートフォンメニュー開閉／FAQ開閉のみ（必要最小限のJS）
├── assets/
│   ├── favicon.svg              ファビコン（写真不使用、抽象モノグラム）
│   └── works/                    実績詳細ページ用の画像（現行3作品分）
├── works/                       実績詳細ページ（3本）
│   ├── ai-secretary-app.html
│   ├── event-automation.html
│   └── make-automation-demo.html
├── templates/                    AI業務活用テンプレート（コピペで試せるプロンプト集。詳細は本ファイル「templatesの役割」参照）
│   ├── 01-work-analysis/
│   ├── 02-meeting-summary/
│   └── 03-writing-review/
├── docs/                        技術・運用ドキュメント（詳細は本ファイル「docsの役割」参照）
├── scripts/
│   └── build-static.mjs         公開用ファイルのみをdist/へ選別コピーするビルドスクリプト（docs/deployment-guide.md参照）
├── .gitignore
└── README.md
```

実績詳細ページで紹介しているスキルシートPDF・操作デモ動画は、本リポジトリには含めず、本番サイト（`https://rebuild-structure.jp`）上のファイルへ直接リンクしている（リポジトリの軽量化のため）。

## 主要ページ

| ページ | パス | 内容 |
|---|---|---|
| トップページ | `/index.html` | ファーストビュー〜サービス紹介〜事例〜プロフィール〜料金〜FAQ〜お問い合わせ導線までの1ページ完結構成 |
| AI秘書アプリ | `/works/ai-secretary-app.html` | 主力作品として紹介する自主制作のAI秘書Webアプリの詳細（自主制作のプロトタイプ） |
| スキーイベント運営のデジタル化・自動化 | `/works/event-automation.html` | 実際のイベント運営で使用した自動化事例の詳細 |
| Make等を用いた業務自動化デモ | `/works/make-automation-demo.html` | ノーコード連携ツールを使った自主制作デモの詳細 |
| プライバシーポリシー | `/privacy.html` | 個人情報の取り扱い方針 |
| 404ページ | `/404.html` | 存在しないパスへのアクセス時に表示（Cloudflare Pagesが自動使用） |

## `templates/`の役割

AI初心者・非エンジニアがコピペしてすぐ試せる、業務活用プロンプトのテンプレート集。READMEの「3｜AI業務活用テンプレート」から各`templates/<番号>-<名前>/README.md`へリンクしている。サイト本体（`index.html`等）とは独立しており、`scripts/build-static.mjs`の公開対象（allowlist）にも含まれないため、Cloudflare Pagesの公開サイトには反映されない（GitHubリポジトリ上でのみ閲覧される想定）。

## `docs/`の役割

技術構成・運用方法を理解するための詳細情報を格納する。以下の5ファイルを公開している。

| ファイル | 内容 |
|---|---|
| `technical-overview.md`（本ファイル） | 技術構成・ディレクトリ構成・各フォルダの役割 |
| `setup.md` | ローカル環境でのセットアップ・起動方法 |
| `deployment-guide.md` | GitHub → Cloudflare Pagesへのデプロイ手順・更新〜公開の流れ |
| `security.md` | APIキー・機密情報・個人情報の取り扱いに関する注意 |
| `design-system.md` | 色・余白・フォントサイズ等のデザイントークン |

## `works/`の役割

制作・支援事例の詳細ページ（3本）。トップページ「制作・支援事例」セクションから遷移する。
