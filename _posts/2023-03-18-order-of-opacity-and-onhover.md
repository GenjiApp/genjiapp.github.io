---
title: SwiftUIの .opacity() と .onHover() は順番が重要
layout: post
tags: swiftui dev macos
---

いつの頃からかは解らないが、少なくともmacOS 13.2.1のSwiftUIでは`.opacity()`と`.onHover()`の順番が重要になっている。

環境：
- macOS 13.2.1
- Xcode 14.2 (14C18)

以下のようなSwiftUIビューがあったとする。

![](/blog/img/20230318/onhover.png)

```swift
struct ContentView: View {

  @State private var isOn = false

  var body: some View {
    Toggle("Toggle", isOn: $isOn)
      .toggleStyle(.switch)
      .onHover { isHovering in
        print(isHovering)
      }
      .padding()
  }
}
```

`Toggle`スウィッチの領域にマウスポインタを持っていく（ホバーする）と、`.onHover()`が反応する。ここで`.opacity()`を付けて`Toggle`に透明度を設定したいとする。

```swift
struct ContentView: View {

  @State private var isOn = false

  var body: some View {
    Toggle("Toggle", isOn: $isOn)
      .toggleStyle(.switch)
      .onHover { isHovering in
        print(isHovering)
      }
      .opacity(0.0)
      .padding()
  }
}
```

`.onHover()`の後ろに`.opacity()`を付与した場合、macOS 11では完全に透明にしても`.onHover()`は反応していたが、macOS 13では反応しなくなっていた。完全に透明にしたのがいけなかったのかと思い、`.opacity(0.5)`とかしてみると反応してくれる。なるほど。では、`.opacity(0.3)`なら？　なぜか「Toggle」と書かれたラベル部分にマウスを乗せても反応せず、スウィッチ部分に乗せた場合にだけ反応する。`.onHover()`が反応する領域が変化するという変な挙動を示す。

```swift
struct ContentView: View {

  @State private var isOn = false

  var body: some View {
    Toggle("Toggle", isOn: $isOn)
      .toggleStyle(.switch)
      .opacity(0.0)
      .onHover { isHovering in
        print(isHovering)
      }
      .padding()
  }
}
```

のように`.opacity()`を先に記述すると、完全に透明にした場合でも`.onHover()`が反応するし、ラベル部分であってもちゃんと反応領域に含まれる。

というわけで、（少なくともmacOS 13.2.1では）`.opacity()`が先、`.onHover()`が後という順番でないといけない。