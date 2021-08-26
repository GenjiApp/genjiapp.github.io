---
title: 環境設定をクリアする
layout: post
tags: [dev, macos, cocoa]
---
　Cocoaアプリケーションで環境設定を保存するには`NSUserDefaults`を使うのが定石。保存した設定はプロパティリストファイルに保存される。

　アプリケーションの開発中には保存する設定の形式をころころ変えたりするし、初期状態に戻して動作を確認したいこともよくある。以前であればプロパティリストファイルを直接開いて保存された値を編集したり削除したりしていたが、OS X 10.9 Mavericksよりプロパティリストファイルに保存されている環境設定値がキャッシュされるようになったらしく、直接編集した結果が実際には反映されなくなった。

　そこで開発中のアプリケーション自身で、キャッシュシステムに左右されることなく、環境設定値をクリアする方法を考える。

## 環境設定をクリアするUIを作る

　特定のキィを持つ環境設定値を削除するのであれば、

```
[[NSUserDefaults standardUserDefaults] removeObjectForKey:@"aKey"];
```

を用いるが、使用したキィの分だけ上記メソッドを繰り返すのは面倒だし、削除し忘れ等が発生する恐れがある。そのアプリケーションで使用している環境設定値すべてを削除するには`removePersistentDomainForName:`を用いる。引数にはアプリケーションのバンドルIDを`NSString`で渡す。

```
- (IBAction)restoreDefaults:(id)sender
{
  NSString *bundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
  [[NSUserDefaults standardUserDefaults] removePersistentDomainForName:bundleIdentifier];
}
```

のようにすれば、環境設定をクリアするアクションメソッドが作成できる。さらに以下のようなメソッドを作成し、上記アクションメソッドを実行するメニュー項目をメインメニュー内のアプリケーションメニューに挿入しておく。

```
- (void)addRestoreDefaultsMenuItemToApplicationMenu
{
  NSMenuItem *menuItem = [[NSMenuItem alloc] initWithTitle:@"Restore Defaults" action:@selector(restoreDefaults:) keyEquivalent:@""];
  NSMenu *appMenu = [[[NSApp mainMenu] itemAtIndex:0] submenu];
  [appMenu addItem:[NSMenuItem separatorItem]];
  [appMenu addItem:menuItem];
}
```

　この`addRestoreDefaultsMenuItemToApplicationMenu`メソッドを`applicationDidFinishLaunching:`等の中で呼び出す。

```
#ifdef DEBUG
  [self addRestoreDefaultsMenuItemToApplicationMenu];
#endif
```

　上記のようにしておけばデバッグビルド時だけ環境設定をクリアするメニュー項目が使えるようになる。デバッグ中だけに使いたければこれで良いし、ユーザがふつうに使えるように適当な場所にメニュー項目やボタン等を配置しても良いだろう。

## 起動時に環境設定をクリアする

　将来、環境設定値の仕様変更をミスって通常起動すらしない、というようなことがあるかもしれない。手元であれば適当に対処するが、アプリケーションのユーザからそのような報告があった場合を考える。以前であれば「プロパティリストファイルを削除してみて」と言えたが、前述の通りキャッシュが効いてファイル削除も無効になってしまう。環境設定のキャッシュを制御するプロセス（`cfprefsd`）を再起動させればいいのだが、ユーザに課す手数が増え複雑化してしまう（プロパティリストファイルを探して、削除して、プロセスを再起動）。

　そこで、起動時に環境設定値をクリアできるようにする。

```
- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  NSUInteger modFlags = [NSEvent modifierFlags];
  NSUInteger requiredFlags = NSAlternateKeyMask | NSShiftKeyMask | NSControlKeyMask;
  if((modFlags & requiredFlags) == requiredFlags) {
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setInformativeText:NSLocalizedString(@"Would you like to restore default preferences?", nil)];
    [alert addButtonWithTitle:NSLocalizedString(@"OK", nil)];
    [alert addButtonWithTitle:NSLocalizedString(@"Cancel", nil)];
    if([alert runModal] == NSAlertFirstButtonReturn) {
      NSString *bundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
      [[NSUserDefaults standardUserDefaults] removePersistentDomainForName:bundleIdentifier];
    }
  }
}
```

　上記のような処理を、アプリケーションが環境設定値を読み込む前のどこかの段階に仕込む（上記では`applicationDidFinishLaunching:`、場合によってはそれより以前の段階に仕込む）。上記の場合、この処理を通る段階で`Option`、`Shift`、`Control`キィが押されていた場合、アラートダイアログを表示し、そのOKボタンが押されたときに環境設定値クリアの処理が走るようになる。トラブル時、ユーザには「アプリケーション起動後すみやかに`Option`、`Shift`、`Control`を押しっぱにして」と言えば環境設定をクリアできるようになる。
