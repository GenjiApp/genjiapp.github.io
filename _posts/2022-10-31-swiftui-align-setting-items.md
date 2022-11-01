---
title: SwiftUI macOSアプリの設定ウィンドウ項目をLabeledContentで整列させる
layout: post
tags: dev macos swiftui
---

SwiftUI macOSアプリで、以下のような設定ウィンドウを作りたいとする。

![](/blog/img/20221031/setting-window.png)

ラベルは右揃えで、ポップアップメニューやテキストフィールド等の操作部品は左揃えにして整列させたい。`VStack`や単純な`Form`ではきれいな整列ができない（……ことはないがややこしい黒魔術が必要となる）。よくあるパターンのレイアウトなのに変な感じだった。

そんな中、macOS 13.0から使える新しい`LabeledContent`を`Form`と組み合わせることで、かんたんにきれいな整列が実現できるようになった。

環境は以下の通り。
- macOS 13.0
- Xcode 14.1 RC2
- macOS 13.0 SDK

## `VStack`と単純な`Form`の場合

まずはこれまでの状態を確認してみる。

`VStack`では単純な左揃えや中央揃え等になってしまうので却下。こういった設定項目を縦に並べる場合は`Form`を使う。たとえば以下のような感じ。

```swift
Form {
  Picker("Pref 1:", selection: .constant(1)) {
    Text("Option 1").tag(1)
    Text("Option 2").tag(2)
  }
  .fixedSize()

  TextField("Preference 2:", text: .constant(""))
    .frame(width: 200)

  HStack {
    Text("Long Preference 3:")
    Toggle("Enabled Hoge", isOn: .constant(true))
  }

  HStack {
    Text("Pref 4:")
    Button("Button") { }
  }
}
.padding()
```

このとき、`Picker`や`TextField`など、標準でラベル的要素を持つUIは意図通りきれいに整列される。しかし、標準ではラベル的要素を持たない`Toggle`や`Button`など、ラベル的要素を表現するために`HStack`を使った場合、意図通りには整列されない。

![](/blog/img/20221031/simple-form.png)

macOS 12までは、[Example of aligning labels in SwiftUI.Form on macOS](https://gist.github.com/marcprux/afd2f80baa5b6d60865182a828e83586)にあるような`.alignmentGuide`を使うややこしい黒魔術的な手法で整列させなければならなかった。

## `LabeledContent`の場合

macOS 13.0から`LabeledContent`が使えるようになった。これは前述の`Toggle`や`Button`等の、標準ではラベル的要素を持たないUI部品にラベルを付与できるようになる。そして、それを`Form`と組み合わせることできれいな整列をかんたんに実現できる。こんな感じ。

```swift
Form {
  Picker("Pref 1:", selection: .constant(1)) {
    Text("Option 1").tag(1)
    Text("Option 2").tag(2)
  }
  .fixedSize()

  TextField("Preference 2:", text: .constant(""))
    .frame(width: 300)

  LabeledContent("Long Preference 3:") {
    Toggle("Enabled Hoge", isOn: .constant(true))
  }

  LabeledContent("Pref 4:") {
    Button("Button") {}
  }
}
.padding()
```

前項のコード例と違うのは、`Toggle`と`Button`の部分で`HStack`の代わりに`LabeledContent`を使ってラベルを持たせている点。

![](/blog/img/20221031/labeled-content-form.png)

特に黒魔術は必要なく、素直に意図通りのレイアウトが実現できる。SwiftUIもだんだん良くなってきた！