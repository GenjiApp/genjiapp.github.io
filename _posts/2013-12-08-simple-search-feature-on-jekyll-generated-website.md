---
title: Jekyll製ウェブサイトに簡易検索機能を実装する
layout: post
tags: jekyll github javascript development
---
## はじめに

　[Jekyll](http://jekyllrb.com)は静的ウェブサイト生成システムであり、検索機能は付いていない。
　プラグインで検索機能を付けられるのかもしれないが、[GitHub Pages](http://pages.github.com)上でビルド・ホストをする場合は使えないので、ちゃんと探していない。
　かんたんにサイト内検索を実現するならGoogleのカスタム検索を使用する方法もあるが、Googleには頼りたくないので今回は自分で実装した。

　こんなの。

<form action="/search.html" method="get">
  <input type="search" name="q" placeholder="Search"/>
</form>

　キィワードを入力してエンターで検索実行。キィワードを`[]`（角括弧）でくくるとそれをブログ記事に付けられたタグとして認識する。たとえば`[jekyll] 検索`とすると、「jekyll」タグを付けられたもの、かつ本文に「検索」を含むブログ記事がヒットする。

## コンセプト

　基本コンセプトは「[simple jekyll searching - alex pearce](https://alexpearce.me/2012/04/simple-jekyll-searching/)」を参考にした。
　かいつまんで言えば、ブログ記事の情報（タイトル、URL、タグ、日付、本文）をJSONファイルに配列として詰め込み、JavaScriptで条件に合致する記事を取得するという方法をとった。

## JSONファイルの作成

　ブログ記事の情報を溜め込む`search.json`を作成する。ウェブサイトのビルド時に全ブログ記事の情報を自動で埋め込むために、Jekyllの処理対象として作成する。

{% raw %}
```
---
---
[
  {% for post in site.posts %}
  {
    "title": "{{ post.title | escape }}",
    "tags": [{% for tag in post.tags%}"{{ tag }}"{% if forloop.last %}{% else %}, {% endif %}{% endfor %}],
    "url": "{{ post.url }}",
    "date": {"year": "{{ post.date | date: "%Y" }}", "month": "{{ post.date | date: "%m" }}", "day": "{{ post.date | date: "%d" }}"},
    "content": "{{ post.content | strip_html | strip_newlines | escape }}"
  }{% if forloop.last %}{% else %},{% endif %}
  {% endfor %}
]
```
{% endraw %}

　Jekyllの処理対象とするためにファイル先頭にYAML Front-matterが必要。

　全体を配列として、その中にブログ記事の情報を詰め込む。

　ポイントは`content`の値に適用するフィルタ。
　`post.content`にはブログ記事の本文がHTMLタグ付きで入っているので、`strip_html`フィルタを適用してHTMLタグを取り除く。`strip_newline`で改行文字を除去して単一行にし、最後に`escape`でクォーテイション文字等をエスケープする。

　JSONファイルが作成できたら、一度Jekyllによる生成後のファイルを検査し（[JSONLint - The JSON Validator](http://jsonlint.com)）、Validなファイルができているかを確認した方が良い。


## 検索フォーム、検索結果ページの作成

　検索ページへ`GET`リクエストを送信するフォームを作成し、すべてのページで読み込まれるテンプレート内に配置する。

```
<form action="/search.html" method="get">
  <input type="search" name="q" placeholder="Search"/>
</form>
```

　検索結果ページ`search.html`を作成し、空の`div`要素をひとつ置いておく。

```
<div id="matchedList">
</div>
```


## JavaScriptによる検索

　`search.js`を作成し、前節の`search.html`に読み込ませる。

　`search.js`の要点を書くと、

1. `search.html`は`GET`リクエストが送信されているので、URL文字列からクエリィ文字列を取り出し、整形する。
2. `search.json`を読み込む。
3. `search.json`から読み込んだブログ記事情報の配列から検索条件に合致するものを抜き出し、`search.html`に配置している`div`に情報を整形して埋め込む。

　本文にキィワードが含まれているかどうかは`String.match()`の正規表現を用いた。たとえばキィワードが`jekyll 検索`であれば`(?=.*jekyll)(?=.*検索)`という正規表現を本文文字列に対して用いた。この場合は、本文文字列内に「jekyll」「検索」の両方（順不同）が含まれている場合にマッチする。


## まとめ

　実際のファイル構成はGitHubリポジトリィを参照。

- [search.json](https://github.com/GenjiApp/genjiapp.github.io/blob/master/search.json)
- [search_page.html](https://github.com/GenjiApp/genjiapp.github.io/blob/master/_layouts/search_page.html)
- [search.js](https://github.com/GenjiApp/genjiapp.github.io/blob/master/js/search.js)

　この方式の問題点はブログ記事数が増えるごとに生成されるJSONファイルが肥大化し、検索速度が低下することだが、それはそのときになって考えれば良いとして、今回はこれまで。
