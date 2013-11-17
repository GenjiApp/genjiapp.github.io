---
layout: post
title: JekyllのPagination設定
---
　[JekyllのPagination](http://jekyllrb.com/docs/pagination/)とは、一ページ中にブログ記事がいくつか羅列してあり、一番下まで行くと「前の記事へ」「次の記事へ」などと前後の記事羅列ページへのリンクが貼ってあり、当該前後ページでまた記事が羅列されているという、よくあるアレである。

## `_config.yml`の設定

　Paginationを設定するにはまず`_config.yml`に、

```
paginate: 5
paginate_path: "blog/page:num"
```

のように記述する。上記の場合、一ページ中に羅列される記事数は5件。`paginate_path: "blog/page:num"`で指定した`blog`ディレクトリィの中にある`index.html`ファイルが最初のページとなる。`blog/index.html`内では変数`paginator`を使い、記事羅列ページを作成する（したがって、`blog/index.html`はJekyll（Liquid）の変換対象ファイルでなければならないので、YAML Front-matterが必要となる）。
　以降のページは、その`blog/index.html`がテンプレート的な扱いとなり、`blog/page2/index.html`、`blog/page3/index.html`、...と作られる（`page1`は作られないことに注意）。

## 記事の出力

　`paginator`には、そのページ内で羅列される記事件数分（この場合は5件）の記事情報が`posts`属性を持っている。`blog/index.html`内で以下のように記述すれば、5件分の記事が出力される。

{% raw %}
```
{% for post in paginator.posts %}
  <article>
    <p class="date">{{ post.date | date: "%Y年%m月%d日" }}</p>
    <h1><a href="{{ post.url }}">{{ post.title }}</a></h1>
    {{ post.content }}
  </article>
{% endfor %}
```
{% endraw %}

　上記は各記事の全文を出力している。全文が必要ない場合は`post.content`の代わりに`post.excerpt`を使う。

　`blog/page2/index.html`以降では`blog/index.html`がテンプレート的に使われて同じ形態のファイルが出力される。`paginator.posts`はそのページが出力するべき記事情報が入っている。全記事数が12件で`paginate: 5`指定の場合、最初のページ（`blog/index.html`）では最新5件分、2ページ目（`blog/page2/index.html`）で次の5件分、3ページ目（`blog/page3/index.html`）で最後の2件分が`paginator.posts`に入っている。`paginator`が持つその他の属性も出力するページにあわせて変化する。

## 前後ページへのリンク出力

　前後ページへのリンクには`paginator.previous_page`、`paginator.next_page`を使う。これらには前後のページ番号（なければ`nil`）が入っている。以下のように`blog/index.html`に書いた場合、前後ページへのリンクのリストが出力される。

{% raw %}
```
<ul>
  {% if paginator.previous_page %}<li><a href="/blog/{% if paginator.previous_page != 1 %}page{{ paginator.previous_page }}/{% endif %}">前の記事</a></li>{% endif %}
  {% if paginator.next_page %}<li><a href="/blog/page{{ paginator.next_page }}/">次の記事</a></li>{% endif %}
</ul>
```
{% endraw %}

　ひとつ注意が必要なのは、2ページ目以降のパスは`blog/page2/index.html`、...であるが、最初のページのパスは`blog/index.html`であって、`blog/page1/index.html`ではないということである。したがって、`paginator.previous_page`が`1`のときとそれ以外で処理を分ける必要がある。
