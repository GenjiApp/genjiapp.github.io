---
title: SwiftUIのmacOSアプリでTableにコンテキストメニューをつける
layout: post
tags: macos dev swiftui
---

`Table`の基本的な使い方は「[SwiftUI Tableの使い方]({% post_url 2024-02-17-swiftui-table-usage %})」を参照。

macOSアプリにSwiftUIの`Table`を組み込み、副ボタンクリック（右クリック）によるコンテキストメニューをつけた時、テーブル行として表現されているオブジェクトに対して何らかの操作を行うような場合を考える。たとえばリスト表示にしたFinderで、ファイルやフォルダを右クリックしたときにでるコンテキストメニューをイメージしてもらうと良い。

このとき`TableColumn`配下の要素や`TableRow`に`.contextMenu(menuItems:)`モディファイアをつけてしまいがちだが、macOSアプリのテーブルに対するコンテキストメニューの自然な挙動を実現するには、`Table`自体に`.contextMenu(forSelectionType:menu:primaryAction:)`モディファイアをつけなければならない。

## テーブルの選択状態と操作対象

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

以下のような実装が良いと思う。

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
          .contextMenu {
//            Button("ここじゃない") {
//              print(bookmark)
//              print(selectedIDs)
//            }
//          }
      }
      TableColumn("URL") { bookmark in
        Text(bookmark.url.absoluteString)
      }
    } rows: {
      ForEach(sampleData) { bookmark in
        TableRow(bookmark)
//          .contextMenu {
//            Button("ここでもない") {
//              print(bookmark)
//              print(selectedIDs)
//            }
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

`TableColumn`配下の要素に`.contextMenu(menuItems:)`モディファイアをつける場合、複数の列があるときはすべてにモディファイアをつけなければならないし、右クリックに反応するのは行の中の文字がある部分だけになる。

`TableRow`に`.contextMenu(menuItems:)`モディファイアをつける場合、選択行とコンテキストメニューの操作対象両方を取得できるが、両者が別の型になるし、両者の重なり具合を調べて操作対象を自分で計算する必要がある。

`Table`自体に`.contextMenu(forSelectionType:menu:primaryAction:)`モディファイアをつける場合、第2引数`menu`クロージャの引数として、標準的な操作対象となるオブジェクトの`id`が`Set`で取得できるので、その後の処理がストレートに記述できる。

第1引数`forSelectionType`には、テーブル行を表現するオブジェクトを特定するための型を指定する。オブジェクトは`Identifiable`プロトコルに適合させているはずなので、`id`プロパティの型となる。第3引数`primaryAction`は、行をダブルクリックした時に実行される。

また、ドキュメントには`.contextMenu(forSelectionType:menu:primaryAction:)`の第2引数`menu`クロージャの引数が空の`Set`の場合はテーブルの余白部分を右クリックしたことになるとあるが、macOS 14.3.1とXcode Version 15.2 (15C500b)の環境ではコンテキストメニューが出ない。上のコード例では`Table`自体に`.contextMenu(menuItems:)`をつけることで、余白部分を右クリックした場合をカバーしている。
