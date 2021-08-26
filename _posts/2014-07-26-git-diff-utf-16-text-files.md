---
title: GitでUTF-16なテキストファイルのdiffを表示する
layout: post
tags: git dev
---
　UTF-16でエンコーディングされたテキストファイルを`git-diff`等で表示することを考える。

## `.gitattributes`をリポジトリィに追加する

　`.gitattributes`ファイルを用いることで、特定のファイルやディレクトリィ単位で個別のdiffツールやmergeツールを用いるといった設定を行うことができる。

　リポジトリィに以下のような内容の`.gitattributes`ファイルを追加する。

```
*.txt diff=utf16
```

　この場合、`.gitattributes`ファイルを配置したディレクトリィ以下の`.txt`拡張子を持つファイルのdiffに、`utf16`という名前のフィルタを用いる指定をしたことになる。指定したフィルタがどういう動作を行うのかは次項で設定する。

## フィルタの動作を設定する

　前項で指定した`utf16`フィルタが実行する内容を設定する。

```
$ git config diff.utf16.textconv 'iconv -f utf-16 -t utf-8'
```

　このようにすると`$GIT_DIR/config`ファイルに、

```
[diff "utf16"]
	textconv = iconv -f utf-16 -t utf-8
```

のような記述が足される（このファイルを直接編集しても良い）。

　これで、`utf16`フィルタを指定されたファイルのdiffを表示する際に、`iconv`でエンコーディングの変換処理が噛まされるようになり（`iconv`は文字エンコーディング変換プログラムで、OS Xに始めから入っている。`-f`オプションで入力エンコーディング、`-t`で出力エンコーディングを指定）、diffが見られるようになる。


## 参考

- [Gitのカスタマイズ - Gitの属性](http://git-scm.com/book/ja/Git-のカスタマイズ-Git-の属性)
- [Git - gitattributes Documentation](http://git-scm.com/docs/gitattributes)
- [Git Diff Your .strings Files](http://cocoa.tumblr.com/post/64423918202/git-diff-your-strings-files)
