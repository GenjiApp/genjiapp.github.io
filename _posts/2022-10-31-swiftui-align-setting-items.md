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

## `VStack`や単純な`Form`の場合

まずはこれまでの状態を確認してみる。UIを縦に並べていく場合、`VStack`や`Form`を使う。`VStack`では単純な左揃えや中央揃え等になってしまうので却下。こういった設定項目を縦に並べる場合は`Form`を使う。たとえば以下のような感じ。

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

このとき、`Picker`や`TextField`など、標準で左側にラベル的要素を持つUIは意図通りきれいに整列される。しかし、左側にラベル的要素を持たない`Toggle`や`Button`などは、ラベル的要素を表現するために`HStack`と組み合わせる必要があり、その場合、意図通りには整列されない。

![](/blog/img/20221031/simple-form.png)

macOS 12までは、[Example of aligning labels in SwiftUI.Form on macOS](https://gist.github.com/marcprux/afd2f80baa5b6d60865182a828e83586)にあるような`.alignmentGuide`を使うややこしい黒魔術的な手法で整列させなければならなかった。

## `LabeledContent`の場合

macOS 13.0から`LabeledContent`が使えるようになった。これは前述の`Toggle`や`Button`等の、標準では左側にラベル的要素を持たないUI部品にラベルを付与できるようになる。そして、それを`Form`と組み合わせることできれいな整列をかんたんに実現できる。こんな感じ。

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

## 追記 `.formStyle(.grouped)`

macOS 13.0 Venturaからは`Form`に対して`.formStyle()`で表示形式を変更できるようになった。

```swift
Form {
  Picker("Pref 1", selection: .constant(1)) {
    Text("Option 1").tag(1)
    Text("Option 2").tag(2)
  }

  TextField("Preference 2", text: .constant(""))

  Toggle("Long Long Preference 3", isOn: .constant(true))

  HStack {
    Text("Pref 4")
    Spacer()
    Button("Button") { }
  }

  LabeledContent("Pref 5") {
    Button("Button") { }
  }
}
.formStyle(.grouped)
```

このように`.formStyle(.grouped)`を指定することで、Venturaの新しいシステム設定のような表示形式にできる。

![](/blog/img/20221031/form-style-grouped.png)

この場合、`Toggle`は前述の`LabeledContent`を使わずとも自然に記述できる。`Button`に関しては`HStack`でラベル的要素を付けて整列できるが、`LabeledContent`を使った方が自然な記述ができる。