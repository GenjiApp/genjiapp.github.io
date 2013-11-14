---
layout: post
title: OS Xアプリケーションにおける環境設定ウィンドウの作り方
---
　OS Xアプリケーションの振る舞い等を設定するときに用いる環境設定ウィンドウを作る。

## 環境設定ウィンドウについて

　環境設定ウィンドウの特徴は、

- Escapeキィ（もしくはCommand-.）で閉じられる
- アクティヴ時にはメインウィンドウになっている
- ツールバーを持ち、そのツールバー項目をクリックすることでヴューを切り替える
- ヴューを切り替える際にウィンドウのサイズがアニメーションを伴って変化する

　ここでは、上記のような特徴を持つ環境設定ウィンドウの、ウィンドウとしての振る舞いを実装する。実際にアプリケーションの設定をする方法は別論（`NSUserDefaults`等を用いる）。

　今回作成したプロジェクトは[GenjiApp/PrefWindowApp - GitHub](https://github.com/GenjiApp/PrefWindowApp)で公開するので参照のこと。

　なお、Xcodeはヴァージョン4.5.1を用いた。

## Xcodeプロジェクトの作成

　Xcodeを起動し、New Project...からOS X ApplicationのCocoa Applicationを選択する。ここではProject NameをPrefWindowAppとし、Create Document-Based Applicationはオフに、Use Automatic Reference Countingをオンにして、適当な場所にプロジェクトを作成した。

![](/blog/img/20121025/01_create_new_project.png)

![](/blog/img/20121025/02_choose_template_for_project.png)

![](/blog/img/20121025/03_choose_options_for_project.png)


## ウィンドウコントローラの追加

　プロジェクトに環境設定ウィンドウを管理するクラスを実装する新しいファイルを追加する。New File...からOS XのCocoaカテゴリィのObjective-C Classを選択肢、Classを`PreferencesWindowController`、Subclass ofを`NSWindowController`にして、With XIB for user interfaceチェックボックスをオンにしてファイルを作成する（`PreferencesWindowController.h/m/xib`のみっつのファイルが作成される）。

![](/blog/img/20121025/04_create_new_file.png)

![](/blog/img/20121025/05_choose_template_for_file.png)

![](/blog/img/20121025/06_choose_options_for_file.png)

　今回の環境設定ウィンドウはふたつのヴューを切り替えて操作するものとする。それぞれのヴューを判別するための定数を列挙型で適当な場所に宣言しておく。ここでは`PreferencesWindowController.m`ファイルに宣言した。

```
enum PreferencesViewType {
  kPreferencesViewTypeGeneral = 100,
  kPreferencesViewTypeAdvanced,
};
typedef NSInteger PreferencesViewType;
```

　ふたつのヴューが判別できれば値は何でも構わない。

## NSWindow のサブクラスを作成する

### 環境設定ウィンドウの振る舞い

　一般的な環境設定ウィンドウはEscape キィ（あるいはCommand-.）で閉じることができる。環境設定ウィンドウを単なる`NSWindow`で実装するとこの振る舞いを実現できない。その一方で`NSPanel`というクラスではEscapeキィでウィンドウを閉じることができる。しかし、単なる`NSPanel`ではメインウィンドウにはなれない。環境設定ウィンドウはアクティヴ時にはメインウィンドウになっていなければならない。さらにメニューバーのWindowメニューにはアプリケーションで開かれているウィンドウの一覧が表示され、環境設定ウィンドウも表示されるが、`NSPanel`はWindowメニューに表示されない。

### メインウィンドウとキィウィンドウ

　OS Xアプリケーションのウィンドウには、メインウィンドウとキィウィンドウ、および非アクティヴなウィンドウというみっつの状態が存在する。

　非アクティヴなウィンドウとはフォーカスが当たっていないウィンドウのことで、他のウィンドウの下にあったり、他のアプリケーションがアクティヴな状態のとき、つまりユーザの現在の操作対象にはなっていないウィンドウのことである。非アクティヴなウィンドウ自身や、そのUI部品は色がグレーアウトし、ウィンドウのドロップシャドウが小さくなる。

　キィウィンドウとはフォーカスが当たっており、ユーザの現在の操作対象になっているウィンドウのことである。

　メインウィンドウとはユーザの現在の操作対象になっているウィンドウのことである。メインウィンドウがキィウィンドウとなっていることが多いが、他のウィンドウ（パネル）がキィウィンドウになっていることもある。メインウィンドウとは別にキィウィンドウが存在する場合、メインウィンドウのタイトルバーの閉じるボタン等はグレーアウトするが、ウィンドウ自身やそのUI部品はグレーアウトせず、ウィンドウのドロップシャドウも大きいままである。

　マウスやキィボードの入力は始めにキィウィンドウに対して送られ、キィウィンドウがそれに応えられない場合はメインウィンドウに伝搬される。いま、メインウィンドウとキィウィンドウが別々にあったとする。キィウィンドウにはテキストフィールドが置いてあり、そこにフォーカスが当たっているとする。テキストエディタアプリケーションだったとして、メインウィンドウがエディタ本体のウィンドウで、キィウィンドウとして検索パネルのような物が表示されている状態である。ユーザの通常のキィ入力はキィウィンドウ（検索パネル）のテキストフィールドで処理される（テキストフィールドに文字が入力される）。Command-Vのようなキィボードショートカットもテキストフィールドで処理される（ペースト）。これらはキィウィンドウが応答できる処理だからである。キィウィンドウが応答できない処理の場合、たとえばCommand-Sの保存はメインウィンドウに伝搬され、エディタアプリケーションの保存ダイアログが開く。

　環境設定ウィンドウを開くと、それまでのメインウィンドウは非アクティヴになり、環境設定ウィンドウがメインウィンドウとなる。これは、それまでのメインウィンドウやそのUI部品がグレーアウトし、そこで処理可能であったメニューコマンドが使用不能に変わることから見て取れる。

### `NSWindow` のサブクラス化

　つまり、環境設定ウィンドウを実装するには、次のどちらかの手法をとる必要がある。

- `NSWindow`で実装してEscapeキィの動作を横取りしウィンドウを閉じられるようにする
- `NSPanel`で実装してメインウィンドウになれるように、ウィンドウメニューに表示されるようにする

　ここではかんたんな前者の手法をとることにする。

　`NSWindow`のサブクラスを作成するにあたり、新たにファイルを作成してもよいが、必要なコードは微少なので`PreferencesController`に同居させる。

　`PreferencesWindowController.h`を開き、`NSWindow`のサブクラスを作成する。名前は`PreferencesWindow`とした。

```
@interface PreferencesWindow : NSWindow

@end
```

　次に`PreferencesWindowController.m`を開き、`PreferencesWindow`を実装する。`NSWindow`をEscapeキィで閉じられるようにするには、`cancelOperation:`を実装してその中でウィンドウを閉じるようにすればよい。また、環境設定ウィンドウのツールバーを隠せてしまってはまずいので、ツールバーの表示、非表示をトグルするメニュー項目を無効化しておく。

```
@implementation PreferencesWindow

- (void)cancelOperation:(id)sender
{
  [self close];
}

- (BOOL)validateUserInterfaceItem:(id<NSValidatedUserInterfaceItem>)anItem
{
  SEL action = [anItem action];
  if(action == @selector(toggleToolbarShown:)) return NO;
  return [super validateUserInterfaceItem:anItem];
}

@end
```

　作成した`PreferencesWindow`は次項で用いる。

## 環境設定ウィンドウの XIB ファイルを編集する

### ウィンドウの設定を行う

　`PreferencesWindowController.xib`ファイルを開く。XIBファイルにはあらかじめウィンドウオブジェクトが用意されているので、そのウィンドウオブジェクトを選択し、UtilitiesエリアのIdentity InspectorペインのCustom Classで前項で作成した `PreferencesWindow`クラスを指定する。これでウィンドウはEscapeキィで閉じることができるようになる。

![](/blog/img/20121025/07_specify_custom_class_for_window.png)

　ウィンドウオブジェクトを選択したままでAttributes Inspectorペインにて各種設定を行う。

- ControlsでResize、Minimizeチェックボックスをオフにする
- AppearanceでShows Toolbar Buttonチェックボックスをオフにする
- BehaviorでVisible At Launchチェックボックスをオフにする

![](/blog/img/20121025/08_specify_attributes_for_window.png)

　次にウィンドウにツールバーを追加する。UtilitiesエリアのObject libraryペインからツールバーを選択し、ウィンドウにドラッグ・アンド・ドロップする。ウィンドウ上部にツールバーが追加されるので、そのツールバーをクリックして選択し、UtilitiesエリアのAttributes InspectorペインのCustomizableチェックボックスをオフにする。

![](/blog/img/20121025/09_add_toolbar_to_window.png)

　追加したツールバーを選択した状態でもう一度ツールバーをクリックすると、ツールバーに表示する項目を編集できるようになる。ディフォルトでいくつかの項目が用意されているが、これらをすべて削除し、Object libraryペインからImage Toolbar Itemをふたつドラッグ・アンド・ドロップして追加する。追加したImage Toolbar ItemのAttributes Inspectorペインで、

- Image Nameでそれぞれ`NSPreferencesGeneral`と`NSAdvanced`を指定する
- Label、Palette Labelでそれぞれ`General`と`Advanced`を入力する
- Tagでそれぞれ`100`、`101`を入力する
- Behavior でSelectableチェックボックスをオンにする

　追加した Image Toolbar ItemがAllowed Toolbar Itemsにあるので、設定が終わったら、それをDefault Toolbar Items欄にドラッグ・アンド・ドロップしておく。

　Image Name、Label、Palette Labelの値は任意であるがここでは上記のようにした。Tagの値は前項で宣言した列挙型定数に対応している。

![](/blog/img/20121025/10_add_image_toolbar_items_to_window_and_specify_attributes_for_them.png)

### ヴューを追加し、アウトレット接続を行う

　UtilitiesエリアのObject LibraryペインからCustom Viewをトップレヴェルにふたつ追加する（ウィンドウ内への追加ではない）。このヴューの上に環境設定ウィンドウのUI部品が乗ることになる。とりあえず、Labelでも追加して適当な文字列を入力しておく。ヴューのサイズは適当に違う大きさにしておくと、あとで実装するヴュー切り替えによるウィンドウのリサイズが解りやすくなる。

![](/blog/img/20121025/11_add_custom_views_to_top_level_of_xib.png)

　XIBファイルを開いた状態でAssistant editorを表示し、そこに`PreferencesWindowController.m`を開く。それぞれのヴューからControlキィを押しながらドラッグを行い、Assistant editorで開いた`PreferencesWindowController.m`のクラスエクステンション部分までドラッグする。そうするとダイアログがポップアップ表示されるので、

- Nameでそれぞれ`generalView`、`advancedView`を入力
- StorageでWeakを選択

とし、Connectボタンをクリックする。これでコードからそれぞれのヴューを参照できるようになる。

![](/blog/img/20121025/12_connect_outlets_for_custom_views.png)

![](/blog/img/20121025/13_specify_options_for_outlets.png)

### アクションを接続する

　続いて、ウィンドウのツールバーに追加したImage Toolbar ItemのひとつからControlキィを押しながらドラッグを行い、Assistant editorに開いた`PreferencesWindowController.m`のクラスエクステンション部分までドラッグする。そうするとダイアログがポップアップ表示されるので、

- ConnectionでActionを選択する
- Name で`switchView`を入力する

とし、Connectボタンをクリックする。これでImage Toolbar Itemをクリックしたときに呼ばれるアクションメソッドとの接続ができた。残ったもうひとつのImage Toolbar ItemからもControl-ドラッグを行い、いま作成した`switchView:`アクションメソッドの宣言文でドロップして接続を行い、同じメソッド呼び出しができるようにしておく。

![](/blog/img/20121025/14_connect_action_for_image_toolbar_item.png)

![](/blog/img/20121025/15_specify_options_for_action.png)

![](/blog/img/20121025/16_connect_action_to_existed_one.png)

## `PreferencesWindowController`の実装

### ヴュー切り替えアクションの実装

　`PreferencesWindowController.m`を開き、以下のような`switchView:`メソッドを実装する。前項でアクション接続した際にスケルトンが作成されているので、中身を埋めていく。

```
- (IBAction)switchView:(id)sender
{
  NSToolbarItem *item = (NSToolbarItem *)sender;
  PreferencesViewType viewType = [item tag];
  NSView *newView = nil;
  switch(viewType) {
    case kPreferencesViewTypeGeneral: newView = self.generalView; break;
    case kPreferencesViewTypeAdvanced: newView = self.advancedView; break;
    default: return;
  }

  NSWindow *window = [self window];
  NSView *contentView = [window contentView];
  NSArray *subviews = [contentView subviews];
  for(NSView *subview in subviews) [subview removeFromSuperview];

  [window setTitle:[item label]];

  NSRect windowFrame = [window frame];
  NSRect newWindowFrame = [window frameRectForContentRect:[newView frame]];
  newWindowFrame.origin.x = windowFrame.origin.x;
  newWindowFrame.origin.y = windowFrame.origin.y + windowFrame.size.height - newWindowFrame.size.height;
  [window setFrame:newWindowFrame display:YES animate:YES];

  [contentView addSubview:newView];
}
```

　ここで行っていることは、

1. `sender`の`tag`から切り替え先となる新しいヴューを判別する
2. ウィンドウの`contentView`がサブヴューを持っている場合はそれを取り除く
3. `sender`の`label`を用いてウィンドウのタイトルを設定する
4. ウィンドウと切り替え先ヴューの`frame`から、切り替え後のウィンドウの`frame`を計算する
5. 計算した新しいウィンドウの`frame`をアニメーション付きで適用する
6. ウィンドウの`contentView`に切り替え後のヴューを追加する

　この`switchView:`メソッドは環境設定ウィンドウのツールバー項目をクリックしたときに呼ばれる。つまり、引数の`sender`はそのクリックしたImage Toolbar Item（`NSToolbarItem`）への参照である。Image Toolbar Itemには前項でTag欄に値を設定している。この値はふたつあるヴューのどちらかに対応しているので、その値を取り出してどちらのImage Toolbar Itemがクリックされたか、言い換えればどちらのヴューへの切り替えなのかを判別する。それぞれのヴューはアウトレット接続されたプロパティとしてコードから参照できる。

　ウィンドウの新しい`frame`について、OS Xの座標系は左下原点なので、単に`contentView`のサイズを変更しただけではウィンドウの上端が動いてしまうことになる。したがって、ヴュー切り替え前のウィンドウの上端座標から切り替え後のウィンドウの高さを引くことで、新しいウィンドウの原点座標を得ることになる。

### 初期選択状態の設定

　次に`windowDidLoad`メソッドを以下のように書き換える。

```
- (void)windowDidLoad
{
  [super windowDidLoad];

  NSWindow *window = [self window];
  NSToolbar *toolbar = [window toolbar];
  NSArray *toolbarItems = [toolbar items];
  NSToolbarItem *leftmostToolbarItem = [toolbarItems objectAtIndex:0];
  [toolbar setSelectedItemIdentifier:[leftmostToolbarItem itemIdentifier]];
  [self switchView:leftmostToolbarItem];
  [window center];
}
```

　`windowDidLoad`メソッドで、ツールバー項目の初期選択状態や、最初に表示されるヴューの設定を行う。ここではツールバー項目の一番左のものが最初に選択された状態であるとし、それに対応するヴューが最初に表示されるようにした。適当な方法で選択状態を保存しておき、次回起動時にその状態を復元してもいいかもしれない。

### 半シングルトン化

　環境設定ウィンドウは通常そのアプリケーション全体を通してひとつしか存在しない。たとえばテキストエディタアプリケーションは複数のエディタウィンドウを開くことができるだろうが、環境設定ウィンドウをどこからいつ呼び出しても同じものが使い回されて表示される。

　これをかんたんに行うには、`MainMenu.xib`のトップレヴェルに`PreferencesWindowController`を追加し、アウトレット接続しておけばよい。そうするとアプリケーション起動と共に`PreferencesWindowController`がインスタンス化され、アウトレット接続された変数を用いる限りアプリケーション起動中はずっと同じインスタンスが使われる。

　しかし環境設定ウィンドウは使うときは使うが、使わないときはまったく使わない。使わないのにアプリケーション起動中ずっとメモリィを消費してしまうのは無駄なので、ここでは必要なときにコードからインスタンスを生成する手法をとる。また、同じインスタンスを使い回すために、シングルトンデザインパターンを用いる。

　シングルトンとは、かんたんに言えば、クラスが自身のインスタンスをただひとつのみ生成し、それを使い回す手法である。通常はインスタンスを生成、取得するクラスメソッドを用意する（Cocoa の場合このクラスメソッドには`shared`あるいは`default`等の接頭辞を付けるのが習わしであるようだ）。

　`PreferencesWindowController.h`を開き、インターフェイス部を以下のように編集する。インスタンスを生成、取得するクラスメソッドの名前は`sharedPreferencesWindowController`とした。

```
@interface PreferencesWindowController : NSWindowController

+ (PreferencesWindowController *)sharedPreferencesWindowController;

@end
```

　次に`PreferencesWindowController.h`を開き、メソッドを実装する。

```
+ (PreferencesWindowController *)sharedPreferencesWindowController
{
  static PreferencesWindowController *sharedController = nil;
  if(sharedController == nil) {
    sharedController = [[PreferencesWindowController alloc] init];
  }
  return sharedController;
}
```

　このクラスメソッドの初回呼び出し時にはstatic変数`sharedController`は`nil`であり、したがって`if`文に入ってインスタンスを生成し、それを返す。次回以降の呼び出しでは`sharedController`にはインスタンスが入っているので`if`文をスルーしてそのまま返すのみである。

　クラスメソッドから呼ばれる`init`メソッドもオーヴァライドする。

```
- (id)init
{
  self = [super initWithWindowNibName:@"PreferencesWindowController"];
  if(self) {
    // Initialize
  }
  return self;
}
```

　コードからインスタンスを生成し、同時にウィンドウのXIBファイルの読み込みも済ませるために、`init`内で`initWithWindowNibName:`メソッドを用いる。こうしておけば、インスタンス生成側は`alloc`、`init`とするだけでウィンドウコントローラのインスタンス生成と対応するXIBファイルの読み込みを行うことができるようになる。

　これにより、`sharedPreferencesWindowController`クラスメソッドを通してインスタンスを得る場合に限り、同じインスタンスが返されることになり、`PreferencesWindowController`のシングルトン化ができた。完璧にシングルトンとするにはメモリィ管理系のメソッドをオーヴァライドする必要があるが、自分がシングルトンデザインパターンを用いるクラスを実装して、自分がそのクラスを使用するということを前提において、ここでは省略する。

## 環境設定ウィンドウを表示するアクションメソッドを実装する

　前項で`PreferencesWindowController`の実装が終わったので、今度はそれを呼び出す側を実装する。環境設定ウィンドウはアプリケーション起動中はいつでも呼び出せる必要がある。`MainMenu.xib`はアプリケーション起動時に読み込まれ、そこに登録されたオブジェクトはアプリケーション起動中ずっとインスタンス化されたままなので、今回の用途に適合する。`MainMenu.xib`には初めから`AppDelegate`がトップレヴェルに登録されており、ここに環境設定ウィンドウを表示するアクションメソッドを実装するのがかんたんである。

　`MainMenu.xib`ファイルを開き、Assistant editorに`AppDelegate.h`を開く。`MainMenu.xib`のMain Menuを選択し、そこにあるアプリケーションメニュー（アプリケーションの名前が付いたメニュー項目）内のPreferences...メニュー項目を選択する。Preferences...メニュー項目からControl-ドラッグしてAssistant editorに開いた`AppDelegate.h`の`@interface`内にドロップしてアクションを接続する。表示されるポップアップではConnectionでActionを選択、Nameで`showPreferencesWindow`とする。

![](/blog/img/20121025/17_connect_action_for_preferences_menu_item.png)

![](/blog/img/20121025/18_specify_options_for_action.png)

　`AppDelegate.m`を開いて、`PreferencesWindowController`クラスを使えるようにするため、ファイル先頭に`#import`ディレクティヴを追加する。

```
#import "PreferencesWindowController.h"
```

　`showPreferencesWindow:`メソッドはアクション接続時にスケルトンが作成されているので、以下のように編集する。

```
- (IBAction)showPreferencesWindow:(id)sender
{
  PreferencesWindowController *sharedController = [PreferencesWindowController sharedPreferencesWindowController];
  [sharedController showWindow:sender];
}
```

　前項で作成した`PreferencesWindowController`の`sharedPreferencesWindowController`クラスメソッドを用いて、シングルトンインスタンスを取得し、`showWindow:`インスタンスメソッドで環境設定ウィンドウを表示する。

## ビルドして実行

　以上により、環境設定ウィンドウを持つアプリケーションが完成した。プロジェクトをビルド、アプリケーションを実行し、アプリケーションメニューからPreferences...を選択して、以下のことを確認する。

- 環境設定ウィンドウが表示されるか
- 環境設定ウィンドウがメインウィンドウになり、それまでのメインウィンドウが非アクティヴになるか
- 環境設定ウィンドウがEscape（もしくはCommand-.）で閉じられるか
- 環境設定ウィンドウがアクティヴのときにViewメニューのShow/Hide Toolbarメニュー項目が無効化されているか
- 環境設定ウィンドウのツールバー項目のクリックでヴューが切り替わるか
- ヴューの切り替わりと同時にウィンドウサイズがアニメーションを伴って変更されるか
