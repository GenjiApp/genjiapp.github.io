---
layout: post
title: 佐野昌一（海野十三）の「虫喰い算大会」電子書籍版を公開
tags: ebook
---
　佐野昌一（海野十三）の「虫喰い算大会」を横組みにし、問題部分をSVG画像化した電子書籍をGitHubで公開しました。

- [GenjiApp/Mushikuizan-Taikai](https://github.com/GenjiApp/Mushikuizan-Taikai)（リポジトリィトップ）
- [Releases · GenjiApp/Mushikuizan-Taikai](https://github.com/GenjiApp/Mushikuizan-Taikai/releases)（EPUB版、MOBI版、Kindle for iOS用AZK版ダウンロード）

　「虫喰い算大会」は、探偵小説家の海野十三が本名の佐野昌一名義で出版した虫喰い算が多数掲載された本で、青空文庫で公開されています。

- [図書カード：虫喰い算大会](http://www.aozora.gr.jp/cards/000160/card43533.html)
- [虫食い算 - Wikipedia](http://ja.wikipedia.org/wiki/虫食い算)

　AmazonのKindleストア等、青空文庫の作品をラインナップしている電子書籍プラットフォームからでもこの本を入手することは可能ですが、ひとつ問題があります。

　たとえばKindleストアの「虫喰い算大会」は、他の一般的な小説等と同じように縦組みで組版されています。これの何が問題かというと、青空文庫の「虫喰い算大会」の問題部分はプレインテキストでベタ組みされており、そのまま縦組みにすると問題の筆算が90度回転したかたちになってしまいます。さらに筆算の途中でページを跨いでしまうという問題もあり、読みにくいものになっています。
　Kindleストアに並んでいる青空文庫の本は自動変換されたものでしょうし、虫喰い算を扱った本書が一般の小説とは異なる特殊なものであるということで、これは仕方のない事です。

　そこで、「虫喰い算大会」を横組みにし、問題部分をSVG画像化して読みやすくした電子書籍を作成しました。
　問題部分を画像化することで美しく、かつページ跨ぎをさせないように読みやすくしました。底本である元々の「虫喰い算大会」は縦組みっぽいのですが、序文の解き方解説等で数字を多く扱うので、横組みの方が読みやすいだろうということで、横組みにしました。

![](/blog/img/20130820/murasaki.png)

Mac用EPUBリーダMurasakiでEPUB版を表示

![](/blog/img/20130820/kindle_previewer.png)

Kindle PreviewerでMOBI版を表示

![](/blog/img/20130820/kindle_ios.png)

iPhoneのKindleでAZK版を表示

![](/blog/img/20130820/ibooks_ios.png)

iPhoneのiBooksでEPUB版を表示
