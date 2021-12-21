---
title: SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その4　メニューコマンドの実装
layout: post
tags: dev macos ios swiftui
---

SwiftUIでDocument-Based Appな画像閲覧アプリ習作の覚書その4。

このシリーズの他のブログは、

- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その1　プロジェクト作成から画像の表示まで]({% post_url 2021-08-23-building-swiftui-document-based-app-part1 %})
- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その2　ジェスチャによる拡大縮小]({% post_url 2021-08-24-building-swiftui-document-based-app-part2 %})
- [SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その3　ツールバーの実装]({% post_url 2021-08-26-building-swiftui-document-based-app-part3 %})

作成したプロジェクトはGitHubで公開している。

- [https://github.com/GenjiApp/ImageViewerSwiftUI](https://github.com/GenjiApp/ImageViewerSwiftUI)

ビルド環境は、

- macOS 12.1
- Xcode 13.2.1

である。

[前回]({% post_url 2021-08-26-building-swiftui-document-based-app-part3 %})はツールバーを実装した。今回はメニューコマンドを実装する。

ここで、今回のキモとなる`.focusedSceneValue`は、本来はmacOS/iOS共通して使えるものであるが、iOS 15.2のiPhone 8実機およびiPadシミュレータでは動作しなかった。macOSは12.0.1までは動作しなかったが、12.1で動作するようになった。

## `.commands`、`CommandMenu`、`CommandGroup`

メニューコマンドを実装するには、`WindowGroup`シーンや`DocumentGroup`シーンに対して`.commands`を指定し、`CommandMenu`あるいは`CommandGroup`を使ってメニュー構造を作る。

```swift
@main
struct ImageViewerSwiftUIApp: App {
  var body: some Scene {
    DocumentGroup(viewing: ImageDocument.self) { file in
      ContentView(document: file.document)
    }
    .commands {
      CommandMenu("MyMenu") {
        Button("Action 1") { print("action 1") }
      }
      CommandGroup(after: .toolbar) {
        Button("Action 2") { print("action 2") }
      }
    }
  }
}
```

`CommandMenu`はメニューバーのトップレベルに新しいメニューを作り、`CommandGroup`は既存のメニューの中にメニュー項目を作る。

ここで、マルチウィンドウなDocument-Based Appのメニューコマンドを実装するとき、複数存在しうるウィンドウ（ドキュメント）のどれに対してのアクション／操作なのかを指定したい。メニューコマンドの実装部分はドキュメントオブジェクトが存在するスコープの外なので、そのままでは対象のドキュメントを指定できない。

そこで`.focusedSceneValue(_:_:)`を使う。

## `.focusedSceneValue(_:_:)`、`FocusedValueKey`、`FocusedValues`

`.focusedSceneValue(_:_:)`はシーンの切り替わりに応じて、通常はアクティブなウィンドウの切り替わりに応じて、何らかの値を公開できる機能である。今回のDocument-Based Appな画像閲覧アプリの場合、シーン（ウィンドウ）とドキュメントオブジェクトが一対一対応しているので、シーン（ウィンドウ）の切り替わりに応じて対応するドキュメントオブジェクトを`.focusedSceneValue(_:_:)`で公開すると良い。

`.focusedSceneValue(_:_:)`を使うには、準備として`FocusedValueKey`プロトコルに準拠した構造体の定義と`FocusedValues`構造体の拡張が必要となる。

```swift
struct FocusedSceneDocumentKey: FocusedValueKey {
  typealias Value = ImageDocument
}

extension FocusedValues {
  var focusedSceneDocument: ImageDocument? {
    get { self[FocusedSceneDocumentKey.self] }
    set { self[FocusedSceneDocumentKey.self] = newValue }
  }
}
```

ほとんど定型文的な記述になる。

`FocusedValueKey`プロトコルに準拠した構造体では公開したい値の型を指定する。ここでの`ImageDocument`は`ReferenceFileDocument`な参照型のドキュメントオブジェクトである。この構造体の型を次の計算型プロパティで使用する。

`FocusedValues`構造体の拡張では計算型プロパティを定義する。プロパティの型は公開したい型のオプショナル型になる。このプロパティ名が後述の`.focusedSceneValue(_:_:)`で使用するkey path名となる。

これで準備完了。シーン配下のビューで`.focusedSceneValue(_:_:)`を使う。

```swift
struct ImageViewerSwiftUIApp: App {
  var body: some Scene {
    DocumentGroup(viewing: ImageDocument.self) { file in
      ContentView(document: file.document)
        .focusedSceneValue(\.focusedSceneDocument, file.document)
    }
  }
}
```

第一引数には`FocusedValues`構造体の拡張で作ったプロパティ名をkey path名として指定し、第二引数で公開したい値を指定する。

公開された値を使用するときは`@FocusedValue`プロパティラッパを使用する。

```swift
@FocusedValue(\.focusedSceneDocument) var document
```

`@FocusedValue`なプロパティの宣言には、`FocusedValues`構造体で作ったプロパティ名をkey path名として指定する。`@FocusedValue`なプロパティは、`.focusedSceneValue(_:_:)`で公開されているドキュメントオブジェクト、あるいは`nil`が入っているオプショナル型である。

## メニューコマンドの外部化

今回はメニューコマンドの実装を外部化する。通常のビューを外部化するときは`View`プロトコルが用いられるが、メニューコマンドの場合は`Commands`プロトコルを使用する。

```swift
struct ImageViewerSwiftUIApp: App {
  var body: some Scene {
    DocumentGroup(viewing: ImageDocument.self) { file in
      ContentView(document: file.document)
        .focusedSceneValue(\.focusedSceneDocument, file.document)
    }
    .commands {
      ZoomCommands()
    }
  }
}

struct ZoomCommands: Commands {

  @FocusedValue(\.focusedSceneDocument) var document

  var body: some Commands {
    CommandGroup(after: .toolbar) {
      Button("Actual Size") {
        document?.resetViewSize(animate: true)
      }
      .keyboardShortcut(KeyEquivalent("0"))
      .disabled(document == nil)

      Button("Zoom In") {
        document?.scaleViewSize(2.0, animate: true)
      }
      .keyboardShortcut(KeyEquivalent("+"))
      .disabled(document == nil)

      Button("Zoom Out") {
        document?.scaleViewSize(0.5, animate: true)
      }
      .keyboardShortcut(KeyEquivalent("-"))
      .disabled(document == nil)

      Divider()
    }
  }
}
```

前回までで実装した閲覧中の画像の拡大・縮小表示を行う処理を実装した。

既存のViewメニューの中に入れたかったので、`CommandGroup(after: .toolbar){ ... }`とし、Viewメニューの中のツールバー関連メニューの次に表示させるようにした。

キーボードショートカットやメニュー項目の有効・無効化処理も入れている。メニューに境界線を引きたいときは`Divder()`を使う。

## 終わりに

この`.focusedSceneValue`の方法はiOSでも使えるはずなのだが、iOS 15.2の段階では`@FocusedValue`なプロパティが常に`nil`になって正常に動作しない。macOSでも12.0.1では同様だった。本来はmacOS 12.0、iOS 15.0から使えていなければならなかった。

また、SwiftUIがまだまだ過渡期ゆえだとは思うが、`.focusedSceneValue(_:_:)`ではなく、アクティブなドキュメントを簡便に参照できるような仕組みは最初から入っていて欲しかった。定型文的な準備が必要なのはなんか変だ。
