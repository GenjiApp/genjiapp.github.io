---
title: OS XのEPUB用Spotlight/Quick Lookプラグインを作り直した
layout: post
tags: [macos, dev, cocoa, ebook, release]
---

　OS XのEPUB用Spotlight/Quick Lookプラグインを作り直した。

- [GenjiApp/EPUB-Plugins](https://github.com/GenjiApp/EPUB-Plugins)
  - [バイナリィのダウンロード](https://github.com/GenjiApp/EPUB-Plugins/releases/tag/v1.0)

　システム要件はとりあえずOS X 10.10以上。

　上記のバイナリィダウンロードのページからZIPをダウンロード・解凍し、所定のパスへ配置することでインストール。Spotlightプラグイン（EPUB.mdimporter）は、

- `~/Library/Spotlight` （カレントユーザのみ）
- `/Library/Spotlight` （すべてのユーザ）

Quick Lookプラグイン（EPUB.qlgenerator）は、

- `~/Library/QuickLook` （カレントユーザのみ）
- `/Library/QuickLook` （すべてのユーザ）

　プラグイン同梱版の[Murasaki](/mac/murasaki/)をインストールしている場合は、そちらが優先される可能性がある。そのときはFinderからMurasakiを選択して、コンテキストメニューの「パッケージの内容を表示」で中身を開いて、パッケージ内の`Library`フォルダを削除もしくはリネームする。

　プラグインをシステムに認識させるには、Macを再起動すると手数としては手っ取り早い。CLIが使えるならば、

```
$ mdimport -r /path/to/EPUB.mdimport
$ qlmanage -r
```

を実行する。

　この新しいプラグインをいつMurasakiに同梱するかは未定である。

　これまでMurasakiに同梱していたものと比べて、変更点は以下の通り。

## Spotlightプラグイン

　EPUB仕様のヴァージョン文字列（2.0とか3.0）をメタデータとして収集し、検索対象になった。メタデータの内部項目名は「`com_genjiapp_Murasaki_mdimporter_EPUB_EPUBVersion`」で、表示名は「EPUB Version」および「EPUB バージョン」。たとえばターミナルで

```$ mdfind "com_genjiapp_Murasaki_mdimporter_EPUB_EPUBVersion = '3.0'"```

とすれば、EPUB仕様のヴァージョンが`3.0`のもののみが検索できる。FinderウィンドウからのSpotlight検索ならGUIで条件指定可能。

　Finderの「情報を見る」ウィンドウにEPUBのメタデータが表示されるようになった。

![](/blog/img/20150404/get-info.png)

　「情報を見る」ウィンドウでのプレヴューは表紙画像のみ。

## Quick Lookプラグイン

　各コンテントドキュメント（EPUB内部のXHTML）で指定されたスタイルをできるだけ保ちつつ、以前のものより表示品質を上げた（つもり）。コンテントドキュメントとしてXHTMLではなく画像ファイルが直接指定されているEPUBのプレヴューもできるようになった。

![](/blog/img/20150404/quick-look.png)

　Spotlight検索からのQuick Lookプレヴューは以下のような感じ。Spotlight検索でEPUBだけを対象にしたい場合は、以下の画像のように`kind:epub`という条件を加えると良い。

![](/blog/img/20150404/spotlight.png)

　赤線による強調は画像処理による。画像のようにEPUB内の単語でSpotlight検索できていることが解る。

### `style`要素の`scoped`属性

　Quick Lookでファイルをプレヴューさせる場合、プラグインはファイルの内容を取得・加工し、標準的な形式（画像やPDF、HTMLなど）にしてシステムに伝える必要がある。以前のものも今回のものも、EPUB内のコンテントドキュメント（多くの場合複数のXHTML）をひとつのHTMLにまとめ、システムに渡している。
　各コンテントドキュメントをひとつにまとめる処理は以下のような感じになる。

0. EPUBの`spine`で指定された読み順にしたがいコンテントドキュメントを読み込む
0. コンテントドキュメントの内容を抜き出し、`div`要素に詰め込む
0. 抽出された`div`をひとつのHTMLに順に並べる

　ここで問題になるのが、各コンテントドキュメントで指定されているスタイルである。通常複数あるXHTMLコンテントドキュメントをひとつのHTMLにまとめているので、各コンテントドキュメントで指定されているスタイルが全体に影響を与えてしまう。（たとえば、本来ならば表紙ページにだけ適用されるべきスタイルがプレヴューされるHTML全体に適用される）。スタイル指定の記述を省くとまったくスタイルが当たっていない状態になるか、こちらで用意するスタイルを画一的に適用することになる。

　そこで有望視しているのが、HTML 5で追加された`style`要素の`scoped`属性である。`style`要素に`scoped`属性を付けることで、その`style`要素の親コンテナだけにスタイルを適用させることが可能になる。たとえば、

```
<p>...</p>
<div>
  <style scoped="scoped"> p { color: red; } </style>
  <p>...</p>
</div>
```

とすれば、`div`内の`p`要素だけにスタイルを適用できるようになる。
　残念ながらWebKit（HTML形式のプレヴューではWebKitが用いられる）は現在`scoped`属性に対応していない（確認した中ではFirefoxが対応している）が、今回のQuick Lookプラグインは各コンテントドキュメントのスタイル指定に`scoped`属性を付けるようにした。

　コンテントドキュメントの内容を抜き出す際、指定されているスタイル（`style`要素の内容とリンクされているCSSファイルの内容）を`scoped`属性を付けた`style`要素に入れていっしょに`div`に詰め込むようにした。そうやってひとつにまとめられたHTMLは以下のような形になる。

```
<html>
  <body>
    <div>
      <style scoped="scoped">コンテントドキュメント1のスタイル</style>
      ...コンテントドキュメント1の内容...
    </div>

    <div>
      <style scoped="scoped">コンテントドキュメント2のスタイル</style>
      ...コンテントドキュメント2の内容...
    </div>

    <div>
      <style scoped="scoped">コンテントドキュメント3のスタイル</style>
      ...コンテントドキュメント3の内容...
    </div>
      
  </body>
</html>
```

　WebKitが`scoped`属性に対応していない現在では、各スタイル指定は各コンテントドキュメントの範囲を超えて全体に影響を及ぼす。その結果、表示に問題が出る可能性はあるが、EPUBの性質とリーディングシステムとの関係上、個別のコンテントドキュメントにあまり複雑なスタイルを当てることはあまりないはずで、これによる影響は少ないと思われる（少なくとも文字もののリフロー型では。固定レイアウト型は対象外）。
　それよりも、まったくスタイルが適用されなかったり、あるいは画一的なスタイル指定ではなく、個別のEPUBごとの雰囲気を再現する方針をとっている。将来、WebKitが`scoped`属性に対応すれば、スタイルの適用範囲が各コンテントドキュメントの範囲に限定されるようになるはずである。

