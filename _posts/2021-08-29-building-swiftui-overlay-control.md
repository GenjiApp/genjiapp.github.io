---
title: SwiftUIでマウスホバー時にオーバレイ表示される操作UIを実装する
layout: post
tags: macos dev swiftui
---

ウィンドウ下部にマウスを持っていくと、メインの領域の上に重なるように表示される操作UIを実装する。こんな感じ。

![](/blog/img/20210829/06-complete.gif)

動画プレイヤアプリの再生ボタン等がこんな感じで実装されていることがよくある。本項ではこれを「オーバレイ操作UI」と呼ぶことにする。

成果物をGitHubに公開する。

- [GenjiApp/OverlayControlSwiftUI](https://github.com/GenjiApp/OverlayControlSwiftUI)

ビルド環境は、

- macOS 11.5.2
- Xcode 12.5.1

である。

## 操作UIの重ね合わせ表示

一例として以下のようなビューがあるとする。

![](/blog/img/20210829/01-image-view.png)

```swift
struct ContentView: View {
  var body: some View {
    Image(systemName: "star")
      .font(.system(size: 500))
  }
}
```

オーバレイ操作UIに入れるUI部品を今回は`Slider`にするとして、そのスライダ値によって星の色を変える場合を考える。

```swift
struct ContentView: View {

  @State private var hue = 0.5

  var body: some View {
    ZStack {
      Image(systemName: "star")
        .font(.system(size: 500))
        .foregroundColor(Color(hue: self.hue, saturation: 1.0, brightness: 1.0))
      VStack {
        Spacer()
        Slider(value: self.$hue, in: 0...1) {
          Text("Hue:")
        }
        .frame(width: 250)
        .padding()
        .background(
          Capsule()
            .fill(Color(.windowBackgroundColor))
            .shadow(radius: 5)
        )
      }
      .padding(.bottom, 16)
    }
  }
}
```

全体を`ZStack`に入れ、元の`Image`と目的のUI部品を併置する。今回はオーバレイ操作UIをウィンドウ下部に配置したいので、`VStack`と`Spacer`を組み合わせた。また、UI部品の背景を描画するため、`background`と`Capsule`を使用した。メインの領域と境界をわかりやすくするため、`shadow`も加えた。

![](/blog/img/20210829/02-overlay-control.gif)

## `onHover`で表示・非表示の切り替え

これではオーバレイ操作UIが表示しっぱなしなので、領域にマウスが入ったときにだけ表示されるようにする。

```swift
struct ContentView: View {

  @State private var hue = 0.5
  @State private var isHover = false

  var body: some View {
    ZStack {
      Image(systemName: "star")
        .font(.system(size: 500))
        .foregroundColor(Color(hue: self.hue, saturation: 1.0, brightness: 1.0))
      VStack {
        Spacer()
        Slider(value: self.$hue, in: 0...1) {
          Text("Hue:")
        }
        .frame(width: 250)
        .padding()
        .background(
          Capsule()
            .fill(Color(.windowBackgroundColor))
            .shadow(radius: 5)
        )
        .onHover { hovering in
          withAnimation {
            self.isHover = hovering
          }
        }
      }
      .padding(.bottom, 16)
      .opacity(self.isHover ? 1.0 : 0.0)
    }
  }
}
```

`onHover`はマウスがその領域に出入りするときに呼ばれる。クロージャの引数`hovering`に出入りの状態が`Bool`型で入っているので、`@State`なプロパティ`isHover`に代入する。`isHover`はオーバレイ操作UI全体を包む`VStack`の`opacity`の条件として用いる。`isHover`代入時に`withAnimation`を用いることで、ふわっとした表示・非表示の切り替えがされるようになる。

![](/blog/img/20210829/03-onhover.gif)

これで、領域内へマウスが入ったときにだけオーバレイ操作UIが表示されるようになるが、スライダ操作中に領域外へ出てしまうと非表示になってしまう問題がある。

### 2023年3月18日追記

少なくともmacOS 13.2.1では、`.opacity()`と`.onHover()`の順番が重要で、`.opacity()`を先に記述しないと、`.onHover()`が反応しなかったり、反応する領域が狭く変化してしまうという問題がある（参照：[SwiftUIの .opacity() と .onHover() は順番が重要]({% post_url 2023-03-18-order-of-opacity-and-onhover %})）。

したがって、前記コードの`.opacity()`を`.onHover()`の前に移動させなければならない（後記コードも同様）。

## 操作中の非表示を抑制

スライダ操作中は非表示にならないよう工夫をする。

```swift
struct ContentView: View {

  @State private var hue = 0.5
  @State private var isHover = false
  @State private var isEditing = false

  var body: some View {
    ZStack {
      Image(systemName: "star")
        .font(.system(size: 500))
        .foregroundColor(Color(hue: self.hue, saturation: 1.0, brightness: 1.0))
      VStack {
        Spacer()
        Slider(value: self.$hue, in: 0...1, onEditingChanged: { editing in
          withAnimation {
            self.isEditing = editing
          }
        }, label: {
          Text("Hue:")
        })
        .frame(width: 250)
        .padding()
        .background(
          Capsule()
            .fill(Color(.windowBackgroundColor))
            .shadow(radius: 5)
        )
        .onHover { hovering in
          withAnimation {
            self.isHover = hovering
          }
        }
      }
      .padding(.bottom, 16)
      .opacity(self.isHover || self.isEditing ? 1.0 : 0.0)
    }
  }
}
```

`Slider`の作成を`init(value:in:onEditingChanged:label:)`を使うようにした。増えた`onEditingChanged`の部分は、スライダ操作開始でクロージャ引数に`true`が、操作終了で`false`が入る。これを`@State`なプロパティ`isEditing`に代入する。オーバレイ操作UI全体の`VStack`に付けた`opacity`の条件に`isEditing`も加えることで、スライダ操作中は非表示にならなくなる。

![](/blog/img/20210829/04-onediting.gif)

## 最初の数秒間は表示させる

さらに一工夫。初見ではオーバレイ操作UI自体の存在が認知されないので、最初の数秒間はオーバレイ操作UIが表示されるようにする。

```swift
struct ContentView: View {

  @State private var hue = 0.5
  @State private var isHover = true
  @State private var isEditing = false
  @State private var timer: Timer? = nil

  var body: some View {
    ZStack {
      Image(systemName: "star")
        .font(.system(size: 500))
        .foregroundColor(Color(hue: self.hue, saturation: 1.0, brightness: 1.0))
      VStack {
        Spacer()
        Slider(value: self.$hue, in: 0...1, onEditingChanged: { editing in
          withAnimation {
            self.isEditing = editing
          }
        }, label: {
          Text("Hue:")
        })
        .frame(width: 250)
        .padding()
        .background(
          Capsule()
            .fill(Color(.windowBackgroundColor))
            .shadow(radius: 5)
        )
        .onHover { hovering in
          self.timer?.invalidate()
          self.timer = nil
          withAnimation {
            self.isHover = hovering
          }
        }
      }
      .padding(.bottom, 16)
      .opacity(self.isHover || self.isEditing ? 1.0 : 0.0)
    }
    .onAppear {
      self.timer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { _ in
        withAnimation {
          self.isHover = false
        }
        self.timer?.invalidate()
        self.timer = nil
      }
    }
  }
}
```

`isHover`プロパティの初期値を`true`にし、ビュー表示時にはオーバレイ操作UIが出ている状態にする。それと同時に、ビュー全体を包む`ZStack`に`onAppear`を付けて、その中で数秒後に`isHover`を`false`に切り替える`Timer.scheduledTimer`を作った。

また、タイマ発火前にオーバレイ操作UIの領域に入り、領域にいるままにタイマが発火すると、領域内にマウスがあるのに非表示なってしまう。タイマ発火前に領域に入った場合は、タイマを破棄する処理を入れる。

![](/blog/img/20210829/05-onappear.gif)

## ビューの切り出し

最後に、使い回しができるようにコンテナビューとして切り出す。

```swift
struct ContentView: View {

  @State private var hue = 0.5
  @State private var isEditing = false

  var body: some View {
    VStack {
      OverlayControlContainer(isEditing: self.$isEditing, content: {
        Image(systemName: "star")
          .font(.system(size: 500))
          .foregroundColor(Color(hue: self.hue, saturation: 1.0, brightness: 1.0))
      }, overlayControl: {
        Slider(value: self.$hue, in: 0...1, onEditingChanged: { editing in
          withAnimation {
            self.isEditing = editing
          }
        }, label: {
          Text("Hue:")
        })
        .frame(width: 250)
      })
    }
  }
}

struct OverlayControlContainer<Content: View, OverlayControl: View>: View {

  @Binding var isEditing: Bool
  @ViewBuilder let content: Content
  @ViewBuilder let overlayControl: OverlayControl
  @State private var isHover = true
  @State private var timer: Timer? = nil

  var body: some View {
    ZStack {
      self.content
      VStack {
        Spacer()
        self.overlayControl
          .padding()
          .background(
            Capsule()
              .fill(Color(.windowBackgroundColor))
              .shadow(radius: 5)
          )
          .onHover { hovering in
            self.timer?.invalidate()
            self.timer = nil
            withAnimation {
              self.isHover = hovering
            }
          }
      }
      .padding(.bottom, 16)
      .opacity(self.isHover || self.isEditing ? 1.0 : 0.0)
    }
    .onAppear {
      self.timer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: false) { _ in
        withAnimation {
          self.isHover = false
        }
        self.timer?.invalidate()
        self.timer = nil
      }
    }
  }
}

```

完成！

![](/blog/img/20210829/06-complete.gif)

