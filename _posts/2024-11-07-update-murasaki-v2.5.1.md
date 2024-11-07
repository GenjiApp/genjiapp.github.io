---
title: Murasaki ver. 2.5.1をリリース
layout: post
tags: macos murasaki release
---

macOS用EPUBリーダアプリ「Murasaki」のver. 2.5.1が出ました。

- [アプリ紹介ページ](/mac/murasaki/)
- [Mac App Store](http://itunes.apple.com/jp/app/murasaki/id430300762?mt=12)

ver. 2.5.1での変更点は、

- macOS 15 Sequoia対応のQuick Look Thumbnail機能拡張を追加
- Quick Look Preview機能拡張を修正

Quick Look Thumbnail拡張機能の実装によって、macOS 15 Sequoia環境でEPUBのカバー画像をサムネイルとしてFinder等で表示できるようになりました。

Quick Look Preview拡張機能の修正について。EPUBの仕様的に必須となっている項目が抜けていたとき等、読み込みエラーになってプレビューできないようになっていました。あまつさえ、実装ミスにより、そのときにクラッシュしていました。クラッシュする不具合は修正し、メタデータが不備でもプレビューはできるように変更しました。

また、プレビューの読み込みデータサイズ制限のディフォルト値を5MBから10MBに拡張しました。

どうぞよろしく。