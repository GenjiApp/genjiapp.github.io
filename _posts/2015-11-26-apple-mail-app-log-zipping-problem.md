---
title: OS X用Apple Mailアプリがメモリィを食い尽くす問題について
layout: post
tags: [macos, mail]
---
　先日から、OS X用のApple Mailアプリケーションがメモリィを食い尽くし始めてMacの動作がめちゃ重くなるという現象に見舞われだした。原因を探った結果、以下のApple Support Communitiesの投稿を発見した。

- [Mail on El Capitan](https://discussions.apple.com/message/29062685#29062685)

　どうやらMailアプリケーションが溜まったログファイルを自動的にZip圧縮する際に問題が発生しているようである。

　自分の環境を確認してみると、`~/Library/Containers/com.apple.mail/Data/Library/Logs/Mail`に1ファイルで6GBを超えるログファイルが存在していた。何らかの原因によりログが爆発的に出力され、大容量になったそれをZip圧縮しようとしてメモリィを食い尽くしていたものと思われる。ログは1日ごとに圧縮されるはずだが、大容量ログの日付以降にZipファイルが作成されていなかったのが、その傍証である。

　大容量ログを手動で圧縮し、オリジナルは削除した。大容量ログの日付以降のログも圧縮されだし、Mailアプリケーションがメモリィを食い尽くす問題は解消されたように思う（未だ経過観察中ではあるが）