---
title: ImageDiff ver. 2.0をリリースしました
layout: post
tags: macos imagediff release
---
ImageDiff ver. 2.0をリリースした。ふたつの画像間の差異をいくつかの方法で視覚化するmacOSアプリである。

![](/blog/img/20220706/icon.png)

- [アプリ紹介ページ](/mac/imagediff/)
- [Mac App Store](https://apps.apple.com/jp/app/imagediff-2/id1602522152?mt=12)

![](/blog/img/20220706/animation.gif)

ImageDiffは2011年に最初のヴァージョンを公開して以降、大きな変更を加えることなく放置気味だったのだが、この度、SwiftUIを用いてイチから書き直した。SwiftUIでのmacOSアプリを構築する感触を確かめるには、ちょうど良い規模感だったように思う。

主な変更点は、

- パフォーマンスの改善
- マルチウィンドウとタブに対応
- サイドバイサイド表示の縦配置を実装
- 背景の変更機能を実装
- トラックパッドジェスチャによる任意の拡大縮小表示の実装

である。

ver. 2.0は、前ヴァージョンまでとは別のアプリとしてMac App Storeに登録したので、前ヴァージョンをご利用の方は改めてダウンロードしなおす必要がある。また、前ヴァージョンは有料アプリだったが、ver. 2.0からは基本無料アプリとした。基本無料アプリとは言っても全機能無料で使用できる。アプリ内課金機能で開発者支援ができるので、気が向いた方は是非。

どうぞよろしく。

