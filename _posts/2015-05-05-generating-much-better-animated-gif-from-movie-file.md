---
title: 動画ファイルからより良いアニメーションGIFを作る
layout: post
tags:  [ffmpeg, gif]
---

「[QuickTime PlayerでスクリーンキャプチャしたMOVからベターなアニメーションGIFを作る]({% post_url 2014-06-04-generating-better-animated-gif-from-mov-recorded-by-quicktime-player %})」で書いた方法よりも、より良い手法が解ったので覚え書き。

　前回の手法をかんたんにまとめると、

0. ffmpegを使って動画を連番画像に切り出す
0. ImageMagickのconvertコマンドで連番画像をアニメーションGIFに纏める

だった。前回の手法の問題点は、手順2で処理に時間が掛かること、動画の内容によっては色味が変化、あるいは崩れる可能性があることだった。

　今回の手法はImageMagickは用いずffmpegだけを用いる。**ffmpegはv2.6以上必須**。動画はffmpegが扱えるならなんでも良いと思う。

　手順：

0. ffmpegで動画で使われている色を元に最適化されたパレット画像を生成
0. ffmpegでパレットを元にアニメーションGIFを生成

## パレット画像の生成

　パレット画像を生成するには、以下を実行する。

```
$ ffmpeg -i input.mov -vf fps=20,palettegen=stats_mode=diff -y palette.png
```

　`-i input.mov`で入力動画の指定、`-y palette.png`で出力するパレット画像の指定。
　`-vf fps=20,palettegen=stats_mode=diff`がフィルタの指定。`fps=20`でFPSを20に指定し（[fpsフィルタのドキュメント](https://ffmpeg.org/ffmpeg-filters.html#fps-1)）、`palettegen=stats_mode=diff`でパレット画像の生成を指定（[palettegenフィルタのドキュメント](https://ffmpeg.org/ffmpeg-filters.html#palettegen-1)）。今回は`palettegen`に`stats_mode=diff`オプションを指定した。

## アニメーションGIFの生成

　パレット画像を元にアニメーションGIFを生成するには、以下を実行する。

```
$ ffmpeg -i input.mov -i palette.png -lavfi fps=20,paletteuse -y output.gif
```

　入力動画と共にパレット画像も指定し、アニメーションGIFを生成する。`-lavfi fps=20,paletteuse`でFPSとパレット画像の使用を指定（[paletteuseフィルタのドキュメント](https://ffmpeg.org/ffmpeg-filters.html#paletteuse)）。

## 結果

- 入力動画
- [ImageMagickを用いた手法]({% post_url 2014-06-04-generating-better-animated-gif-from-mov-recorded-by-quicktime-player %})で生成したアニメーションGIF（前回の手法）
- パレット画像を使用せずにffmpegで生成したアニメーションGIF
- パレット画像を使用してffmpegで生成したアニメーションGIF（今回の手法）

を以下に示す。

<table>
<thead><tr><td></td><td>ファイルサイズ</td><td>動画・画像</td><td>処理時間</td></tr></thead>
<tr><td>入力動画<td>148KB</td></td><td><video src="/blog/img/20150505/input.mov" controls autoplay loop width="400" height="300"/></td><td></td></tr>
<tr><td>ImageMagick（前回の手法）</td><td>709KB</td><td><img src="/blog/img/20150505/output-imagemagick.gif" width="400" height="300"/></td><td>約23秒</td></tr>
<tr><td>ffmpeg、パレット画像不使用</td><td>293KB</td><td><img src="/blog/img/20150505/output-ffmpeg-normal.gif" width="400" height="300"/></td><td>約2秒</td></tr>
<tr><td>ffmpeg、パレット画像使用（今回の手法）</td><td>663KB</td><td><img src="/blog/img/20150505/output-ffmpeg-palette.gif" width="400" height="300"/></td><td>約6秒</td></tr>
</table>

　ImageMagickを用いる手法（前回の手法）では、

```
$ ffmpeg -i input.mov -r 20 frames/%03d.png
$ convert -delay 5 -layers optimize frames/*.png output-imagemagick.gif
```

パレット画像不使用の手法では、

```
$ ffmpeg -i input.mov -r 20 -y output-ffmpeg-normal.gif
```

パレット画像使用の手法（今回の手法）では、

```
$ ffmpeg -i input.mov -vf fps=20,palettegen=stats_mode=diff -y palette.png
$ ffmpeg -i input.mov -i palette.png -lavfi fps=20,paletteuse -y output-ffmpeg-palette.gif
```

を実行した。

　前回の手法で生成したアニメーションGIFはテキストエディタのウィンドウの背景が薄青く変色してしまっているのが解る。これはまだましな方で、動画によってはもっと大きく色が崩れてしまったり、前フレームの残像が残ったりすることがある。パレット画像不使用の場合はドロップシャドウやメニューなど、半透明がからむ部分で編みかけのようになってしまっている。それらに比べて今回の手法で生成したものは、そういう画像の乱れが見られない。
　また、処理にかかった時間もパレット画像不使用に比べれば遅いものの、前回の手法の方よりは大幅に速い。出力ファイルサイズもパレット画像不使用よりは大きいが前回の手法よりは小さい、という結果になった。


## おまけ（動画の切り抜き、拡大・縮小）

　Quick Time Playerでスクリーンキャプチャする際、範囲選択の領域サイズが表示されないので、狙った領域サイズで収録するのが難しい。そこで、範囲選択を大きめに取って収録し、ffmpegを用いて切り抜き、縮小する方法を考える。

　切り抜きの場合、

```
$ ffmpeg -i input.mov -vf crop=640:480:52:0 -y output.mov
```

のようにする。`-vf crop=640:480:52:0`で切り抜きを指定（[cropフィルタのドキュメント](https://ffmpeg.org/ffmpeg-filters.html#crop)）。この指定の場合、元動画の左上を原点として(52, 0)の座標から領域サイズ640x480での切り抜きを行う。

　拡大・縮小の場合、

```
$ ffmpeg -i input.mov -vf scale=400:-1:flags=lanczos -y output.mov
```

のようにする。`-vf scale=400:-1:flags=lanczos`で拡大・縮小を指定（[scaleフィルタのドキュメント](https://ffmpeg.org/ffmpeg-filters.html#scale-1)）。

　切り抜きしつつ、縮小しつつ、FPSを指定して、パレット画像の生成をするには、

```
$ ffmpeg -i input.mov -vf crop=640:480:52:0,fps=20,scale=400:-1:flags=lanczos,palettegen -y palette.png
```

さらに、このパレット画像を使用してアニメーションGIFを生成するには、

```
$ ffmpeg -i input.mov -i palette.png -lavfi crop=640:480:52:0,fps=20,scale=400:-1:flags=lanczos,paletteuse -y output.gif
```

を実行する。

　ffmpegは引数指定が複雑で難しい。

## 余談

　今回の実験で使用した動画は、現在開発中の絵文字を入力するインプットメソッドの動作デモ。
　日本人的には、OS標準の日本語IMやATOK、Google日本語入力等の日本語インプットメソッドを通じて絵文字の入力はある程度容易に、いつも通りの操作で行えるが、ふだんインプットメソッドを意識しないで文字入力している層（英語圏など）はどうしているんだろうか。わざわざ文字ビューアを起動して、検索して、選択して、とやっているのか——そういうところから着想を得て現在鋭意開発中。ふだん通りの入力操作の延長上で絵文字をかんたんに入力できる環境を目指します。
　全世界の標準USインプットメソッドをこのEmoji IMで置き換えてやろうという野望を抱いています。

## 参考

- [High quality GIF with FFmpeg](http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html)
- [FFmpeg Filters Documentation](https://ffmpeg.org/ffmpeg-filters.html)

