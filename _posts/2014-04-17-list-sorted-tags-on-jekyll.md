---
title: Jekyllでタグをソートして一覧する
layout: post
tags: jekyll dev
---
　[Jekyll](http://jekyllrb.com)を用いたブログで、ブログ記事に付けたタグをソートして一覧することを考える。サイト内の全タグを一覧する場合と、とあるひとつの記事に付けられたタグを一覧する場合のふたつを考える。

## サイト内の全タグをソートして一覧する

　タグクラウド的にサイト内の全タグを一覧する場合を考える。[Alphabetizing Jekyll Page Tags In Pure Liquid (Without Plugins) – Michael Lanyon's Blog](http://blog.lanyonm.org/articles/2013/11/21/alphabetize-jekyll-page-tags-pure-liquid.html)を参考にした。

　Jekyll処理対象ファイル内で使えるグローバル変数`site`の`site.tags`に、サイト内の全タグ情報がハッシュとして入っている。タグ名がキィ、そのタグが付けられた記事のハッシュが配列として値になっている。たとえば`{% raw %}{{ site.tags['jekyll'][0].title }}{% endraw %}`とすれば、`jekyll`というタグが付けられた日付順で一件目の記事のタイトルが出力される。

　ハッシュそのままではキィをソートできない。配列であれば`{% raw %}{{ array | sort }}{% endraw %}`のように`sort`フィルタでソートすることが可能。そこで、`site.tags`ハッシュからキィを取り出し、それを配列に入れてソートすることを考える。ここでは`{% raw %}{% capture %}{% endraw %}`と`{% raw %}{% for %}{% endraw %}`を使う方法を紹介する。

　Jekyll（Liquid）の`{% raw %}{% capture %}{% endraw %}`タグを使うと、その中で出力される文字列を変数に詰め込むことができる。

```
{% raw %}
{% capture myString %}hoge foo bar{% endcapture %}
{% endraw %}
```

のようにすれば、`myString`には`hoge foo bar`という文字列が入る（実際の出力には`hoge foo bar`は反映されない）。

　一方、`{% raw %}{% for %}{% endraw %}`文の機能について、`{% raw %}{% for %}{% endraw %}`文をハッシュに対して使うと、以下のように各キィ・値ペアが配列になって`item`変数に入る（配列のインデックス`0`がキィ、`1`が値）。

```
{% raw %}
{% for item in hash %}
  key: {{ item[0] }}, value: {{ item[1] }}
{% endfor %}
{% endraw %}
```

　`{% raw %}{% capture %}{% endraw %}`の中で`{% raw %}{% for %}{% endraw %}`文をハッシュに対して用いてキィを取り出し、`,`区切りのひとつの文字列を作る。

```
{% raw %}
{% capture tagNamesString %}{% for tag in site.tags %}{{ tag[0] }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% endraw %}
```

　上記の例では、`tagNamesString`に`site.tags`ハッシュのキィ（タグ名）が`,`区切りのひとつの文字列として入る。ここで、上記の例を見た目上解りやすく改行、インデント等すると、それらも含めて`tagNamesString`に入ってしまうので、余計な改行、空白は入れないように注意する。

　次に`tagNamesString`を`split`フィルタで配列に変換、`sort`フィルタでソートして変数に割り当てる。変数割り当ては`{% raw %}{% assign %}{% endraw %}`タグを用いる。

```
{% raw %}
{% assign sortedTagNames = tagNamesString | split:',' | sort %}
{% endraw %}
```

　これで`sortedTagNames`はソートされたタグ名の配列になる。あとは`sortedTagNames`配列を`{% raw %}{% for %}{% endraw %}`文に掛けてやれば、サイト内で使われている全タグをソートして一覧できる。

```
{% raw %}
<ul>
  {% for tagName in sortedTagNames %}
  <li>{{ tagName }}</li>
  {% endfor %}
</ul>
{% endraw %}
```

　配列を`{% raw %}{% for %}{% endraw %}`文に掛けた場合は、各要素がそのまま一時変数に入る。上記では単にリストとして出力しているが、ハイパーリンクとして出力する際は別途タグ毎のページを作るなりしてそこへリンクを張る。当ブログでは[簡易的な検索機能を実装し]({% post_url 2013-12-08-simple-search-feature-on-jekyll-generated-website %})、そこでタグを付けられた記事を列挙するようにしている。

## ひとつのブログ記事に付けられたタグを一覧する

　とあるひとつのブログ記事を出力する際に、その記事に付けられているタグを一覧する場合を考える。

　記事内で使える`page`変数の`page.tags`に、その記事に付けられたタグの文字列が配列として入っている。`site.tags`ハッシュとは違い、`page.tags`は文字列の配列である。したがって、そのまま`sort`フィルタを用いることができる。

```
{% raw %}
{% assign sortedTagNames = page.tags | sort %}
<ul>
  {% for tagName in sortedTagNames %}
  <li>{{ tagName }}</li>
  {% endfor %}
</ul>
{% endraw %}
```

　`page.tags`にはYAML Front-matterで設定した順にタグ文字列が配列として入っている。`page.tags`を`sort`フィルタに掛けてアルファベット順にソートし、`{% raw %}{% assign %}{% endraw %}`で新しい変数に割り当てる。上記の例では`sortedTagNames`にソートされたタグ文字列の配列が入る。
　あとは`sortedTagNames`を`{% raw %}{% for %}{% endraw %}`文に掛けてタグ一覧を出力するだけ。ここでも前項と同様単なるリスト要素として出力している。ハイパーリンクとして出力する際には別途タグ毎のページを作るなりして、そこへリンクを張る。当ブログでは[簡易的な検索機能を実装し]({% post_url 2013-12-08-simple-search-feature-on-jekyll-generated-website %})、そこでタグを付けられた記事を列挙するようにしている。
