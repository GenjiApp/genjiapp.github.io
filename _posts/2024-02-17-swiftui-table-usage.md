---
title: SwiftUI Tableの使い方
layout: post
tags: dev swiftui macos
---

以下のような構造体の配列をSwiftUIの`Table`ビューに表示する場合を考える。

```swift
struct Bookmark {
  var title: String
  var url: URL
}
```

## 単純に表形式で表示する

データを単純に`Table`に表示したいだけの場合、`Table`の`init<Data>(Data, columns: () -> Columns)`と、`TableColumn`の`init(Text, content: (RowValue) -> Content)`あたりを使う。このとき、表示するデータ構造は`Identifiable`プロトコルに適合させる必要があるので、プロパティに`id`を追加した。

```swift
import SwiftUI

struct Bookmark: Identifiable {

  var id = UUID()
  var title: String
  var url: URL

}

struct ContentView: View {

  @State var sampleData: [Bookmark] = [
    Bookmark(title: "Genji App", url: URL(string: "https://genjiapp.com/")!),
    Bookmark(title: "Apple", url: URL(string: "https://www.apple.com/")!),
    Bookmark(title: "Google", url: URL(string: "https://www.google.com/")!)
  ]

  var body: some View {
    Table(sampleData) {
      TableColumn("Title") { bookmark in
        Text(bookmark.title)
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    }
    .tableStyle(.bordered)
    .padding()
  }

}
```

![](/blog/img/20240217/table1.png)

## 行を選択可能にする

テーブル行を選択可能にする場合、

- `init<Data>(Data, selection: Binding<Value.ID?>, columns: () -> Columns)`（単一選択）
- `init<Data>(Data, selection: Binding<Set<Value.ID>>, columns: () -> Columns)`（複数選択）

あたりを使う。`selection`引数の型が`ID`のオプショナルか、`ID`の`Set`型かの違い。

```swift
struct ContentView: View {

  @State var sampleData: [Bookmark] = [
    Bookmark(title: "Genji App", url: URL(string: "https://genjiapp.com/")!),
    Bookmark(title: "Apple", url: URL(string: "https://www.apple.com/")!),
    Bookmark(title: "Google", url: URL(string: "https://www.google.com/")!)
  ]
  @State private var selectedID: Bookmark.ID?

  var body: some View {
    Table(sampleData, selection: $selectedID) {
      TableColumn("Title") { bookmark in
        Text(bookmark.title)
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    }
    .tableStyle(.bordered)
    .padding()
  }
}
```

![](/blog/img/20240217/table2.png)

行クリック時に選択可能になった。

## ドラッグ＆ドロップで並べ替え

テーブル行をドラッグ＆ドロップで並べ替え可能にするには、`init(of: Value.Type, selection: Binding<Set<Value.ID>>, columns: () -> Columns, rows: () -> Rows)`あたりを使う。先ほどまでのイニシャライザとは使い方がちょっと違う。第一引数に表示するデータの型、最後の`rows`引数には`TableRow`で表示データを供給する。以下のような感じ。

```swift
struct ContentView: View {

  @State var sampleData: [Bookmark] = [
    Bookmark(title: "Genji App", url: URL(string: "https://genjiapp.com/")!),
    Bookmark(title: "Apple", url: URL(string: "https://www.apple.com/")!),
    Bookmark(title: "Google", url: URL(string: "https://www.google.com/")!)
  ]
  @State private var selectedID: Bookmark.ID?

  var body: some View {
    Table(of: Bookmark.self, selection: $selectedID) {
      TableColumn("Title") { bookmark in
        Text(bookmark.title)
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    } rows: {
      ForEach(sampleData) { bookmark in
        TableRow(bookmark)
      }
    }
    .tableStyle(.bordered)
    .padding()
  }

}
```

ここまでは、まだデータの表示と行選択ができるだけで、前項までとは別のイニシャライザを使ったに過ぎない。行をドラッグ＆ドロップできるようにするには、`draggable`と`dropDestination`モディファイアを使う。この時、表示データは`Transferable`プロトコルに適合させる必要があり、そのためには`Codable`プロトコルにも適合させておくとかんたんになる。また、ドラッグ＆ドロップさせるデータのためのカスタム`UTType`も用意する。以下のような感じ。

```swift
import SwiftUI
import UniformTypeIdentifiers

extension UTType {
  static let bookmark = UTType(exportedAs: "com.genjiapp.TableSample.bookmark")
}

struct Bookmark: Identifiable, Codable, Transferable {

  static var transferRepresentation: some TransferRepresentation {
    CodableRepresentation(contentType: .bookmark)
  }

  var id = UUID()
  var title: String
  var url: URL

}

struct ContentView: View {

  @State var sampleData: [Bookmark] = [
    Bookmark(title: "Genji App", url: URL(string: "https://genjiapp.com/")!),
    Bookmark(title: "Apple", url: URL(string: "https://www.apple.com/")!),
    Bookmark(title: "Google", url: URL(string: "https://www.google.com/")!)
  ]
  @State private var selectedID: Bookmark.ID?

  var body: some View {
    Table(of: Bookmark.self, selection: $selectedID) {
      TableColumn("Title") { bookmark in
        Text(bookmark.title)
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    } rows: {
      ForEach(sampleData) { bookmark in
        TableRow(bookmark)
          .draggable(bookmark)
      }
      .dropDestination(for: Bookmark.self) { insertionIndex, insertionBookmarks in
        if let bookmark = insertionBookmarks.first,
           let originalIndex = sampleData.firstIndex(where: { $0.id == bookmark.id }) {
          sampleData.insert(bookmark, at: insertionIndex)
          let removeIndex = (insertionIndex > originalIndex) ? originalIndex : originalIndex + 1
          sampleData.remove(at: removeIndex)
        }
      }
    }
    .tableStyle(.bordered)
    .padding()
  }

}
```

`draggable`は`TableRow`に、`dropDestination`は`TableRow`を囲む`ForEach`に対して指定する。

![](/blog/img/20240217/table3.gif)

また、用意したカスタム`UTType`は、その識別子をInfo.plist内で宣言しておかなければならない。

![](/blog/img/20240217/info-plist.png)
