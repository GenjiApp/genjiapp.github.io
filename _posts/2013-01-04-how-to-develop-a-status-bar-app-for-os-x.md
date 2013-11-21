---
layout: post
title: OS Xステータスバーアプリケーションの作り方
tags: cocoa
---
## ステータスバーアプリケーションについて

　ステータスバーとは、OS Xの画面上部に表示されるメニューバーの、右側に位置する部分である。メニューバーの右端には通知やSpotlightのアイコン、時計表示、システムによって制御される機能（音量やBluetooth等）のアイコン（メニューエクストラ）が並び、その次に様々なアプリケーションのアイコンが並んでいる。

![](/blog/img/20130104/01_status_bar_area.png)

　上記画像で言えば、Google NotifierやDropbox、Adium、ClamXavのアイコンがある赤く塗った領域がステータスバーである。アプリケーション自身が非アクティヴであるときやウィンドウ等を表示していないときも、状態を示したり何らかの機能を呼び出したりする場合にステータスバーにアイコン等の項目（ステータス項目）を配置することができる。

　ここで言う「ステータスバーアプリケーション」とはいわゆる「常駐アプリケーション」と呼ばれるものの一種である。アプリケーションを起動してもウィンドウやDockのアイコンが表示されず、代わりにステータスバーにテキストやアイコンを表示し、そこから呼び出されるメニューやウィンドウを用いる。基本的にはバックグラウンドで常に起動しておき、タイマや何らかのイヴェントをフックして動作するアプリケーションを想定する。
　ステータスバーアプリケーションの特徴は、

- 起動してもDockにアイコンが表示されない
- ステータスバーにテキストやアイコンを表示する
- ステータスバーの項目をクリックすることでメニューを表示する

　ここでは上記のような特徴を持つアプリケーションを作成する。今回作成したプロジェクトは[GenjiApp/StatusBarApp - GitHub](https://github.com/GenjiApp/StatusBarApp)で公開するので参照のこと。なおXcodeのヴァージョンは4.5.2を用いた。

## Xcodeプロジェクトの作成

　Xcodeを起動し、New Project...からOS X ApplicationのCocoa Applicationを選択する。ここではProject NameをStatusBarAppとし、Create Document-Based Applicationはオフに、Use Automatic Reference Countingをオンにしてプロジェクトを作成した。

![](/blog/img/20130104/02_create_new_project.png)

![](/blog/img/20130104/03_choose_template_for_project.png)

![](/blog/img/20130104/04_choose_options_for_project.png)

## 常駐アプリケーションとして設定する

　常駐アプリケーションとして設定するには以下の手順を行う。

1. Xcodeウィンドウ左のProject Navigatorからプロジェクトを選択し、Project Editorを表示させる
2. Project EditorのTARGETSからアプリケーションのターゲットを選択する
3. Project EditorのInfoペインを表示させる
4. Custom OS X Application Target PropertiesからApplication is agent (UIElement) Keyを追加し、TypeをBoolean、ValueをYESに設定する。

![](/blog/img/20130104/05_add_lsuielement_property.png)

　この設定により、アプリケーションは常駐アプリケーションとして起動され、Dockにアイコンが表示されなくなる。同時に、ふつうのアプリケーションであればアクティヴ時にメニューバーに各種メニュー項目が表示されるが、それも表示されなくなり、Command + Option + Escapeで呼び出される「アプリケーションの強制終了」ダイアログにもアプリケーションが表示されなくなる。したがって、後述するメニュー等でアプリケーションを終了する手段を提供しておかないと、アクティビティモニタを使用しないとアプリケーションを終了するできなくなってしまう。

## メニューの追加

　`MainMenu.xib`にステータスバー項目をクリックしたときに表示されるメニューを追加する。

### ウィンドウオブジェクトの削除

　`MainMenu.xib`を開く。XIBファイルにはウィンドウオブジェクトがトップレヴェルに存在しており、アプリケーション起動時にそのウィンドウが自動的に開かれてしまう。今回はウィンドウは必要ないのでこのオブジェクトは削除しておく。ウィンドウオブジェクトを削除したら`AppDelegate.h`を開き、

```
@property (assign) IBOutlet NSWindow *window;
```

の行を削除する。

　後々、環境設定ウィンドウ等を作成するのであれば、このウィンドウオブジェクトをとっておいて流用してもよい。その場合は起動時にウィンドウが開かないように、

1. ウィンドウオブジェクトを選択する
2. UtilitiesエリアのAttributes Inspectorペインを選択する
3. BehaviorのVisible At Launchチェックボックスをオフにする

としておく。

![](/blog/img/20130104/06_delete_or_hide_window.png)

### メニューの追加とアクション接続

　UtilitiesエリアのObject libraryペインからMenuを選択し、トップレヴェルに追加する。

![](/blog/img/20130104/07_add_menu.png)

　追加したメニューは三つのメニュー項目（Item1、Item2、Item3）を持っているので、そのうちのふたつを削除する。残ったひとつのタイトルをQuit StatusBarAppに変更する。Quit StatusBarAppメニュー項目からInterface Builder DockのApplicationまでControlキィを押しながらドラッグを行い、`terminate:`アクションと接続する。これでQuit StatusBarAppメニュー項目を選択したときにアプリケーションを終了できるようになる。

![](/blog/img/20130104/08_connect_terminate_action01.png)

![](/blog/img/20130104/09_connect_terminate_action02.png)

### メニューのアウトレット接続

　追加したメニューをコードから参照できるようアウトレット接続を行う。

　前準備として`AppDelegate`にクラスエクステンションを追加する。`AppDelegate.m`ファイルを開き、`@implementation AppDelegate`行の前に以下の記述を追加する。

```
@interface AppDelegate ()

@end
```

　次に、XIBファイルを開いた状態でAssistant editorを表示し、そこに`AppDelegate.m`を開く。Interface Builder Dockから追加したメニューオブジェクトを選択し（XIBにはじめからあるMain Menuと間違えないように注意）、Controlキィを押しながら`AppDelegate.m`のクラスエクステンション内までドラッグする。そうするとダイアログがポップアップ表示されるので、

- NameでstatusMenuを入力する
- Storage でWeakを選択する

とし、Connectボタンをクリックする。

![](/blog/img/20130104/10_connect_outlet01.png)

![](/blog/img/20130104/11_connect_outlet02.png)

　アウトレット接続をヘッダファイルで行う場合は実装ファイルにクラスエクステンションを追加する必要はないが、ここではメニューを参照する変数は外部に公開する必要はないので、実装ファイルへ退避させた。

## ステータス項目を表示する

　`AppDelegate.m`を開く。まずステータス項目を保持するインスタンス変数を宣言する。

```
@implementation AppDelegate
{
  NSStatusItem *_statusItem;
}
```

　次に以下のようなメソッド`setupStatusItem`を定義する。

```
- (void)setupStatusItem
{
  NSStatusBar *systemStatusBar = [NSStatusBar systemStatusBar];
  _statusItem = [systemStatusBar statusItemWithLength:NSVariableStatusItemLength];
  [_statusItem setHighlightMode:YES];
  [_statusItem setTitle:@"StatusBarApp"];
  [_statusItem setImage:[NSImage imageNamed:@"StatusBarIconTemplate"]];
  [_statusItem setMenu:self.statusMenu];
}
```

　ここで行っていることを行ごとに説明すると、

1. `NSStatusBar`の`systemStatusBar`クラスメソッドでステータスバーを取得する。

2. `NSStatusBar`の`statusItemWithLength:`インスタンスメソッドでステータス項目を新しく生成し、`_statusItem`インスタンス変数に保持する。このメソッドの引数に`CGFloat`の数値を渡すと固定幅のステータス項目が生成されるが、たいていは項目の内容によって幅が可変になる`NSVariableStatusItemLength`定数を用いればよい。
   なお、このメソッドの返り値は`retain`されていないオブジェクトであり、オブジェクトが解放されると同時にステータスバーから項目も消えてしまう。したがって、ARC環境では強参照なインスタンス変数やプロパティで、非ARC環境では`retain`してからインスタンス変数に入れるか`retain`を指定したプロパティで保持しておく必要がある。

3. `setHighlightMode:`に`YES`を渡すことで、ステータス項目が選択されたときに、選択された状態が視覚化される（背景が青くなる）。通常は`YES`を渡しておく。

4. `setTitle:`でステータス項目にタイトル文字列を指定する。タイトルが必要なければ不要だが、後述のアイコン等の内容物がないとステータス項目が見えない。

5. `setImage:`でステータス項目にアイコン画像を指定する。画像ファイルはあらかじめプロジェクトに追加しておく。アイコンが必要なければ不要だが、前述のタイトル等の内容物がないとステータス項目が見えない。
   なお、上記のコードで画像のファイル名が`Template`で終わった形式になっているのは、その形式の画像ファイルから`NSImage`を生成すると自動的にテンプレート画像として扱ってくれるからである。テンプレートとして指定された画像をボタンやセグメンテッドコントールに指定すると、それらを選択したとき等にシステムが自動でイイ感じに画像を扱ってくれる（色の反転や非アクティヴ時のグレーアウト等。ただしテンプレート画像は黒と透明のみ）。今回のステータス項目のアイコン画像もテンプレート画像を指定しておくことで選択時にアイコンの色を反転してくれる。
   ファイル名が`Template`で終わっていない画像でも、`NSImage`の`setTemplate:`メソッドを使うことでテンプレート画像として扱うことができる。

6. `setMenu:`で前項でアウトレット接続したメニューを指定する。これでステータス項目を選択したときにメニューが表示されるようになる。

　最後に`applicationDidFinishLaunching:`内でいま実装した`setupStatusItem`メソッドを呼び出す。

```
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
  [self setupStatusItem];
}
```

　`applicationDidFinishLaunching:`はアプリケーションの起動が終了した時点で呼ばれるので、そのタイミングでステータスバーにステータス項目が表示されるようになる。

## ビルドして実行

　プロジェクトをビルド、アプリケーションを実行すると、ステータスバーにアイコンとタイトルテキストが配置され、それを選択するとメニューが表示されることを確認する。ウィンドウやDockアイコンは表示されないこと、ステータス項目が選択されたときにタイトルやアイコンの色が反転されること、Quit StatusBarAppメニュー項目を選択するとアプリケーションが終了することも確認する。

![](/blog/img/20130104/12_run_app.png)

　以上により、ステータスバーアプリケーションの基本的な実装が完了した。実際に何かの仕事をさせる場合は、タイマ等を使って定期的に処理をしたり、何らかのイヴェントをフックしたりする必要がある。
