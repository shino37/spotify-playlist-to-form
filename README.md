### 使い方
#### 環境構築編
1. [Node.js](https://nodejs.org/ja/download)をインストールしよう
2. `npm install --save-dev typescript @types/node`でTypeScriptとモジュールをインストールしよう

#### Spotify API編
1. [Spotify for Developer](https://developer.spotify.com/)にサインインしよう
2. 右上のアカウントアイコンから、ダッシュボードを開こう
3. Create Appからアプリを作成しよう
    1. Redirect URIsは`http://127.0.0.1:3000`
    2. APIs usedは`Web API`
    3. あとは適当に
4. ダッシュボードを開いて作ったアプリを開くとClient IDとClient secretがあるよ
5. プロジェクト直下に.envファイルを作ってClient IDとClient secretを設定しよう
```.env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

#### Google Forms API編
1. Google Cloudのアカウントを作ろう
2. 左上のハンバーガーメニューから、APIとサービス＞ライブラリを選択しよう
3. Google Forms APIを検索して有効にしよう
4. 認証情報を作成から使用するAPIを選択、データの種類はユーザーデータを選択しよう
5. OAuth クライアント IDはデスクトップ アプリを選択しよう
6. クライアントの作成画面の下のボタンからJSONファイルをインストールしよう
7. スコープはフィルタからGoogle Forms APIを検索して全部選択しよう
8. OAuth同意画面の対象を開いて、テスト中で外部に公開しよう
9. テストユーザーに自分のメールアドレスを追加しよう
10. さっきインストールしたJSONファイルの名前をいい感じに変えてプロジェクト直下に置こう
11. .envにJSONファイルのパスを設定しよう
```.env
CREDENTIALS_PATH=./credentials.json
```

#### 実行編
```
npx tsc
node dist/main.js
```
