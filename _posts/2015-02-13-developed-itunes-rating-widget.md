---
title: iTunesで再生中の曲にレート付けするウィジェットを作った
layout: post
tags: [development, os x, cocoa]
---
![](/blog/img/20150213/itunes_rating_widget.png)

　OS X 10.10 Yosemiteから搭載された機能拡張（通知センターの「今日」ペインで動作する機能拡張を「ウィジェット」と呼ぶ）を用いて、iTunesで再生中の曲にレート付けをするウィジェットを作ってみた。ソースは[GenjiApp/iTunes-Rating-Widget](https://github.com/GenjiApp/iTunes-Rating-Widget)で公開する。

## Scripting Bridge

　iTunesからの情報取得や操作には[Scripting Bridge](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/ScriptingBridgeConcepts/Introduction/Introduction.html)を用いた。Scripting BridgeはAppleScriptで操作可能なアプリケーションに対して、AppleScriptを用いずにObjective-Cからの操作を行うフレームワークである。

### `iTunesArtwork`オブジェクトの謎

　Scripting Bridgeを用いてiTunesの曲情報を取得すると、アートワークは`iTunesArtwork`オブジェクトとして得られる（クラス名等の接頭辞`iTunes`は自分で設定可能）。このオブジェクトには`NSImage`型の`data`というプロパティがある。通常これを用いればCocoa環境で使いやすい画像オブジェクトが得られるはずである。
　アートワークがJPEG形式の場合、`data`プロパティは問題なく`NSImage`が返すが、PNG形式だった場合、`NSAppleEventDescriptor`オブジェクトが返ってくるという謎の挙動を示す。仕方がないので、`iTunesArtwork`が持つ画像の生データ`rawData`プロパティを用いて`NSImage`を生成した。

## `com.apple.iTunes.playerInfo`ノーティフィケーション

　iTunesの再生・一時停止・曲送り・曲戻し操作の際には通知名「`com.apple.iTunes.playerInfo`」で通知が飛ぶ。これを`NSDistributedNotificationCenter`で捕まえて情報の更新を行った。

## `NSLevelIndicatorCell`のハイライト

　`NSLevelIndicator`を使うとiTunesのような星を用いたレート付けのGUIが作れる。しかし素のままで使うと、値が`0`のときに表示が何もなくなって解りづらい。レート付けの操作中、つまりハイライト時にはドットが表示されるので、`NSLevelIndicatorCell`をサブクラス化し、`- (BOOL)isHighlighted`が常に`YES`を返すようにしておいた。

## コンテナアプリケーション

　機能拡張はそれ単体では開発・配布を行うことができず、主となるアプリケーションが必要になる。これをコンテナアプリケーションと呼び、コンテナアプリケーションに内包する形で機能拡張を開発・配布することになる。
　今回はそれは主眼ではないので、適当にシステム環境設定の機能拡張ペインを開くだけのものにした。システム環境設定の各ペインの実体は「`/System/Library/PreferencePanes/`」以下にあるので、目的のペインのURLを作成し、`NSWorkspace`の`openURL:`メソッドで開いてやれば良い。
