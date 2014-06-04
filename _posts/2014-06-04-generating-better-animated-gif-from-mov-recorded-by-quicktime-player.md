---
title: QuickTime Playerでスクリーンキャプチャしたmovからベターなアニメーションgifを作る
layout: post
tags: [gif, ffmpeg, imagemagick]
---
　QuickTime Playerで「ファイル」→「新規画面収録」することで、画面の操作をmovファイルの動画にすること（スクリーンキャプチャ）ができる。そのmovからある程度きれいでファイルサイズが小さいアニメーションgifを作ることを考える。

用意するもの（括弧内のヴァージョンは筆者の環境。他のヴァージョンでもたぶん可）：

- QuickTime Player (version 10.3) で画面収録したmovファイル
- ffmpeg (version 2.2)
- ImageMagick (version 6.8.8-10)

手順：

0. ffmpegを使って動画を連番画像に切り出す
0. ImageMagickのconvertコマンドで連番画像をアニメーションgifに纏める

## ffmpegを使って動画を連番画像に切り出す

　まずはffmpegを用いてmovをフレーム毎に連番画像に切り出す。

　ここで、アニメーションgifのフレーム間の間隔は0.01秒単位である。したがって、フレーム間隔0.01秒で100fps（fps = 秒間フレーム数）となり、以後、0.02秒で50fps、0.03秒で33.33fps、0.04秒で25fps……となる。
　QuickTime Playerで画面収録した場合、収録サイズやマシンスペックによって出力される動画のfpsは変動するので、アニメーションgifの仕様に合わせたfpsで画像切り出しを行う。そのためにはffmpegの`-r`オプションを用いる。以下の例は入力動画が60fpsで収録されていたので、アニメーションgifの仕様に一番近い50fpsでの切り出しを行っている（したがって、秒間10フレーム分間引かれる）。Internet Explorerの古いヴァージョンではフレーム間隔0.06秒以下（= 16.67fps以上）のアニメーションgifは正常に再生できないらしいが、今回は無視する（参考：[あなたは大丈夫？高速GIFアニメになってしまう症状 知らなきゃ絶対損するPCマル秘ワザ](http://daredemopc.blog51.fc2.com/blog-entry-712.html)）。

```
$ ffmpeg -i input.mov -r 50 frames/%03d.png
```

　この例では、カレントディレクトリィ下のframesディレクトリィに、3桁の連番をファイル名としたpng画像群が出力される。

## ImageMagickのconvertコマンドで連番画像をアニメーションgifに纏める

　次に出力された連番画像をImageMagickのconvertコマンドを用いてアニメーションgifに纏める。

```
$ convert -delay 2 -layers optimize frames/*.png output.gif
```

　上記のようにすればframesディレクトリィ下の連番画像がアニメーションgifになる。`-delay`オプションでフレーム間隔を0.01秒単位で指定する。ここでは上述の動画切り出しfpsに合わせて`2`（= 0.02秒間隔 = 50fps）を指定した。
　`-layers optimize`オプションを使用することでいい感じにアニメーションgifを最適化してくれる（フレーム間で差分のあるところだけを使うとか）。このオプションを指定しない場合、50fpsで約9秒のアニメーションgifのファイルサイズが約7.8MB、指定した場合は約552KBと、大幅なファイルサイズ削減効果があった。それでいて見た感じの画質の劣化等は全然解らないので、`-layers optimize`オプションを指定することをおすすめする（動画の内容によるかも）。

　以上のようにして生成したのが以下のアニメーションgifである。

![](/blog/img/20140604/output.gif)

　ターミナルでの操作が嫌なひとは以下のようなGUIアプリケーションがあるので参考まで。

- [LICEcap](http://www.cockos.com/licecap/)
- [GIF Brewery](http://gifbrewery.com)

　LICEcapはWindows/OS X両方で使える。スクリーンキャプチャから一貫してこのアプリひとつでできるのでお手軽。出力の質は本稿の手法より劣ると思う。無料。
　GIF Breweryは動画ファイルをアニメーションgifに変換するOS X用のアプリケーション。GUIでクロップやリサイズ、オーヴァレイとかできる（本稿の手法でもImageMagickでがんばればクロップやリサイズ等できる）。出力の質は本稿の手法以上。有料。

## 余談

　ちなみに上記のアニメーションgifは2014年6月4日現在Mac App Storeに申請中のアプリケーションのデモアニメーションです。`mailto:`リンクのクリックによる意図しないメイルアプリケーションの起動を抑制します。メイルアプリケーションの起動の代わりにアドレスをコピィしたり、Gmailの作成画面を開いたりできるようになるアプリケーションです。

## 参考

- [ffmpeg と ImageMagick で動画をアニメGIF 変換](http://futuremix.org/2012/03/ffmpeg-imagemagick-animation-gif)
- [ImageMagick: Command-line Options](http://www.imagemagick.org/script/command-line-options.php)
- [あなたは大丈夫？高速GIFアニメになってしまう症状 知らなきゃ絶対損するPCマル秘ワザ](http://daredemopc.blog51.fc2.com/blog-entry-712.html)
