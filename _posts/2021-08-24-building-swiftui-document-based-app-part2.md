---
title: SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その2　ジェスチャによる拡大縮小
layout: post
tags: [development, ios, os x, swiftui]
---

SwiftUIでDocument-Based Appな画像閲覧アプリ習作の覚書その2。PNG/JPEG画像を開いて閲覧、スクロール、ピンチジェスチャで拡大縮小、ツールバーにボタン配置等を実装した。

前回のブログは、

- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その1　プロジェクト作成から画像の表示まで]({% post_url 2021-08-23-building-swiftui-document-based-app-part1 %})

作成したプロジェクトはGitHubで公開している。

- [https://github.com/GenjiApp/ImageViewerSwiftUI](https://github.com/GenjiApp/ImageViewerSwiftUI)

ビルド環境は、

- macOS 11.5.2
- Xcode 12.5.1

である。

[前回]({% post_url 2021-08-23-building-swiftui-document-based-app-part1 %})までで、画像を開いて表示できるところまでを作成した。今回は開いた画像の拡大縮小表示の実装を行う。

## `MagnificationGesture`でピンチジェスチャの実装

ビューに対して`.gesture(_:including:)`を付けるとジェスチャ操作を実装できる。第1引数は`Gesture`プロトコルに適合したオブジェクトを渡す。標準で、

- `TapGesture`
- `LongPressGesture`
- `DragGesture`
- `MagnificationGesture`
- `RotationGesture`

が用意されているので、いずれかを使う。今回はピンチジェスチャによる画像の拡大縮小表示がしたいので、`MagnificationGesture`を使う。

```swift
struct ContentView: View {
  
  ...
  
  @GestureState private var scale: CGFloat = 1.0
  
  var magnificationGesture: some Gesture {
    MagnificationGesture()
      // gestureState に値を代入すると、それが @GestureState のプロパティに入る。
      // @GestureState のプロパティはジェスチャ終了時に自動的に初期値にリセットされる。
      // 急激な拡大・縮小を防ぐため、値の範囲に制限を加える。
      .updating(self.$scale) { currentValue, gestureState, _ in
        if currentValue < 0.1 {
          gestureState = 0.1
        }
        else if currentValue > 5 {
          gestureState = 5
        }
        else {
          gestureState = currentValue
        }
      }
      // ジェスチャ完了時の最終的な値が finalValue に入っている。
      // これを使って実際に表示サイズを変更する。
      // .updating() で @GestureStateに加えた制限は finalValue には
      // 適用されないので、改めて範囲制限を加える。
      .onEnded { finalValue in
        var scale = finalValue
        if scale < 0.1 {
          scale = 0.1
        }
        else if scale > 5 {
          scale = 5
        }
        self.document.scaleViewSize(scale)
      }
  }
  
  var body: some View {

    ScrollView([.horizontal, .vertical]) {
      Image(ivImage: document.image)
        .resizable()
        .aspectRatio(contentMode: .fit)
        // ジェスチャ中の見掛け上の表示サイズ変更をする。
        // @GestureState なプロパティはジェスチャ終了時には初期値にリセットされる。
        .scaleEffect(self.scale)
        // ジェスチャ完了後の実際の表示サイズは .frame(width:, height:) を使う。
        // .scaleEffect() では ScrollView から見た表示サイズが変更されないので、
        // スクロールが狂う。
        .frame(width: self.document.viewSize.width,
               height: self.document.viewSize.height)
        .gesture(magnificationGesture)
    }
  }
}
```

ここで、`Gesture`プロトコルにはジェスチャ操作中の値変化ごとに発火するメソッドがふたつと、ジェスチャ操作終了後に発火するメソッドがひとつ存在する。

- `updating(_:body:)`
  `@GestureState`なプロパティと組み合わせて、値変化ごとの一時的なビューの状態変化を実装するときに使用
- `onChanged(_:)`
  値変化ごとのビューの永続的な状態変化を実装するときに使用
- `onEnded(_:)`
  ジェスチャ操作完了後の最後の値が渡ってくる。

今回はジェスチャ操作中の一時的な見掛け上の拡大縮小表現を、`updating(_:body:)`と`Image`ビューにつけた`scaleEffect(_:anchor:)`で実装した。実際の表示サイズ変更はジェスチャ操作完了後に`onEnded(_:)`で実装した。

### `updating(_:body:)`の実装

`updating(_:body:)`の第1引数に`@GestureState`なプロパティを渡すと、ジェスチャ操作中の値をそのプロパティから見ることができる。ジェスチャの値は種類ごとに異なり、`MagnificationGesture`の場合は`typealias Value = CGFloat`として実装されており、拡大縮小率として使用できる。

`updating(_:body:)`の第2引数は`@escaping (Self.Value, inout State, inout Transaction) -> Void)`なコールバックになっており、その第1引数は現在のジェスチャの値、第2引数は`updating(:body:)`の第1引数で与えた`@GestureState`なプロパティのエイリアス的な変数で`inout`指定になっている。この第2引数に値を代入することで、`@GestureState`なプロパティに操作中のジェスチャの値が入る。

`updating(:body:)`に関係するところを抜き出した実装が以下である。

```swift
struct ContentView: View {

  @ObservedObject var document: ImageDocument
  @GestureState private var scale: CGFloat = 1.0

  var magnificationGesture: some Gesture {
    MagnificationGesture()
      .updating(self.$scale) { currentValue, gestureState, _ in
        if currentValue < 0.1 {
          gestureState = 0.1
        }
        else if currentValue > 5 {
          gestureState = 5
        }
        else {
          gestureState = currentValue
        }
      }
  }
  var body: some View {
    ScrollView([.horizontal, .vertical]) {
      Image(ivImage: document.image)
        .scaleEffect(self.scale)
        .gesture(self.magnificationGesture)
    }
  }
}
```

急激な拡大縮小を防ぐため、`@GestureState`なプロパティ（のエイリアス的存在である`gestureState`）には値の範囲の制限を加えている。

これでジェスチャ操作中に`Image`が拡大縮小表示されるようになるが、問題点がふたつある。

- `@GestureState`なプロパティはジェスチャ操作が終了すると初期値にリセットされる。したがって、上の実装だけでは、ジェスチャ操作を終えると元の大きさに戻る（`.scaleEffect(1.0)`と同義となる）。
- `scaleEffect(_:anchor:)`は見掛け上の拡大縮小をするだけで、`ScrollView`から見た`Image`のサイズが変わるわけではない。したがって、最終的な表示サイズ変更を`scaleEffect(:anchor:)`だけに任せるとスクロールが狂う。

###  `viewSize`プロパティの実装と`frame(width:height:alignment:)`の付与

前項の問題点解消のため、`Image`の永続的な表示サイズの変更には`frame(width:height:alignment:)`を用いる。このとき、引数に与える幅と高さを保持する`viewSize`プロパティをドキュメントモデルに実装する。

```swift
class ImageDocument: ReferenceFileDocument {

  ...

  var image: IVImage
  @Published var viewSize: CGSize

  init(image: IVImage = IVImage()) {
    self.image = image
    self.viewSize = image.size
  }

  required init(configuration: ReadConfiguration) throws {
    guard let data = configuration.file.regularFileContents,
          let image = IVImage(data: data)
    else {
      throw CocoaError(.fileReadCorruptFile)
    }
    self.image = image
    self.viewSize = image.size
  }
  
  ...
  
  // MARK: -
  func scaleViewSize(_ scale: CGFloat) {
    self.scaleViewSize(scale, animate: false)
  }

  func scaleViewSize(_ scale: CGFloat, animate: Bool) {
    let newViewSize = CGSize(width: self.viewSize.width * scale, height: self.viewSize.height * scale)
    // 元のサイズの0.2倍以下、および5倍以上の場合は補正
    if newViewSize.width < self.image.size.width * 0.2 {
      self.scaleViewSize(scale * 1.1)
    }
    else if newViewSize.width > self.image.size.width * 5 {
      self.scaleViewSize(scale / 1.1)
    }
    else {
      if animate {
        withAnimation {
          self.viewSize = newViewSize
        }
      }
      else {
        self.viewSize = newViewSize
      }
    }
  }

  func resetViewSize() {
    self.resetViewSize(animate: false)
  }

  func resetViewSize(animate: Bool) {
    if animate {
      withAnimation {
        self.viewSize = self.image.size
      }
    }
    else {
      self.viewSize = self.image.size
    }
  }

}
```

`viewSize`プロパティの変化をビューに通知して再描画させるため、`@Published`を付けた。`image`プロパティの`size`で初期化する。また、拡大縮小率を与えて`viewSize`プロパティを変化させるメソッドも実装した。拡大縮小されすぎないような制限も加えている。

この`viewSize`プロパティを用いて`Image`の表示サイズを変更する。

```swift
Image(ivImage: document.image)
  .resizable()
  .aspectRatio(contentMode: .fit)
  .scaleEffect(self.scale)
  .frame(width: self.document.viewSize.width,
         height: self.document.viewSize.height)
  .gesture(magnificationGesture)
```

表示サイズの変更に`frame(width:height:alignment:)`を用いた。またサイズ変更可能にするため、`resizable(capInsets:resizingMode:)`を併せて付与する。今回のサイズ変更はかならず縦横同率で変更するので必要ないが`aspectRatio(_:contentMode:)`も一応つけておく。

この段階では、まだ実際に`viewSize`を変化させる処理の呼び出しがないので、永続的なサイズ変更はされない。

### `onEnded(_:)`の実装

実際の表示サイズ変更処理の呼び出しを`onEnded(_:)`で実装する。

```swift
var magnificationGesture: some Gesture {
    MagnificationGesture()
      .updating(self.$scale) { currentValue, gestureState, _ in
        ...
      }
      .onEnded { finalValue in
        var scale = finalValue
        if scale < 0.1 {
          scale = 0.1
        }
        else if scale > 5 {
          scale = 5
        }
        self.document.scaleViewSize(scale)
      }
}
```

`onEnded(_:)`の第1引数は`@escaping (Self.Value) -> Void`なコールバックでジェスチャ操作完了時に呼ばれる。その第1引数にはジェスチャの最終的な値が入っている。この最終値は`updating(_:body:)`で加えた制限とは関係がないので、改めて値の制限を行う。

ここまでで、ジェスチャ操作の実装は完了である。

![](/blog/img/20210824/01-magnification-gesture.gif)

次回はツールバーを実装する。
