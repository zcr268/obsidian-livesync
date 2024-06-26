# Self-hosted LiveSync

**旧): obsidian-livesync**

セルフホストしたデータベースを使って、双方向のライブシンクするObsidianのプラグイン。  
**公式のSyncとは互換性はありません**  
![obsidian_live_sync_demo](https://user-images.githubusercontent.com/45774780/137355323-f57a8b09-abf2-4501-836c-8cb7d2ff24a3.gif)

**インストールする前に、Vaultのバックアップを確実に取得してください**

[英語版](./README.md)

## こんなことができるプラグインです。
- Windows, Mac, iPad, iPhone, Android, Chromebookで動く
- セルフホストしたデータベースに同期して
- 複数端末で同時にその変更をほぼリアルタイムで配信し
- さらに、他の端末での変更も別の端末に配信する、双方向リアルタイムなLiveSyncを実現でき、
- 発生した変更の衝突はその場で解決できます。
- 同期先のホストにはCouchDBまたはその互換DBaaSのIBM Cloudantをサーバーに使用できます。あなたのデータは、あなたのものです。
- もちろんLiveではない同期もできます。
- 万が一のために、サーバーに送る内容を暗号化できます(betaです)。
-  [Webクリッパー](https://chrome.google.com/webstore/detail/obsidian-livesync-webclip/jfpaflmpckblieefkegjncjoceapakdf) もあります(End-to-End暗号化対象外です)

NDAや類似の契約や義務、倫理を守る必要のある、研究者、設計者、開発者のような方に特にオススメです。  
特にエンタープライズでは、たとえEnd to Endの暗号化が行われていても、管理下にあるサーバーにのみデータを格納することが求められる場合があります。  

# 重要なお知らせ

- ❌ファイルの重複や破損を避けるため、複数の同期手段を同時に使用しないでください。  
これは、Vaultをクラウド管理下のフォルダに置くことも含みます。(例えば、iCloudの管理フォルダ内に入れたり)。  
- ⚠️このプラグインは、端末間でのノートの反映を目的として作成されました。バックアップ等が目的ではありません。そのため、バックアップは必ず別のソリューションで行うようにしてください。
- ストレージの空き容量が枯渇した場合、データベースが破損することがあります。

# このプラグインの使い方

1. Community Pluginsから、Self-holsted LiveSyncと検索しインストールするか、このリポジトリのReleasesから`main.js`, `manifest.json`, `style.css` をダウンロードしvaultの中の`.obsidian/plugins/obsidian-livesync`に入れて、Obsidianを再起動してください。
2. サーバーをセットアップします。IBM Cloudantがお手軽かつ堅牢で便利です。完全にセルフホストする際にはお持ちのサーバーにCouchDBをインストールする必要があります。詳しくは下記を参照してください
  1. [IBM Cloudantのセットアップ](docs/setup_cloudant_ja.md)
  2. [独自のCouchDBのセットアップ](docs/setup_own_server_ja.md)

備考： IBM Cloudantのアカウント登録が出来ないケースがあるようです。代替を探していて、今 [using fly.io](https://github.com/vrtmrz/obsidian-livesync/discussions/85)を検討しています。

1. [Quick setup](docs/quick_setup_ja.md)から、セットアップウィザード使ってセットアップしてください。

# テストサーバー

もし、CouchDBをインストールしたり、Cloudantのインスタンスをセットアップしたりするのに気が引ける場合、[Self-hosted LiveSyncのテストサーバー](https://olstaste.vrtmrz.net/)を作りましたので、使ってみてください。

備考: 制限事項をよく確認して使用してください。くれぐれも、本当に使用している自分のVaultを同期しないようにしてください。

# WebClipperあります
Self-hosted LiveSync用にWebClipperも作りました。Chrome Web Storeからダウンロードできます。

[obsidian-livesync-webclip](https://chrome.google.com/webstore/detail/obsidian-livesync-webclip/jfpaflmpckblieefkegjncjoceapakdf)

リポジトリはこちらです: [obsidian-livesync-webclip](https://github.com/vrtmrz/obsidian-livesync-webclip)。

相変わらずドキュメントは間に合っていません。

# ステータスバーの情報
右下のステータスバーに、同期の状態が表示されます

- 同期状態
  - ⏹️ 同期は停止しています
  - 💤 同期はLiveSync中で、なにか起こるのを待っています
  - ⚡️ 同期中です
  - ⚠ エラーが発生しています
- ↑ 送信したデータ数
- ↓ 受信したデータ数
-   ⏳ 保留している処理の数です  
ファイルを削除したりリネームした場合、この表示が消えるまでお待ちください。

# さらなる補足
- ファイルは同期された後、タイムスタンプを比較して新しければいったん新しい方で上書きされます。その後、衝突が発生したかによって、マージが行われます。
- まれにファイルが破損することがあります。破損したファイルに関してはディスクへの反映を試みないため、実際には使用しているデバイスには少し古いファイルが残っていることが多いです。そのファイルを再度更新してもらうと、データベースが更新されて問題なくなるケースがあります。ファイルがどの端末にも存在しない場合は、設定画面から、削除できます。
- データベースの復旧中に再起動した場合など、うまくローカルデータベースを修正できない際には、Vaultのトップに`redflag.md`というファイルを置いてください。起動時のシーケンスがスキップされます。
- データベースが大きくなってきてるんだけど、小さくできる？→各ノートは、それぞれの古い100リビジョンとともに保存されています。例えば、しばらくオフラインだったあるデバイスが、久しぶりに同期したと想定してみてください。そのとき、そのデバイスは最新とは少し異なるリビジョンを持ってるはずです。その場合でも、リモートのリビジョン履歴にリモートのものが存在した場合、安全にマージできます。もしリビジョン履歴に存在しなかった場合、確認しなければいけない差分も、対象を存在して持っている共通のリビジョン以降のみに絞れます。ちょうどGitのような方法で、衝突を解決している形になるのです。そのため、肥大化したリポジトリの解消と同様に、本質的にデータベースを小さくしたい場合は、データベースの作り直しが必要です。
- その他の技術的なお話は、[技術的な内容](docs/tech_info_ja.md)に書いてあります。


# ライセンス

The source code is licensed MIT.
 