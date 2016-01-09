---
title: QuickTime PlayerでスクリーンキャプチャしたMOVからベターなアニメーションGIFを作る
layout: post
tags: [gif, ffmpeg, imagemagick]
---
（この記事の内容よりも良い方法を「[動画ファイルからより良いアニメーションGIFを作る]({% post_url 2015-05-05-generating-much-better-animated-gif-from-movie-file %})」に書きました）

　QuickTime Playerで「ファイル」→「新規画面収録」することで、画面の操作をMOVファイルの動画にすること（スクリーンキャプチャ）ができる。そのMOVからある程度きれいでファイルサイズが小さいアニメーションGIFを作ることを考える。

用意するもの（括弧内のヴァージョンは筆者の環境。他のヴァージョンでもたぶん可）：

- QuickTime Player (version 10.3) で画面収録したMOVファイル
- ffmpeg (version 2.2)
- ImageMagick (version 6.8.8-10)

手順：

0. ffmpegを使って動画を連番画像に切り出す
0. ImageMagickのconvertコマンドで連番画像をアニメーションGIFに纏める

## ffmpegを使って動画を連番画像に切り出す

　まずはffmpegを用いてMOVをフレーム毎に連番画像に切り出す。

　ここで、アニメーションGIFのフレーム間の間隔は0.01秒単位である。したがって、フレーム間隔0.01秒で100fps（fps = 秒間フレーム数）となり、以後、0.02秒で50fps、0.03秒で33.33fps、0.04秒で25fps……となる。
　QuickTime Playerで画面収録した場合、収録サイズやマシンスペックによって出力される動画のfpsは変動するので、アニメーションGIFの仕様に合わせたfpsで画像切り出しを行う。

```
$ ffmpeg -i input.mov -r 50 frames/%03d.png
```

　この例では、カレントディレクトリィ下のframesディレクトリィに、3桁の連番をファイル名としたpng画像群が出力される。入力動画が60fpsで収録されていたので、アニメーションGIFの仕様に一番近い50fpsでの切り出しを行っている（したがって、秒間10フレーム分間引かれる）。そのために`-r`オプションでフレーム数`50`を指定した。
　Internet Explorerの古いヴァージョンではフレーム間隔0.06秒以下（= 16.67fps以上）のアニメーションGIFは正常に再生できないらしいが、今回は無視する（参考：[あなたは大丈夫？高速GIFアニメになってしまう症状 知らなきゃ絶対損するPCマル秘ワザ](http://daredemopc.blog51.fc2.com/blog-entry-712.html)）。

## ImageMagickのconvertコマンドで連番画像をアニメーションGIFに纏める

　次に出力された連番画像をImageMagickのconvertコマンドを用いてアニメーションGIFに纏める。

```
$ convert -delay 2 -layers optimize frames/*.png output.gif
```

　上記のようにすればframesディレクトリィ下の連番画像がアニメーションGIFになる。`-delay`オプションでフレーム間隔を0.01秒単位で指定する。ここでは上述の動画切り出しfpsに合わせて`2`（= 0.02秒間隔 = 50fps）を指定した。
　`-layers optimize`オプションを使用することでいい感じにアニメーションGIFを最適化してくれる（フレーム間で差分のあるところだけを使うとか）。このオプションを指定しない場合、50fpsで約9秒のアニメーションGIFのファイルサイズが約7.8MB、指定した場合は約552KBと、大幅なファイルサイズ削減効果があった。それでいて見た感じの画質の劣化等は全然解らないので、`-layers optimize`オプションを指定することをおすすめする（動画の内容によるかも）。

　以上のようにして生成したのが以下のアニメーションGIFである。

![](/blog/img/20140604/output.gif)

　ターミナルでの操作が嫌なひとは以下のようなGUIアプリケーションがあるので参考まで。

- [LICEcap](http://www.cockos.com/licecap/)

    LICEcapはWindows/OS X両方で使える。スクリーンキャプチャから一貫してこのアプリひとつでできるのでお手軽。出力の質は本稿の手法より劣ると思う。無料。

- [GIF Brewery](http://gifbrewery.com)

    GIF Breweryは動画ファイルをアニメーションGIFに変換するOS X用のアプリケーション。GUIでクロップやリサイズ、オーヴァレイとかできる（本稿の手法でもImageMagickでがんばればクロップやリサイズ等できる）。出力の質は本稿の手法以上。有料。

## 余談

　ちなみに上記のアニメーションGIFは2014年6月4日現在Mac App Storeに申請中のアプリケーションのデモアニメーションです。`mailto:`リンクのクリックによる意図しないメイルアプリケーションの起動を抑制します。メイルアプリケーションの起動の代わりにアドレスをコピィしたり、Gmailの作成画面を開いたりできるようになるアプリケーションです。

　追記：上記アプリケーションをリリースしました（「[Mailto Interceptorをリリースしました]({% post_url 2014-06-06-releasing-mailto-interceptor %})」）。

## 参考

- [ffmpeg と ImageMagick で動画をアニメGIF 変換](http://futuremix.org/2012/03/ffmpeg-imagemagick-animation-gif)
- [ImageMagick: Command-line Options](http://www.imagemagick.org/script/command-line-options.php)
- [あなたは大丈夫？高速GIFアニメになってしまう症状 知らなきゃ絶対損するPCマル秘ワザ](http://daredemopc.blog51.fc2.com/blog-entry-712.html)
