---
title: SwiftUI macOSアプリでファイルを開く
layout: post
tags: dev swiftui macos
---

SwiftUIの非Document AppなmacOSアプリにおいて、ファイルを開く処理を実装する。今回は以下の3つの手法を試した。

- `NSOpenPanel`
- `fileImporter()`
- `onDrop()`

成果物をGitHubに公開している。

- [GenjiApp/OpenImageSwiftUI_macOS](https://github.com/GenjiApp/OpenImageSwiftUI_macOS)

ビルド環境は、

- macOS 11.5.2
- Xcode 12.5.1

である。

## `NSOpenPanel`

まずは、これまで通り`NSOpenPanel`を使う方法から。以下のようなビューがあったとする。

![](/blog/img/20210906/01-view.png)

`Image`と`Button`が並んでおり、`Button`押下で`NSOpenPanel`を表示、選択された画像を`Image`に表示する場合を考える。対応する画像形式はPNGとJPEG、`Image`のサイズは一定とする。

```swift
import SwiftUI
import UniformTypeIdentifiers

struct NSOpenPanelView: View {

  @State private var image: NSImage? = nil

  var body: some View {
    VStack {
      Image(nsImage: image ?? NSImage())
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: 500, height: 500)

      Button("Open") {
        let openPanel = NSOpenPanel()
        openPanel.allowsMultipleSelection = false
        openPanel.canChooseDirectories = false
        openPanel.canChooseFiles = true
        openPanel.allowedFileTypes = [UTType.png.identifier, UTType.jpeg.identifier]
        if openPanel.runModal() == .OK {
          guard let url = openPanel.url,
                let newImage = NSImage(contentsOf: url)
          else { return }
          image = newImage
        }
      }
      .padding()
    }
  }
}
```

`Button`の`action`コールバック内で`NSOpenPanel`を生成し、`runModal()`してやればよい。その返り値が`.OK`の場合はファイル選択が成功し、`NSOpenPanel`の`url`プロパティに選択されたファイルのURLが入っている。

対応形式にUTIが求められるときは`UTType`型を使うとよい。`UTType`は新しい型で、UTIを使うAPIによっては`UTType`型を求められたり、`String`型で求められたりが混在している。`String`型を求められているAPIなら`UTType`の`identifier`を使う。`UTType`型を使うときは`import UniformTypeIdentifiers`が必要である。後の項でも同様。

## `fileImporter()`

SwiftUIらしいやり方として、`fileImporter(isPresented:allowedContentTypes:onCompletion:)`やそのヴァリエーションを使う方法がある。前項と同様のビューがあったとする。

![](/blog/img/20210906/01-view.png)

今度も`Button`押下でファイル選択のパネルを出す。

```swift
import SwiftUI
import UniformTypeIdentifiers

struct FileImporterView: View {

  @State private var image: NSImage? = nil
  @State private var importerPresented = false

  var body: some View {
    VStack {
      Image(nsImage: image ?? NSImage())
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: 500, height: 500)

      Button("Open") {
        importerPresented = true
      }
      .padding()
    }
    .fileImporter(isPresented: $importerPresented, allowedContentTypes: [.png, .jpeg]) { result in
      switch result {
      case .success(let url):
        guard let newImage = NSImage(contentsOf: url) else { return }
        image = newImage
      case .failure:
        print("failure")
      }
    }
  }
}
```

`fileImporter()`は、その第1引数`isPresented`に指定する`@State`なプロパティが`true`になったときにファイル選択パネルを表示する。`Button`押下時の`action`としてそのプロパティを`true`にする処理を入れてやればよい。`isPresented`に指定したプロパティは、ファイル選択パネルでの操作が終わったときに自動的に`false`に戻る。

`fileImporter()`のコールバックの引数は`Result<URL, Error>`型なので`switch`文でURLを取り出し、画像を生成する。

ファイル選択パネルでキャンセルしても`.failure`にはならないようである。

## `onDrop()`

画像のドラッグ＆ドロップも試してみる。以下のような`Image`が全面に配置されたビューがあったとする。

![](/blog/img/20210906/02-drop-overlay.gif)

ドラッグ＆ドロップによって`Image`に画像を表示する場合を考える。また、ドラッグ中に画像がビューの領域に入った場合は、`Text`をオーバーレイ表示させるとする。

```swift
import SwiftUI
import UniformTypeIdentifiers

struct DropView: View {

  @State private var image: NSImage? = nil
  @State private var isDropTargeted = false

  var body: some View {
    ZStack {
      Image(nsImage: image ?? NSImage())
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: 500, height: 500)
      if isDropTargeted {
        Rectangle()
          .fill(Color(.windowBackgroundColor))
          .opacity(0.8)
          .overlay(
            Text("Drop Here")
              .font(.system(size: 64).bold())
          )
      }
    }
    .onDrop(of: [.png, .jpeg, .url, .fileURL], isTargeted: $isDropTargeted) { providers in
      guard let provider = providers.first
      else { return false }
      if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
        provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { data, error in
          guard let imageData = data as? Data,
                let newImage = NSImage(data: imageData)
          else { return }
          image = newImage
        }
      }
      else if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
        provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { data, error in
          guard let urlData = data as? Data,
                let url = URL(dataRepresentation: urlData, relativeTo: nil),
                let newImage = NSImage(contentsOf: url)
          else { return }
          image = newImage
        }
      }
      return true
    }
  }
}
```

ドロップに対応させるには`onDrop(of:isTargeted:perform:)`やそのヴァリエーションを使う。

第1引数で対応形式を指定するが、今回は`[.png, .jpeg, .url, .fileURL]`とした。

他のアプリから画像データそのものがドロップされた場合`.png`や`.jpeg`に対応する。Music.appの「情報を見る」の「アートワーク」タブから画像をドロップした場合などがこれである。

Safariで画像のURLを開き、アドレス欄のファビコン部分をドラッグ＆ドロップした場合は`.url`に対応する。このとき、データの取得にインターネットアクセスを必要とするので、App Sandboxの設定で「Outgoing Connections (Client)」のチェックを入れておく。

Finderから画像ファイルをドロップした場合や、プレビューアプリのタイトルバー部分のアイコンをドロップした場合は`.fileURL`に対応する。

また、Safariで表示されている画像そのものをドロップした場合は、`.png`等の画像形式と`.url`形式に両対応する。

ドロップされたデータの読み込みは`loadItem(forTypeIdentifier:options:completionHandler:)`やそのヴァリエーションを使う。今回は`.png`と`.jpeg`はその親形式である`UTType.image`としてまとめて処理し、`.fileURL`は親形式の`.url`とまとめて処理した。`.url`と`.fileURL`に関して、今回は読み込み後の形式チェックはしていないので、PNG/JPEG以外でも`NSImage`が対応している形式であれば読み込みが成功するようになっている。

`onDrop(of:isTargeted:perform:)`の第2引数`isTargeted`に`@State`なプロパティを指定しておけば、ドロップ領域に入った場合に`true`、外に出たときに`false`が入るので、オーバレイ表示するビューの表示・非表示の条件に用いた。

## 最後に

今回は説明のためにそれぞれの読み込み方法を別々のビューに実装したが、実際に使用する場合は前二者の方法と`onDrop()`の方法を組み合わせたり、メニューからの読み込み処理の呼び出しを実装したりするとよい。
