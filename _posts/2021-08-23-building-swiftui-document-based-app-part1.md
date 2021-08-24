---
title: SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その1　プロジェクト作成から画像の表示まで
layout: post
tags: [development, swiftui, os x, ios]
---

SwiftUIでDocument-Based Appな画像閲覧アプリを習作した。PNG/JPEG画像を開いて閲覧、スクロール、ピンチジェスチャで拡大縮小、ツールバーにボタン配置等を実装した。その覚書その1。

その2は、

[SwiftUIでDocument-Based Appな画像閲覧アプリを作る　その2　ジェスチャによる拡大縮小]({% post_url 2021-08-24-building-swiftui-document-based-app-part2 %})

プロジェクトはGitHubで公開している。

- [https://github.com/GenjiApp/ImageViewerSwiftUI](https://github.com/GenjiApp/ImageViewerSwiftUI)

ビルド環境は、

- macOS 11.5.2
- Xcode 12.5.1

である。

## Document Appテンプレートでプロジェクト作成

SwiftUIでDocument-Based Appなプロジェクトを作成するには「Document App」テンプレートを使用する。今回はmacOS/iOS両対応で作りたいので、「Multiplatform」の「Document App」テンプレートを選択してプロジェクトを作成する。

![](/blog/img/20210823/01-create-project.png)

## Info.plistの設定

Info.plistファイルで、アプリが読み書きできるファイル形式を以下の項目で指定する。

- Document Types（`CFBundleDocumentTypes`）
- Imported Type Identifiers（`UTImportedTypeDeclarations`）
- Exported Type Identifiers（`UTExportedTypeDeclarations`）

Document Typesは必須、既存のファイル形式を扱う場合は「Imported 〜」を、アプリ独自の形式を定義する場合は「Exported 〜」を使用する。

今回は既存のPNG/JPEG画像を扱いたいので、「Exported 〜」は不使用。

![](/blog/img/20210823/02-document-types.png)

Document Typesでは、PNG/JPEGそれぞれに形式の名称やUTIを指定する。また、アプリは画像の閲覧専用とするので、「Role」は「Viewer」を、「Handler Rank」は「Alternate」を選択した。

![](/blog/img/20210823/03-imported-type-identifiers.png)

Imported Type Identifiersでは、それぞれの形式のUTIや拡張子、MIME Type等を指定する。

macOS/iOSのInfo.plistは独立しているので、両対応させる場合は両方で設定を行う必要がある。

## `FileDocument`/`ReferenceFileDocument`で対応形式を宣言

SwiftUI Document-Based Appでは、対応するファイル形式のモデルを`FileDocument`あるいは`ReferenceFileDocument`に適合したオブジェクトで表現する。`FileDocument`あるいは`ReferenceFileDocument`が持つ`static var readableContentTypes: [UTType] { get }`プロパティで、対応する形式のUTIを`[UTType]`で返すようにする。

```swift
  static var readableContentTypes: [UTType] {
    [
      UTType(importedAs: "public.png"),
      UTType(importedAs: "public.jpeg")
    ]
  }
```

今回はPNG/JPEG画像を同様に扱いたいので、ひとつのドキュメントモデルで一緒に宣言した。形式によって読み書きの処理等を変えたい場合は、複数のドキュメントモデルを作成する。

ファイルの書き込みにも対応する場合は、`static var writableContentTypes: [UTType] { get }`を実装する。

## `NSImage`、`UIImage`を一律に扱う

今回のアプリはmacOSとiOSの両対応にしたい。それぞれの環境で画像を表すオブジェクトである`NSImage`、`UIImage`を一律に扱うため、`typealias`を使って`IVImage`なる型を定義する。

```swift
#if os(macOS)
typealias IVImage = NSImage
#elseif os(iOS)
typealias IVImage = UIImage
#endif
```

また、後の工程で画像を表示するビューとしてSwiftUIの`Image`を使うが、`IVImage`を扱えるように`extension`で拡張する。

```swift
extension Image {
  init(ivImage: IVImage) {
    #if os(macOS)
    self.init(nsImage: ivImage)
    #elseif os(iOS)
    self.init(uiImage: ivImage)
    #endif
  }
}
```

## ドキュメントモデルで読み書き処理を実装

`FileDocument`/`ReferenceFileDocument`なドキュメントのモデルで画像の読み書きの処理を実装する。次回の工程でモデルのプロパティを`@Published`にしたかったので、今回のアプリでは`ReferenceFileDocument`で実装する。この場合、

- `typealias Snapshot`の定義
- `init(configuration:)`の実装
- `func fileWrapper(snapshot:configuration:)`の実装
- `func snapshot(contentType:)`の実装

が必要である。

```swift
class ImageDocument: ReferenceFileDocument {

  typealias Snapshot = IVImage

  static var readableContentTypes: [UTType] {
    [
      UTType(importedAs: "public.png"),
      UTType(importedAs: "public.jpeg")
    ]
  }

  var image: IVImage

  init(image: IVImage = IVImage()) {
    self.image = image
  }

  required init(configuration: ReadConfiguration) throws {
    guard let data = configuration.file.regularFileContents,
          let image = IVImage(data: data)
    else {
      throw CocoaError(.fileReadCorruptFile)
    }
    self.image = image
  }

  func fileWrapper(snapshot: IVImage, configuration: WriteConfiguration) throws -> FileWrapper {
    throw CocoaError(.fileWriteUnknown)
  }

  func snapshot(contentType: UTType) throws -> IVImage {
    return self.image
  }

}
```

読み込み処理は、単純に画像を読み込んで`IVImage`（`NSImage`、`UIImage`）型の`image`プロパティに格納する。`func fileWrapper(snapshot:configuration:)`はファイルの書き込みに用いられるが、今回のアプリは閲覧専用なのでエラーを吐かせておく。

`init(image:)`は後の工程でビューのプレビューを表示させるときに空のドキュメントを供給するときに必要なので実装しておいた。

## `DocumentGroup`の指定

`App`プロトコルに適合した構造体の中、`DocumentGroup`シーンでドキュメントモデルの指定を行う。

```swift
struct ImageViewerSwiftUIApp: App {
  var body: some Scene {
    DocumentGroup(viewing: ImageDocument.self) { file in
      ContentView(document: file.document)
    }
  }
}
```

今回は閲覧専用なので、`init(viewing:viewer:)`を使った。第1引数にはドキュメントモデルの型を指定する。複数のドキュメントモデルを用いる場合は、`DocumentGroup`を複数宣言する。

## ビューの作成

`DocumentGroup`内で指定したビューでドキュメントの内容を表示する（前項の`ContentView`）。

```swift
struct ContentView: View {

  @ObservedObject var document: ImageDocument

  var body: some View {
    ScrollView([.horizontal, .vertical]) {
      Image(ivImage: document.image)
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView(document: ImageDocument())
  }
}
```

今回のドキュメントモデルで採用した`ReferenceFileDocument`は`ObservableObject`に適合しているので、プロパティとして保持するときは`@ObservedObject`で受ける。大きな画像を開いたときにスクロールできるように、`Image`を`ScrollView`に内包させた。

ここまでで、とりあえずPNG/JPEG画像を閲覧するアプリが動く。

![](/blog/img/20210823/04-app-window.png)

Document-Based Appなので、複数のウィンドウで別々の画像を開いたり、複数開いたウィンドウをタブでひとつのウィンドウにまとめたりできる。

[次回]({% post_url 2021-08-24-building-swiftui-document-based-app-part2 %})はピンチイン／アウトジェスチャによる画像の拡大縮小の実装を行う。
