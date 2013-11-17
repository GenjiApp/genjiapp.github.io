---
layout: post
title: JekyllのMarkdown設定メモ
date: 2013-11-13 12:37
---
　[Jekyllを使ってウェブサイトとブログの再構築をした]({% post_url 2013-11-13-rebuild-website-by-using-jekyll %})。その際に用いたMarkdown用の設定メモ。
　現時点での`_config.yml`ファイルのMarkdown関係の設定は以下。

```
markdown: redcarpet
redcarpet:
  extensions: ["no_intra_emphasis", "autolink", "hard_wrap"]
```

　生の設定ファイルは[genjiapp.github.io/_config.yml at master](https://github.com/GenjiApp/genjiapp.github.io/blob/master/_config.yml)。

## Markdownレンダラの変更

　JekyllのディフォルトのMarkdownレンダラはMaruku。これをRedcarpetに変更した。なぜ変更したか。きっかけは、MarukuではTwitterの埋め込みコード（以下のようなもの）

```
<blockquote class="twitter-tweet"><p>ヘウレーカ！　JekyllでコンテンツをHTMLで書いて良いことと、レイアウト側だけではなくコンテンツ側でも include が使えることに気がついて、蒙が啓けた気がする</p>&mdash; Genji (@genji_tw) <a href="https://twitter.com/genji_tw/statuses/398471861828206592">November 7, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
```

がうまく変換できずエラーを吐くことに気がついたから。`_config.yml`で`markdown: redcarpet`と指定することで、MarkdownレンダラをMarukuからRedcarpetに変更できる。

## Redcarpetの拡張設定

　指定した拡張は`no_intra_emphasis`、`autolink`、`hard_wrap`の3つ。

　Markdownは標準では複数のアンダーバー`_`間の文字列をHTML変換時に強調タグ`<em>`でくくる。これの何が問題かというと、プログラムの変数名等でありがちな`hoge_foo_bar`のような文字列が意図せず強調されてしまう。`no_intra_emphasis`はその動作を抑制する。

　`autolink`はhttp://genjiapp.com/ のような文字列を自動でリンクに変換してくれる。

　最後に`hard_wrap`。Markdownは標準では空行を挿入しないと改段落にならない（ブラウザでの表示で行分けされない）。つまり、

```
あめんぼあかいな
あいうえお

ほげほげ
```

とMarkdownを書くと、変換後のHTMLは

```
<p>あめんぼあかいなあいうえお</p>
<p>ほげほげ</p>
```

のようになる。Markdown上での単なる改行は改段落とはならずひとつの`<p>`タグに纏められ（「あめんぼあかいなあいうえお」が一行で表示される）、空行を挟んで新しい`<p>`タグが始まる。これは他の軽量マークアップ言語でもよくある仕様である。個人的な趣味でこの仕様があまり好きではない。
　`hard_wrap`を有効にすると上記のMarkdownは

```
<p>あめんぼあかいな<br/>あいうえお</p>
<p>ほげほげ</p>
```

のように変換される。Markdown上での改行が変換後に改段落されないのは同様であるが、改行部分に`<br/>`タグが挿入されるようになる（ブラウザでの表示において行分けされる）。
　HTMLの`<p>`タグひとつが日本語の意味段落に相当し、形式段落を`<br/>`で作るというイメージである。

　以上、まとめると[GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown)の仕様に近い感じである。
