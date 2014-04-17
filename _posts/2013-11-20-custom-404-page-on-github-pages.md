---
layout: post
title: GitHub Pagesでカスタム404ページを配置する
tags: github development
---
　このウェブサイトは現在[GitHub Pages](http://pages.github.com)でホストされている。

　なにも設定していない場合、404ページ——すなわち存在しないURLをリクエストされたときに表示するページは、GitHub Pagesのディフォルト404ページになる。ディフォルト404ページは、このウェブサイト自体とは直接関連のない情報を表示するだけなので、そのままでは都合が悪い。最低限、このウェブサイトのトップページへ誘導するリンクくらいは置いておくべきだろう。

　GitHub Pagesではもちろん、自分で404ページを用意することができる。参照情報はGitHub Pagesのヘルプ「[Custom 404 Pages](https://help.github.com/articles/custom-404-pages)」にある。
　一言で言えば、ウェブサイトを管理するリポジトリィのルートに`404.html`というファイルを配置すれば良い。そうすれば、存在しないURLへのリクエストが発生したときにそのファイルが表示されるようになる。

　というわけで[`404.html`](/404.html)を配置した。
