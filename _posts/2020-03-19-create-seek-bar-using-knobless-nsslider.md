---
title: ノブなしNSSliderでシークバーを作る
layout: post
tags: [cocoa, dev, macos]
---

久しぶりにアプリをリリースしました。「[Silver Baton](/mac/silver-baton)」という、Music.appで再生中の曲の情報表示や再生・一時停止等の操作ができるmacOSアプリです。

![](/blog/img/20200319/silver-baton.png)

上記画像のようなコントロールパネルをトラックパッドの3／4本指タップやマウスの右ダブルクリック、ミドルクリックで呼び出せるところがミソです。

さて、Silver Batonでは曲の進行具合の表示と変更のためにシークバーを実装しています（上記画像のウィンドウ最下部の青いバー部分）。

`NSProgressIndicator`は何らかの進捗具合を表示するにはうってつけですが、「Indicator」の示すとおり、「表示」に特化していてマウス操作は受け付けません。

そこで、マウス操作を受け付ける`NSSlider`を利用しました。素の`NSSlider`には大きなノブが付いています（上記画像のシークバー上部の音量調節`NSSlider`の白丸）。ノブは邪魔なので、表示させなくするために`NSSliderCell`をサブクラス化しました。

![](/blog/img/20200319/subclassed-nsslidercell.png)

```swift
import AppKit

class KnoblessSliderCell: NSSliderCell {
  override func knobRect(flipped: Bool) -> NSRect {
    return NSRect.zero
  }
}

let slider1 = NSSlider(target: nil, action: nil)
slider1.doubleValue = 0.5

let slider2 = NSSlider(target: nil, action: nil)
slider2.cell = KnoblessSliderCell()
slider2.doubleValue = 0.5
```

`slider1`が通常のスライダ、`slider2`がノブなしスライダです。`NSSliderCell`の`func knobRect(flipped: Bool) -> NSRect`をオーヴァライドしてサイズゼロの`NSRect`を返すことで、ノブを描画しないようにしました。ノブが描画されなくても、通常通りマウスのクリックやドラッグに反応してくれます。

欲を言えば、マウスオーヴァ時だけノブを出したりバーを太くしたりしたほうが良さげですが、今回はここまで。