---
title: iBook G4でLubuntu 14.04をUSBメモリィから起動、インストールする
layout: post
tags: misc
---

　PowerPC G4を搭載したiBook G4で、Lubuntu（Ubuntu Linuxの軽量版的ディストリビューション）14.04をUSBメモリィからLiveで起動し、インストールを行う。インストールを試みるiBook G4は最終モデルの12インチで、スペックは以下の通り。

- 1.33GHz PowerPC G4
- 1GBメモリィ
- 60GB HDD

　Mac OS XとLubuntuを内蔵HDDひとつでデュアルブートにするならば、あらかじめパーティションを分割しておく必要がある。Mac OS X 10.5 Leopardならば「ディスクユーティリティ」を用いて現在のHDDの内容を保持したままパーティションのリサイズや分割ができるが、10.4 Tiger以前のディスクユーティリティでは内容全消去なので注意。

## ディスクイメージのダウンロード、USBメモリィへの書き込み

　[Lubuntu/GetLubuntu](https://help.ubuntu.com/community/Lubuntu/GetLubuntu#Mac_systems)からPowerPC版のディスクイメージをダウンロードする。

　次に、[How to install Ubuntu on MacBook using USB Stick](https://help.ubuntu.com/community/How%20to%20install%20Ubuntu%20on%20MacBook%20using%20USB%20Stick#Manual_Approach)を参考にディスクイメージをUSBメモリィに書き込む（このページではISO形式のディスクイメージをIMG形式に変換しているが、私はこのステップを飛ばした）。「[PowerPCPAQ - Ubuntu Wiki](https://wiki.ubuntu.com/PowerPCFAQ#How_do_I_boot_from_a_USB_drive.3F)」も参照。

　具体的にはUSBメモリィを接続してTerminal.appから

```
$ diskutil list
```

を実行し、USBメモリィの識別子を特定する。私の場合は`/dev/disk1`だった（以下USBメモリィの識別子が`/dev/disk1`を仮定）。次に、

```
$ diskutil unmountDisk /dev/disk1
```

でUSBメモリィをマウント解除する（USBメモリィ自体は差し込んだまま）。

```
$ sudo dd if=/path/to/lubuntu-14.04.1-desktop-powerpc.iso of=/dev/disk1 bs=1m
```

でディスクイメージをUSBメモリィに書き込む（`/path/to/lubuntu-14.04.1-desktop-powerpc.iso`はディスクイメージのパス）。パスワードを聞かれるので入力すると書き込みが始まる。数分間待つ。**それまでのUSBメモリィの中身は消去されるので注意のこと**。書き込みが終わればLubuntu起動・インストール用のUSBメモリィが完成。

## Open FirmwareからUSB起動

　PowerPC時代のMacは、通常はUSBからの起動ができないが、後述のおまじないを唱えることでUSBメモリィからの起動を行う。

　インストール先のiBook G4に前節で作成したLubuntu起動・インストール用USBメモリィを差し込む。電源ボタンを押してiBook G4を起動させた直後、**アップルマークが出る前にキィボードの`Command`+`Option`+`o`+`f`を押し続ける**。そうすると以下のような画面が出るのでキィを放す。

![](/blog/img/20141013/lubuntu01.jpg)

　これは昔のPCで言うところのいわゆるBIOS的なヤツである。Open Firmwareのプロンプトに以下のような「おまじない」を打ち込む。

![](/blog/img/20141013/lubuntu02.jpg)

```
boot ud:,\\:tbxi
```

　この「おまじない」は「[Ben Collings: Booting your iBook G4 from a USB stick](http://ben-collins.blogspot.jp/2010/08/booting-your-ibook-g4-from-usb-stick.html)」、「[PowerPCPAQ - Ubuntu Wiki](https://wiki.ubuntu.com/PowerPCFAQ#How_do_I_boot_from_a_USB_drive.3F)」を参考にした。

　**日本語キィボードのiBook G4でも、この時点では英語配列として認識されているので、記号類を入力するときに注意する**。`:`は`Shift`を押しながら「;」の刻印があるキィ、`\`は「]」の刻印があるキィで入力できる。

　しばらくすると以下のような黒い画面に移行する。

![](/blog/img/20141013/lubuntu03.jpg)

　この画面で何もせずに放っておくと勝手にLubuntuがLive起動するが、そのままでは画面表示が乱れてしまうので、以下のような「おまじない」を入力する。

![](/blog/img/20141013/lubuntu04.jpg)

```
live video=radeonfb:1024x768-32@60
```

　この「おまじない」は「[Lubuntu/Documentation/FAQ/PPC](https://help.ubuntu.com/community/Lubuntu/Documentation/FAQ/PPC#No_desktop_with_Radeon_video_chips_on_LiveCD)」を参考にした。これにより、以下のようにLubuntuが正常にLive起動する。

![](/blog/img/20141013/lubuntu05.png)

　次節でインストールを行うが、この時点でもFirefoxでウェブを閲覧したりといった「お試し」が可能である。ただし、**iBook G4のトラックパッドがまともに反応しないし、無線LANが使えないので、USBマウスと有線LANが必須である**（それぞれ修正方法があるかもしれないが……）。

## Lubuntu 14.04のインストール

　Live起動したLubuntuのデスクトップにある「Install Lubuntu 14.04」アイコンをダブルクリックすることでインストールウィザードが開始する。

![](/blog/img/20141013/lubuntu06.png)

　まずは使用する言語で「日本語」を選択し「続ける」をクリック。

![](/blog/img/20141013/lubuntu07.png)

「Lubuntuのインストール準備」では必要なディスク容量とネット接続の確認、インストールオプションの選択が行われる。ここでは両オプションを選択し「続ける」とした。

![](/blog/img/20141013/lubuntu08.png)

「インストールの種類」では、Mac OS Xとデュアルブートにする場合は一番上の「Lubuntuをこれらと併用可能な形でインストール」を、Mac OS X（やその他）を消去してLubuntu一本で行く場合は「ディスクを削除してLubuntuをインストール」を選択する。**デュアルブートにする場合はあらかじめHDDに空きパーティションを作成しておくこと**。さもなければ「Lubuntuをこれらと併用可能な形でインストール」がそもそも選択肢に出てこない（一番下の「それ以外」を選択することでパーティションの操作ができるかもしれないが、操作方法がよく解らず）。

　ここでは「Lubuntuをこれらと併用可能な形でインストール」を選択して「インストール」をクリック。

![](/blog/img/20141013/lubuntu09.png)

　タイムゾーンを選択して「続ける」。

![](/blog/img/20141013/lubuntu10.png)

　キィボード配列を選択して「続ける」。

![](/blog/img/20141013/lubuntu11.png)

　ユーザアカウントを設定するとインストールが始まり、以下のダイアログが出てインストールは完了。「今すぐ再起動する」をクリック。

![](/blog/img/20141013/lubuntu12.png)

　LubuntuをMac OS Xとデュアルブートできるようにインストールした以降は、iBook G4電源投入時に以下のような黒い画面が出るようになる。

![](/blog/img/20141013/lubuntu13.jpg)

　この画面で何もせずに放っておくか、あるいは表示されている説明通りに`l`キィを押すとLinux（Lubuntu）が起動する。`x`を押せばMac OS Xが起動するようになる。ディフォルトで起動するOSをMac OS Xに変更する場合は「[YabootConfigurationForMacintoshPowerPCsDualBoot - Community Help Wiki](https://help.ubuntu.com/community/YabootConfigurationForMacintoshPowerPCsDualBoot)」を参照。

## インストール後

　Lubuntuインストール後、一通りのソフトウェアアップデートを済ませて、再起動直後のターミナル一枚とタスクマネージャを起動した時点でメモリィ使用量は110MB。

![](/blog/img/20141013/lubuntu14.png)

　使用感等を適当に列挙すると、

- Live起動時と同様、トラックパッドはまともに反応しない
- Live起動時と同様、無線LANが使えない
- 音が出ない
- 全体的にちょっと動作がもっさり
  - ウィンドウをドラッグしての移動は輪をかけてモッタリしている
- Firefoxはver. 32.0.3
  - Twitterとかテキストベースのページなら（スクロールが遅いが）十分見られる
  - YouTubeは一応再生されるが駒落ち。上述の通り音も出ない

　上記のうち、トラックパッド、無線LAN、音に関してはおそらくすぐに改善できるだろうが、今回はここまで。

　動作が遅いのはMac OS Xでも同様（元が9年程度前のマシンなので）。もっと軽量なLinuxディストリビューションならば軽快な動作が可能かもしれないが、

- PowerPCをサポートしており（大前提）、
- 現在も開発が継続しており（古いままのOSならばMac OS Xで良いので）、
- かんたんにインストールできる（色々調べたりイジったりするのは大変）

ようなものを探すのが面倒なので、今回は有名なUbuntuの軽量版的ディストリビューションであるLubuntuを選択した。
