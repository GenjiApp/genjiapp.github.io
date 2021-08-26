---
title: Mailto Interceptorをリリースしました
layout: post
tags: [macos, release, mailto interceptor]
---
　Mailto InterceptorというOS Xアプリケーションをリリースしました。

- [アプリケーション紹介ページ](/mac/mailtointerceptor/)
- [Mac App Store](https://itunes.apple.com/jp/app/id883196547?mt=12)

　ウェブブラウズ中に`mailto:`リンクをクリックしてしまい、意図せずメイルアプリケーションが起動してしまったことがありませんか？　Mailto Interceptorを使えば意図しないメイルアプリケーションの起動を抑制します。

　Mailto Interceptorはシステムからはメイルアプリケーションとして認識されます。Mailto Interceptorをシステムのディフォルトメイルアプリケーションとして設定することで`mailto:`リンクのクリック等に反応して起動するようになります。
　通常のメイルアプリケーションであれば、起動後メイル作成画面を開きますが、Mailto Interceptorは設定された動作を実行後、自動終了します。Mailto Interceptorで設定可能な動作は以下の通りです。

- `mailto:`リンクを無視（なにもしない）
- メイルアドレスをコピィ
- Gmailの作成画面を開く
- 上記の動作とメイルアプリケーションの起動を選択できるメニューをポップアップ（推奨動作）

　Mailto Interceptorが`mailto:`に反応して起動した場合、Dockへのアイコン表示、およびDockアイコンのバウンドアニメーション等はしないので、ユーザはMailto Interceptorの存在を意識することなく上記の動作を実行させることができます。

![](/blog/img/20140606/demo.gif)

　上記デモアニメーションは、メニューをポップアップする動作を行ったときのものです。`mailto:`リンクをクリックすると、システムがディフォルトのメイルアプリケーションを起動します。Mailto Interceptorをディフォルトメイルアプリケーションにしている場合、Mailto Interceptorが起動し、指定動作を実行します（上記デモアニメーションの場合はメニューのポップアップ）。
　デモアニメーションで"Copy Email Address"をしているメニューは通常のコンテキストメニューではなく、Mailto Interceptorが表示しているメニューです（"Paste"しているメニューは通常のコンテキストメニュー）。前述のように、このときDockにアイコンが表示されたりはしません。

　不意にメイルアプリケーションが起動してしまい、イラっとしたことがあるひとはぜひMailto Interceptorをお試しください。

- [アプリケーション紹介ページ](/mac/mailtointerceptor/)
- [Mac App Store](https://itunes.apple.com/jp/app/id883196547?mt=12)


## 余談

　Mac App Storeでの文言は英語になっていますが、アプリケーション自体は日本語化されています。Mac App Storeでの日本語文言の準備を後回しにしていたら、それより早くリリースされてしまい、日本語文言の追加ができなくなってしまいました……。次回アップデート時にはちゃんと日本語追加します。
