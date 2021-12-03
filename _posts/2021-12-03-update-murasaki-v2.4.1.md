---
title: Murasaki ver. 2.4.1をリリース
layout: post
tags: macos murasaki release
---

Murasaki ver. 2.4.1をリリースしました。macOS用のEPUBリーダアプリです。

![](/blog/img/20211203/murasaki_icon.png)

- [アプリ紹介ページ](/mac/murasaki/)
- [Mac App Store](http://itunes.apple.com/jp/app/murasaki/id430300762?mt=12)

前回からの主な変更点は、

- **macOS 12以降のみをサポート**
- Spotlight/Quick Lookプラグインの再同梱

です。

macOS 10.15 Catalina辺りから、Murasaki同梱のEPUB用Spotlight/Quick Lookプラグインが動かなくなっていました。前回のリリースでプラグインの同梱をやめたのは、これが理由です。

従前、EPUBには`org.idpf.epub-container`というUTI（ファイル形式を同定する識別子）が定義されていました。プラグインの開発ではこのUTIを用いてファイル形式の判別等を行います。しかし、いつの頃からか、`com.apple.ibooks.epub`なるUTIが定義されており、EPUBファイル用のUTIとしてこちらが使われるようになってしまっており、プラグインが動作しない状況になっていました。Murasaki同梱のSpotlightプラグインが動かなくなっていた原因はこれです。

今回、UTIのバッティング問題に気づいたことで、Spotlightプラグインを修正できました。

Quick Lookプラグインについては、macOSには最初からEPUB用Quick Lookプラグインが組み込まれており、アプリ同梱プラグインより優先して読み込まれるようになっていたことが原因です。通常は、とあるファイル形式に対応したプラグインがOSに組み込まれていたとしても、アプリ同梱のプラグインや`/Users/***/Library/QuickLook`にインストールされたものが優先される仕様のはずなのです。

しかしながら、macOS 12 MontereyではQuick Lookプラグインの優先読み込み問題が知らぬ間に解決されていたことが解りました。Appleにバグレポートを投げても梨の礫だったこともあって、腑に落ちぬところはありますが、ともあれ解決したのならヨシ！

とは言え、手元に環境がないので解らないのですが、おそらくmacOS 11以前ではQuick Lookプラグインの問題は解決していないと思うので、今回から**macOS 12以降のみをサポート**することにします。

