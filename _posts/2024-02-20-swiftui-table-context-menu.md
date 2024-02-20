---
title: SwiftUIのmacOSアプリでTableにコンテキストメニューをつける
layout: post
tags: macos dev swiftui
---

`Table`の基本的な使い方は「[SwiftUI Tableの使い方]({% post_url 2024-02-17-swiftui-table-usage %})」を参照。

macOSアプリにSwiftUIの`Table`を組み込み、副ボタンクリック（右クリック）によるコンテキストメニューをつけた時、テーブル行として表現されているオブジェクトに対して何らかの操作を行うような場合を考える。たとえばリスト表示にしたFinderで、ファイルやフォルダを右クリックしたときにでるコンテキストメニューをイメージしてもらうと良い。

このとき`TableColumn`配下の要素や`TableRow`に`.contextMenu(menuItems:)`モディファイアをつけてしまいがちだが、macOSアプリのテーブルに対するコンテキストメニューの自然な挙動を実現するには、`Table`自体に`.contextMenu(forSelectionType:menu:primaryAction:)`モディファイアをつけなければならない。

## リストの選択状態と操作対象

テーブル行をふつうにクリックした場合、行選択の状態となり、行全体にハイライトがつく。行を右クリックした場合、行の縁だけハイライトがつき、コンテキストメニューの起点、操作対象の状態になる。このふたつは別の状態である。選択範囲とコンテキストメニューの操作対象は重なる場合もあれば、異なる場合もある。

コンテキストメニューの操作対象は以下のようになる：

- 行を選択していない状態から右クリックした場合、操作対象は右クリックした行になる。
  ![](/blog/img/20240220/right-click-no-selection.png)
- 行を選択している状態から選択**内**の行を右クリックした場合、操作対象は選択範囲の行になる。
  ![](/blog/img/20240220/right-click-inside-selection.png)
- 行を選択している状態から選択**外**の行を右クリックした場合、操作対象は右クリックした行**のみ**になる。
  ![](/blog/img/20240220/right-click-outside-selection.png)
- 表内部の行がない余白部分を右クリックした場合、操作対象のオブジェクトはない（親オブジェクトや対象を必要としない処理になる）。
  ![](/blog/img/20240220/right-click-in-blank-space.png)

上図のコンテキストメニューの内容から操作対象が変わっていることが解る。

## 実装

行の通常の選択範囲は`@State`なプロパティを使うことで取得できる。ではコンテキストメニューの操作対象はどうか。

`TableColumn`配下の要素や`TableRow`に`.contextMenu(menuItems:)`モディファイアをつけた場合、どの行が右クリックされたのか、コンテキストメニューの操作対象が解らない。

`Table`自体に`.contextMenu(forSelectionType:menu:primaryAction:)`モディファイアをつけることで、どの行が右クリックされたのかを取得できる。また、`Table`自体に`.contextMenu(menuItems:)`をつけることで、余白部分を右クリックした場合をカバーできる。

```swift
import SwiftUI
import UniformTypeIdentifiers

struct Bookmark: Identifiable {

  var id = UUID()
  var title: String
  var url: URL
}

struct ContentView: View {

  @State private var sampleData: [Bookmark] = [
    .init(title: "Genji App", url: URL(string: "https://genjiapp.com")!),
    .init(title: "Apple", url: URL(string: "https://www.apple.com")!),
    .init(title: "Google", url: URL(string: "https://www.google.com")!)
  ]
  @State private var selectedIDs = Set<Bookmark.ID>()

  var body: some View {
    Table(of: Bookmark.self, selection: $selectedIDs) {
      TableColumn("Title") { bookmark in
        Text(bookmark.title)
//          .contextMenu {
//            Button("ここじゃない") { /* ... */ }
//          }
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    } rows: {
      ForEach(sampleData) { bookmark in
        TableRow(bookmark)
//          .contextMenu {
//            Button("ここでもない") { /* ... */ }
//          }
      }
    }
    .tableStyle(.bordered)
    // ここ！
    .contextMenu(forSelectionType: Bookmark.ID.self) { clickedRowIDs in
      addButton
      Button("Delete Bookmark") {
        sampleData.removeAll { clickedRowIDs.contains($0.id) }
      }
    }
    // ここはテーブル内余白を右クリックしたとき
    .contextMenu {
      addButton
    }
    .padding()
  }

  var addButton: some View {
    Button("Add Bookmark") {
      sampleData.append(.init(title: "Microsoft", url: URL(string: "https://www.microsoft.com")!))
    }
  }

}
```

`.contextMenu(forSelectionType:menu:primaryAction:)`の第1引数`forSelectionType`には、テーブル行を表現するオブジェクトを特定するための型を指定する。オブジェクトは`Identifiable`プロトコルに適合させているはずなので、`id`プロパティの型となる。

ちなみに第3引数`primaryAction`は、行をダブルクリックした時に実行される。