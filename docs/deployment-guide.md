# デプロイガイド｜GitHub + Cloudflare Pages

> **本リポジトリ（Public版）について**：本番サイト（`https://rebuild-structure.jp`）は、開発用のPrivateリポジトリからCloudflare Pagesへデプロイしています。本Public repositoryへのpushが本番環境に反映されることはありません。本リポジトリは技術ポートフォリオ・ショーケース用として、実際の本番運用で採用しているGitHub + Cloudflare Pagesの構成・考え方を紹介するものです。

本ドキュメントは、本サイト（HTML・CSS・必要最小限のVanilla JavaScriptのみで構成された静的サイト）をGitHubで管理し、Cloudflare Pagesで公開する構成の説明。

**公開フロー**：

```
GitHub（ソース一式：index.html / css / js / assets / works / docs / README等）
  ↓ pushをトリガーにCloudflare Pagesが起動
Cloudflareが node scripts/build-static.mjs を実行
  ↓ 公開対象ファイルのみを選別
dist/ に公開用ファイルだけを生成（index.html・privacy.html・404.html・css/・js/・assets/・works/）
  ↓
Cloudflare Pagesは dist/ の内容を rebuild-structure.jp（独自ドメイン）で公開
```

`docs/`・`README.md`・`scripts/`等はGitHubリポジトリには残るが、`scripts/build-static.mjs`によって`dist/`へはコピーされないため、Cloudflare Pagesの公開URLからは参照できない。詳細は`scripts/build-static.mjs`のallowlistを参照。

**公開URL**：

| URL | 位置づけ |
|---|---|
| `https://rebuild-structure.jp/` | 正式URL。canonical・OGP・外部への案内・SEO上の正としてはこちらを使用する。 |
| `https://rebuild-structure.pages.dev/` | Cloudflare Pages標準URL（システム側URL）。カスタムドメイン設定後も存在するが、公開HTML内のcanonical・og:url等には使用しない。 |

独自ドメインはCloudflare Pages側でカスタムドメインとして設定済み・SSL有効・Activeである。

---

## 1. GitHubリポジトリ作成後に行う作業の順序

1. **リポジトリ作成**：GitHub上でリポジトリを新規作成する（Public/Privateはブランド公開方針に応じて選択）。READMEやライセンスファイルは自動生成せず、ローカルリポジトリの内容をそのままプッシュする。
2. **ローカルをgit管理下に置く**：ローカルで`git init`し、`.gitignore`が機能していることを確認したうえで最初のコミットを作成する（コミット前の確認手順は本書末尾および`docs/security.md`を参照）。
3. **リモート登録・プッシュ**：作成したGitHubリポジトリをリモートに登録し、mainブランチをプッシュする。
4. **プッシュ後の確認**：GitHub上でファイル一覧・ディレクトリ構成が意図通りか（`node_modules`等の不要フォルダが混ざっていないか、`.gitignore`対象が除外されているか）を確認する。
5. **Cloudflare Pagesとの連携**：本書2章の手順に進む。
6. **公開確認**：本書5章の「公開後の動作確認項目」を実施する。
7. **ドメイン設定の変更**：ドメインを変更する場合は本書4章に従い、canonical・OGP等の記載を更新して再デプロイする。

以降、ページを追加・更新するたびに「ローカルで編集 → コミット → プッシュ」を行うと、Cloudflare Pagesが自動でビルド・再公開する（3章参照）。

---

## 2. Cloudflare Pagesで静的サイトとして公開する際の確認事項

1. Cloudflareアカウントで「Workers & Pages」からプロジェクトを新規作成し、連携するGitHubリポジトリを選択する。
2. **フレームワークプリセット**は「None（フレームワークなし）」を選択する。
3. **ビルドコマンド**は `node scripts/build-static.mjs` を指定する（Node標準機能のみで動作、npm installは不要）。
4. **ビルド出力ディレクトリ**は `dist` を指定する。`scripts/build-static.mjs`が生成する公開用ファイルのみを含むディレクトリであり、`docs/`等の内部資料は含まれない。
5. **ルートディレクトリ（プロジェクトのルート）**はリポジトリ直下のままでよい（`scripts/build-static.mjs`はリポジトリ直下から`dist/`を生成する前提）。
6. 環境変数・シークレットの設定は本サイトでは不要（フォーム送信やAPI連携を実装した場合のみ、その時点で個別に検討する）。
7. デプロイ完了後、Cloudflareが自動発行するプレビューURL（`https://<project-name>.pages.dev/`）でアクセスできることを確認する。
8. `404.html`が実際に存在しないパスへのアクセス時に表示されるかを確認する（Cloudflare Pagesは、ルート直下の`404.html`を自動的にカスタム404ページとして使用する）。

---

## 3. 独自ドメインでの公開確認

- Cloudflare Pagesが自動発行する`*.pages.dev`のURLでも表示・動作の確認ができる。
- mainブランチへのプッシュのたびに自動で再デプロイされ、プレビューURLが更新される。プルリクエスト単位のプレビューURLも自動生成されるため、大きな変更はブランチを切って確認してからマージする運用も可能。

---

## 4. 独自ドメインを変更・追加する場合

1. **canonical・OGP等の更新**：`index.html`・`privacy.html`・`works/*.html`の`<link rel="canonical">`・`og:url`・フッター表記を実ドメインに合わせて更新する。
2. **Cloudflare Pagesでのカスタムドメイン設定**：Cloudflare Pagesプロジェクトの設定画面から独自ドメインを追加し、DNS（Cloudflareでドメインを管理している場合は自動、外部レジストラの場合はCNAME/DNSレコードを手動追加）を設定する。
3. **`robots.txt`／`sitemap.xml`の更新**：`sitemap.xml`に公開ページ一覧（`index.html`・`privacy.html`・`works/`配下3ページ）を実ドメインの絶対URLで記載し、`robots.txt`から参照する。

更新後は再度コミット・プッシュし、Cloudflare Pagesの自動再デプロイを待つ。

---

## 5. 公開後の動作確認項目

初回公開時・設定変更後の再公開時の両方で実施する。

### 基本動作
- [ ] トップページ（`/`）が表示される
- [ ] 主要ページ（`/privacy.html`、`/works/ai-secretary-app.html`、`/works/event-automation.html`、`/works/make-automation-demo.html`）がそれぞれ表示される
- [ ] 存在しないURL（例：`/no-such-page`）で`404.html`の内容が表示される
- [ ] グローバルナビ・パンくずリスト・フッターの内部リンクが正しい遷移先に移動する
- [ ] スマートフォン用メニューの開閉、FAQの開閉が動作する

### メタ情報
- [ ] ページソース上で`<link rel="canonical">`・OGPタグが実ドメインを指している
- [ ] ブラウザのタブタイトル・検索結果プレビュー（Google Search Console等、導入していれば）でタイトル・descriptionが意図通り表示される

### パフォーマンス・技術面
- [ ] HTTPS（Cloudflare Pagesは既定で有効）でアクセスできる
- [ ] 主要ブラウザ（Chrome・Safari・Edge）で表示崩れがない
- [ ] ブラウザのコンソールにJavaScriptエラーが出ていない
- [ ] `robots.txt`・`sitemap.xml`を追加した場合、`/robots.txt`・`/sitemap.xml`にアクセスして正しく返る

---

## 6. 日常的な更新〜公開の流れ（初回セットアップ後）

初回のGitHub連携・Cloudflare Pages連携（1〜2章）が完了した後、2回目以降のコンテンツ更新は以下の流れで行う。

1. ローカルで編集し、`docs/setup.md`記載のローカルサーバーで表示・動作を確認する。
2. `git status`で変更内容を確認し、意図した差分のみが含まれているかを確認する。
3. 意味のある単位でコミットする（例：`git commit -m "実績カードを追加"`）。
4. GitHubリポジトリへプッシュする（`git push`）。
5. Cloudflare Pagesと連携済みであれば、プッシュ後に自動で`node scripts/build-static.mjs`が実行され再公開される。
6. 公開後、対象ページを実際に開いて表示・リンクを確認する（本書5章のチェックリスト参照）。
