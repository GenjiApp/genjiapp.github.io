---
title: Security-scoped Bookmarkについて
layout: post
tags: macos dev cocoa
---
App Sandbox環境下のmacOSアプリにおいて、ローカルファイルへのアクセスには制限が課せられている。

コード内で適当に生成した`URL`ではローカルファイルへアクセスできない。ファイルへのアクセス権を得るには、

- `NSOpenPanel`
- `fileImporter()`モディファイア
- ドラッグ＆ドロップ

等の限られた方法を取る必要がある。

ただし`NSOpenPanel`等で取得した`URL`は、その起動中はURL先のファイルにアクセス可能だが、そのURLを保存しておいたとしても、次の起動時にはアクセスできなくなってしまう。URLへのアクセスを永続化するには、Security-scopedなURL Bookmarkを作らなければならない。

## URLからSecurity-scoped Bookmarkの生成

`URL`の`bookmarkData(options:includingResourceValuesForKeys:relativeTo:)`関数を使ってSecurity-scoped Bookmark（`Data`型）を作成する。`options`引数には`withSecurityScope `を指定。URLへのアクセスが読み込みのみで良い場合は、`securityScopeAllowOnlyReadAccess `も併用する。

```swift
let bookmarkData = try? url.bookmarkData(options: [.withSecurityScope, .securityScopeAllowOnlyReadAccess], includingResourceValuesForKeys: nil, relativeTo: nil)
```

## Security-scoped BookmarkからURLを生成し、アクセスする

`URL`の`init(resolvingBookmarkData:options:relativeTo:bookmarkDataIsStale:)`関数を使うことで、Security-scoped Bookmarkな`Data`から`URL`を生成できる。`resolvingBookmarkData`引数にはSecurity-scoped Bookmarkな`Data`を、`options`引数には`withSecurityScope`を指定する。

```swift
var isStale = false
let urlData = // 前項の手法で保存したURLのData
if let url = try? URL(resolvingBookmarkData: urlData, options: .withSecurityScope, relativeTo: nil, bookmarkDataIsStale: &isStale) {
  // isStale = true のときはBookmarkDataを作り直す必要がある
}
```

関数実行後に`isStale`が`true`になっている場合、Bookmark作成以降にURL先ファイルの名前が変更されたり、場所が変更されたことを意味する。その場合、生成されたURLは変更後のものになっており、それを用いて新しくSecurity-scoped Bookmarkを生成し直す。

生成されたURLに実際にアクセスするには、アクセス前に`startAccessingSecurityScopedResource()`を実行し、アクセス後には`stopAccessingSecurityScopedResource()`を実行する。

```swift
if url.startAccessingSecurityScopedResource() {
  // URL先への読み書き処理
  url.stopAccessingSecurityScopedResource()
}
```

`URL`の`init(resolvingBookmarkData:options:relativeTo:bookmarkDataIsStale:)`関数で`isStale`が`true`になってSecurity-scoped Bookmarkを再生成するときも、URL先へのアクセスに相当するので、`startAccessingSecurityScopedResource()`と`stopAccessingSecurityScopedResource()`が必要になる。
