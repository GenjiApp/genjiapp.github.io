---
title: Murasaki ver. 2.5をリリース
layout: post
tags: macos murasaki release
---

macOS用EPUBリーダアプリ「Murasaki」のver. 2.5が出ました。

- [アプリ紹介ページ](/mac/murasaki/)
- [Mac App Store](http://itunes.apple.com/jp/app/murasaki/id430300762?mt=12)

ver. 2.5での変更点は、

- **macOS 15 Sequoia以降のみをサポート**
- UIの調整
- macOS 15 Sequoiaに対応した新しいQuick Look拡張機能を実装

です。

新しいQuick Look拡張機能に関して、macOS 15 Sequoia以降は従来のQuick Lookプラグイン形式（`.qlgenerator`）がサポートされなくなったので、Sequoia以降で動作する機能拡張形式（`.appex`）で実装し直しました。

それに伴い、Quick Lookの動作設定を変更できるようにもなりました。

- 読み込みデータサイズ制限
- デフォルトのコンテントサイズ

それぞれを、Murasaki本体の設定ウィンドウから変更できるようになっています。

![](/blog/img/20240930/quicklook_settings_window.png)

読み込みデータサイズ制限は、Quick LookがEPUBデータを展開、プレヴューを構成していくなかで、全データを読み込むのではなく、設定したデータサイズで読み込みを打ち切ります。大きなデータサイズのEPUBの場合、プレヴュー構成に時間が掛かることがあるための制限となります（これまでは固定値でした）。

デフォルトのコンテントサイズは、Quick Lookプレヴューの初期ウィンドウサイズを設定できます。

また、新しい拡張機能形式はシステム設定から拡張機能の有効・無効を設定することができます。

どうぞよろしくお願いします。