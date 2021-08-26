---
title: Silver Baton ver. 1.4をリリースしました
layout: post
tags: [macos, release, silver baton]
---

![](/blog/img/20210719/silver-baton-icon.png)

Silver Baton ver. 1.4をリリースしました。手元のトラックパッド／マウス操作でMusic.appを操作できるパネルを表示するmacOS用アプリです。

- [アプリ紹介ページ](/mac/silver-baton/)
- [Mac App Store](https://apps.apple.com/jp/app/silver-baton/id1501844023?mt=12)

前回からの主な変更点は、

- 環境設定ウィンドウの改修
- 軽微な問題の修正

です。

環境設定ウィンドウに、アプリが必要とする権限の確認、およびその取得を誘導するビューを追加しました。

![](/blog/img/20210719/silver-baton-screenshot01.png)

また、アプリ起動時に環境設定ウィンドウを表示するようにし、その動作を抑制できる設定を追加しました。これは、権限の取得やパネル表示方法の選択など、Silver Batonの初期導入をスムーズに行えるようにすることを狙っています。

![](/blog/img/20210719/silver-baton-screenshot02.png)

環境設定ウィンドウの改修にあたり一部SwiftUIを採用しました。環境設定ウィンドウにある3つのビューがそれぞれSwiftUIで作られています。ガワとなるウィンドウおよびNSTabViewControllerは既存のStoryboardを使い、各ビューだけをSwiftUIに置き換えた形となります。

今後はmacOSアプリもSwiftUIが主流になっていくと思われ、その練習がてらとして使ってみました。
