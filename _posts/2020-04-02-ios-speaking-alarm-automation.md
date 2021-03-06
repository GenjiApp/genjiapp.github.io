---
title: iOSのアラームがスヌーズ・停止した時に時刻を読み上げるオートメーションを作る
layout: post
tags: ios
---

寝坊を恐れるあまりアラームを何本も設定していると、逆に油断して二度寝、三度寝が発生してしまいがちである。寝ぼけマナコで止めたアラームは一体何本目のアラームで今は何時何分なのか。アラームを止める手も慣れたもの、ほぼノールックなので時間なんて解らない。これは一本目のアラームだからまだ余裕があるなんて思ってダラダラしていたら、実は一本目のアラームは聞き逃していてすでに猶予がない状況だった、なんてのがありがち。

そんなときにアラームが現在時刻を喋ってくれると良いのではないか。iOSのショートカットとオートメーションの機能を使ってこの課題を解決する。

![](/blog/img/20200402/speaking-alarm-automation.png)

まずは上記画像の左側、現在時刻を読み上げるショートカットの設定。

1. 「現在の音量」を取得
2. 音量を任意に設定
3. 「現在の日付」を読み上げ
   * 「日付フォーマット」は「なし」
   * 「時間フォーマット」は「短」
4. 音量を最初に取得した「現在の音量」に設定

次に上記画像の右側、オートメーションの設定。

* オートメーション開始のきっかけは「いずれかのアラームがスヌーズした」と「いずれかのアラームが停止したとき」
* 実行内容は上述のショートカット
* 「実行の前に尋ねる」はオフ

これでアラームがスヌーズ・停止したときに現在時刻が読み上げられる。寝過ごし防止の一助となるであろう。

オートメーション開始のきっかけとして、スヌーズ・停止時ではなく「アラームが鳴ったとき」のようなものがあればより良かった。というか、現在時刻を読み上げてくれる特別なアラーム音があれば、ショートカットだオートメーションだと騒がなくて済むのだが。