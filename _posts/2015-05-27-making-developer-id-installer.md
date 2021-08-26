---
title: Developer IDで署名したインストーラパッケージを作る
layout: post
tags: [development, macos]
---

　OS XアプリケーションをDeveloper IDで署名し、インストーラパッケージもDeveloper IDで署名する。Developer ID Application/Installer証明書は取得済みであると仮定する。

## アプリケーションをDeveloper ID Application証明書で署名、ビルド、エクスポートする

　XcodeにてTargetの「Signing」で「Developer ID」を選択する。アプリケーションを「Archive」してOrgnaizerウィンドウから「Export」する。エクスポートのダイアログでは「Export a Developer ID-signed Application」を選択する。

## アプリケーションの署名を検証する

　以下のコマンドを実行して正しく署名されているかを検証する。

```
$ spctl -a -vvvv MyApp.app
```

　出力で`accepted`、`source=Developer ID Application`と出ていればOK。以下のような感じ。

```
MyApp.app: accepted
source=Developer ID
origin=Developer ID Application: xxxxxxx (xxxxxx)
```

　`xxxxxx`の部分はDeveloper ID証明書の名前などが入る。

## インストーラパッケージを作成する

　以下のコマンドを実行してインストーラパッケージを作成する。

```
$ productbuild --component MyApp.app /path/to/install_dir MyInstaller.pkg
```

　`MyApp.app`はインストールするアプリケーションのパス、`/path/to/install_dir`はインストール先のパス（通常は`/Applications`を指定することが多いであろう）、`MyInstaller.pkg`がインストーラパッケージ出力先のパス。上記のコマンドは一番シンプルなインストーラパッケージの作成例である。もっと凝ったインストーラパッケージを作成する方法もある。

## インストーラパッケージをDeveloper ID Installerで署名する

　以下のコマンドを実行してインストーラパッケージをDeveloper ID Installer証明書で署名する。

```
$ productsign --sign "Developer ID Installer: xxxxx" MyInstaller.pkg Signed_MyInstaller.pkg
```

　`xxxxx`にはDeveloper ID Installer証明書の名前が入る。

## インストーラパッケージの署名を検証する

　以下のコマンドを実行して正しく署名されているか検証する。

```
$ spctl -a -vvvv -t install Signed_MyInstaller.pkg
```

　Developer ID Applicationの検証のときとは`-t install`の部分が違っていることに注意。`-t`オプションで検証対象のタイプを指定する（未指定のときは`-t execute`が指定されたのと同じ。`-t execute`がアプリケーションの検証）。

　出力に`accepted`、`Developer ID Installer`と出ていればOK。以下のような感じ。

```
Signed_MyInstaller.pkg: accepted
source=Developer ID
origin=Developer ID Installer: xxxxx
```
