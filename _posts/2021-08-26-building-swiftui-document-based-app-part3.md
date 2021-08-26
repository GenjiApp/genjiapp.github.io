---
title: SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その3　ツールバーの実装
layout: post
tags: [dev, macos, ios, swiftui]
---

SwiftUIでDocument-Based Appな画像閲覧アプリ習作の覚書その3。PNG/JPEG画像を開いて閲覧、スクロール、ピンチジェスチャで拡大縮小、ツールバーにボタン配置等を実装した。

このシリーズの他のブログは、

- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その1　プロジェクト作成から画像の表示まで]({% post_url 2021-08-23-building-swiftui-document-based-app-part1 %})
- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その2　ジェスチャによる拡大縮小]({% post_url 2021-08-24-building-swiftui-document-based-app-part2 %})

作成したプロジェクトはGitHubで公開している。

- [https://github.com/GenjiApp/ImageViewerSwiftUI](https://github.com/GenjiApp/ImageViewerSwiftUI)

ビルド環境は、

- macOS 11.5.2
- Xcode 12.5.1

である。

[前回]({% post_url 2021-08-24-building-swiftui-document-based-app-part2 %})、表示した画像をジェスチャで拡大縮小できるようにした。今回はツールバーを実装する。

## ツールバーの実装

ビューに対して`toolbar(content:)`を付与すると、ツールバーをつけることができる。引数`content`には`ToolbarContent`に適合したオブジェクト、具体的には`ToolbarItem`か`ToobarItemGroup`を与える。

```swift
var body: some View {

  ScrollView([.horizontal, .vertical]) {
    ...
  }
  .toolbar {
    ToolbarItem {
      Button("Button 1") { ... }
    }
    ToolbarItemGroup {
      Button("Button 2") { ... }
      Button("Button 3") { ... }
    }
  }
}
```

のような感じ。`toolbar(content:)`の中に適当に要素を列挙していけばよいが、長くなると本来のビューの構造が解りづらくなるので、今回はサブビュー化する方針を採った。

```swift
struct ContentView: View {

  ...

  var body: some View {

    ScrollView([.horizontal, .vertical]) {
      ...
    }
    .toolbar {
      MagnifyToolbarButtons(document: self.document)
    }
  }
}

struct MagnifyToolbarButtons: ToolbarContent {

  let document: ImageDocument

  var body: some ToolbarContent {

    #if os(iOS)
    let placement = ToolbarItemPlacement.bottomBar
    #else
    let placement = ToolbarItemPlacement.automatic
    #endif
    ToolbarItemGroup(placement: placement) {
      Button(action: {
        self.document.scaleViewSize(0.5, animate: true)
      }) {
        Image(systemName: "minus.magnifyingglass")
      }
      Button(action: {
        self.document.resetViewSize(animate: true)
      }) {
        Image(systemName: "equal.circle")
      }
      Button(action: {
        self.document.scaleViewSize(2.0, animate: true)
      }) {
        Image(systemName: "plus.magnifyingglass")
      }
    }
  }
}

```

このとき、サブビューの構造体とその`body`プロパティは`ToolbarContent`に適合させるようにする。

また、iPhoneの場合、画面上部のツールバーに複数のボタンを配置しても最初のひとつしか表示されないため、画面下部のツールバーに表示させるようOSによる場合分けを行なった。

![](/blog/img/20210826/01-toolbar.png)

