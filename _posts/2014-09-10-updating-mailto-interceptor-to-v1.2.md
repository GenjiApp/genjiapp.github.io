---
title: Mailto Interceptorをver. 1.2にヴァージョンアップしました
layout: post
tags: [mailto interceptor, os x, release]
---
![](/blog/img/20140910/mailto_interceptor_icon.png)

　`mailto:`リンク等によるメールアプリケーションの即時起動を抑制するユーティリティMailto Interceptorをver. 1.2にヴァージョンアップしました。

- [Mailto Interceptor紹介ページ](/mac/mailtointerceptor/)
- [Mac App Store](https://itunes.apple.com/jp/app/id883196547?mt=12)

　ver. 1.2では、

- カスタムURLを定義する機能
- ポップアップメニューを編集する機能

が付きました。

## カスタムURLの定義

　これまでも、`mailto`リンクをクリックしたときのディフォルト動作として、あるいはポップアップメニューから選択したときに、Mailto Interceptorであらかじめ定義されたGmailの作成画面を開くことは可能でした。ver. 1.2ではあらかじめ定義されたURL以外に自分で定義したカスタムURLを開くことができるようになります。

![](/blog/img/20140910/defining_custom_url.png)

　たとえば、上記画像のようにカスタムURLを定義した場合、`mailto`リンクをクリックしたディフォルト動作として、あるいはポップアップメニューから選択したときに、`https://example.com/mail_compose?to={to}`なるURLを開くことができるようになります。`{to}`の部分は`mailto`リンクで指定された宛先アドレスに置き換わります。置換可能なプレイスホルダは全部で5種類あります。

- `{to}`：宛先アドレス
- `{cc}`：ccアドレス
- `{bcc}`：bccアドレス
- `{subject}`：件名
- `{body}`：本文

　それぞれURLを開くときに`mailto`リンクで指定されたものに置換されます。

　カスタムURLを定義することで——自分が使っているウェブメールサーヴィスがメール作成画面へのURLを提供しているならば——`mailto`リンクのクリックでそれらを開くことができるようになります。

- Gmail
- Outlook.com

のふたつが定義済みURLとして提供されています。


## ポップアップメニューの編集

　Mailto Interceptorでは、`mailto`リンククリックに対する動作として、ポップアップメニューを開く機能を提供しています。あらかじめディフォルト動作を決め打ちするのではなく、その場で

- `mailto`リンクを無視
- メールアドレスのコピー
- メールアプリケーションの起動
- URLを開く

等の動作を選択することができます。

　ver. 1.2ではこのポップアップメニューのメニュー項目を編集する機能を追加しました。ポップアップメニューに表示されるメニュー項目を自分好みに追加・削除したり、並べ替えたりすることができるようになりました。

![](/blog/img/20140910/editing_pop_up_menu.png)

　追加できるメニュー項目は、

- メールアドレスをコピー
- インストールされているメールアプリケーションの起動
- Gmailを開く
- Outlook.comを開く
- カスタムURLを開く
- セパレータ

です。

　新しくなった[Mailto Interceptor](/mac/mailtointerceptor/)は[Mac App Storeで配信しています](https://itunes.apple.com/jp/app/id883196547?mt=12)。どうぞよろしく。
