---
title: SwiftUI macOSアプリでメニューバーエクストラを出す
layout: post
tags: dev macos swiftui
---

macOSのメニューバーエクストラは、画面最上部のメニューバー右側に配置されるアイコンであり、それをクリックする事でメニューあるいはポップオーバーを表示し、アプリ等が最前面になくとも機能を呼び出せるUIである。常駐アプリ等で設定変更や状態確認のために使われることが多い。

SwiftUI macOSアプリでメニューバーアイコンを出すには`MenuBarExtra`を使う。

## 文字列表示

メニューバーエクストラに文字列として項目を表示したい場合は、

```swift
@main
struct MenuBarExtraSampleApp: App {
  var body: some Scene {
    MenuBarExtra("MenuBarExtra") {
      Button("About App") {
        NSApp.orderFrontStandardAboutPanel(nil)
        NSApp.activate(ignoringOtherApps: true)
      }
      Button("Settings...") {
        NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
        NSApp.activate(ignoringOtherApps: true)
      }
      Divider()
      Button("Quit App") {
        NSApp.terminate(nil)
      }
    }
  }
}
```

のようにする。この例ではメニュー形式のメニューバーエクストラが作られる。

![](/blog/img/20221103/menu-bar-extra-text.png)

## アイコン表示

アイコンを表示する場合は、

```swift
MenuBarExtra("MenuBarExtra", image: "icon") {
  ...
}
```

や、

```swift
MenuBarExtra("MenuBarExtra", systemImage: "star.fill") {
  ...
}
```

とする。このとき、第一引数の文字列は表示されなくなる。

![](/blog/img/20221103/menu-bar-extra-icon.png)

## アイコンと文字列表示

アイコンも文字列も両方出したい場合は、

```swift
MenuBarExtra {
  ...
} label: {
  Label("MenuBarExtra", systemImage: "star.fill")
    .labelStyle(.titleAndIcon)
}
```

とする。ここで単に`Label`だけだとやはり文字列が表示されない。`.labelStyle(.titleAndIcon)`を指定することでアイコンと文字列両方が表示される。

![](/blog/img/20221103/menu-bar-extra-icon-text.png)

## ポップオーバー表示

通常はメニュー形式で表示されるメニューバーエクストラだが、ポップオーバー形式にすることもできる。その場合は、

```swift
MenuBarExtra("MenuBarExtra") {
  HStack {
    Image(systemName: "heart.fill")
    Button("MenuBarExtra") {}
    Image(systemName: "heart.fill")
  }
  .frame(width: 300, height: 200)
}
.menuBarExtraStyle(.window)
```

のように`menuBarExtraStyle`を使う。

![](/blog/img/20221103/menu-bar-extra-popover.png)

## メニューバーエクストラの表示・非表示切り替え

メニューバーエクストラの表示・非表示の切り替えをしたい場合は`isInserted`が入っているイニシャライザを使う。

```swift
@main
struct StatusBarSampleApp: App {

  @AppStorage("MenuBarExtraShown") private var menuBarExtraShown = true

  var body: some Scene {
    MenuBarExtra("MenuBarExtra", systemImage: "star.fill", isInserted: $menuBarExtraShown) {
      MenuBarExtraContents()
    }
  }
}
```

この場合、どこかのビューで、

```swift
struct GeneralSettingsView: View {

  @AppStorage("MenuBarExtraShown") private var menuBarExtraShown: Bool = true

  var body: some View {
    Form {
      Toggle("Menu Bar Extra", isOn: $menuBarExtraShown)
    }
    .padding()
  }
}
```

のように切り替えをするUIを用意する。

## 常駐アプリ化

メインウィンドウを持たずにメニューバーエクストラを操作の起点とするような常駐アプリにしたい場合は、ターゲットの「Info」欄で「Application is agent (UIElement)」を「YES」にする。こうすることで、アプリがDockやAppスイッチャーに表示されなくなる。

![](/blog/img/20221103/LSUIElement.png)