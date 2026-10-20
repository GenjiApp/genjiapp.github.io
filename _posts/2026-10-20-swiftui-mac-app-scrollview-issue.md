---
title: SwiftUI macOS アプリの ScrollView 問題
layout: post
tags: [dev, macos, swiftui]
---

SwiftUI macOS アプリで `ScrollView` を使ったとき、妙な磨りガラス効果が表示される問題がある。環境は、

- macOS 27.0.1
- Xcode 27.1

macOS 26 系でも発生していた。Liquid Glass に起因する問題のような気がする。

以下のような SwiftUI ビューがあるとする。

```swift
struct ContentView: View {
  var body: some View {
    ScrollView([.vertical, .horizontal]) {
      Image(systemName: "globe")
        .resizable()
        .frame(width: 300, height: 300)
    }
    .defaultScrollAnchor(.center)
    .background {
      Color.blue
    }
  }
}
```

`.background { ... }` は磨りガラス効果が見えやすいように背景に色付けしただけで問題とは関係ない。このコードを実行すると、次の画像のような状態になる。

![](/blog/img/20261020/blur01.png)

`ScrollView` の内容物の上に妙な磨りガラス効果が発生している。タイトルバーまで侵食されている。赤線で強調したのが以下。

![](/blog/img/20261020/blur02.png)

スクロールすると内容物も磨りガラス効果の下に潜り込む形になっている。

![](/blog/img/20261020/blur03.png)

`ScrollView` とタイトルバー（ツールバー）が接していると磨りガラス効果が発生してしまうようで、ひとまずのワークアラウンドとしては、`.padding(.top, 1)` のように `ScrollView` の上に隙間を空けると解消される。

```swift
struct ContentView: View {
  var body: some View {
    ScrollView([.vertical, .horizontal]) {
      Image(systemName: "globe")
        .resizable()
        .frame(width: 300, height: 300)
    }
    .defaultScrollAnchor(.center)
    .background {
      Color.blue
    }
    .padding(.top, 1)
  }
}
```

![](/blog/img/20261020/padding.png)

`ScrollView` とタイトルバー（ツールバー）の接触がなければ良いので、`VStack` 等で別の要素が上に配置されている場合でも妙な磨りガラス効果は発生しない。
