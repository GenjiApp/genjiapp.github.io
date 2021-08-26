---
layout: post
title: Jekyllで簡易タグ一覧ページを作る（2013年12月8日追記）
tags: jekyll github dev
---
　ブログ記事にタグを設定し、[タグ一覧ページ](/blog/tags.html)を作った（2013年12月8日追記：「[Jekyll製ウェブサイトに簡易検索機能を実装する]({% post_url 2013-12-08-simple-search-feature-on-jekyll-generated-website %})」にて実装した検索機能に統合したためdeprecated）。

## Front-matterでタグを付ける

　Jekyllでブログ記事を書くときに、Front-matterにタグを埋め込むことができる。この記事の場合だと、Front-matterは以下のようになっている。

```
---
layout: post
title: Jekyllで簡易タグページを作る
tags: jekyll github
---
```

　`tags:`部分はスペース区切りかYAMLフォーマットのリスト形式で複数のタグを設定することができる。

## タグ一覧ページを作る

　タグを付けたら当然その一覧ページが欲しいが、Jekyllにはタグ一覧ページを出力する機能はついていない。プラグイン（Jekyllはプラグインで機能拡張ができる）でそういうのがあるのかもしれんけど、[GitHub Pages](http://pages.github.com)上でビルドする場合はプラグインは使えないので自分でなんとかするしかない。

　あまり複雑なことをやろうとすると深みにはまるので、シンプルにいく。
　まずはタグ一覧ページとして`/blog/tags.html`ファイルを作成する。この中にブログ記事中で設定されているタグと、そのタグが付けられた記事を羅列する。今回は以下のような記述を`/blog/tags.html`に追加した。

```
{% raw %}
{% for tag in site.tags %}
<article>
  <h1 id="tag_{{ tag[0] }}">{{ tag[0] }}</h1>
  <ul>
    {% for post in tag[1] %}
    <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
</article>
{% endfor %}
{% endraw %}
```

　`site.tags`には全タグの情報がハッシュとして入っている。キィはタグの文字列、値はそのタグが付けられた記事の配列になっている。

　Jekyll（Liquid）でハッシュを`{% raw %}{% for %}{% endraw %}`文に掛けると、一時変数には各要素のキィ・値ペアが配列として渡される（インデックス`0`にキィ、`1`にその値）。上記の場合、`{% raw %}{% for %}{% endraw %}`文の一時変数`tag`は配列になっており、`tag[0]`がタグ文字列、`tag[1]`がそのタグが付けられた記事情報の配列である。

　ここではタグ毎に記事へのリンク付きでタイトルをリスト表示している。これにてタグ一覧ページは完成。

## 各記事にタグ一覧ページへのリンクを付ける

　各ブログ記事にタグ一覧ページへのリンクを付ける。
　設定したタグの一覧を出力させるために、ブログ記事のテンプレートとしている`_layouts/post.html`に以下のような記述を追加した。

```
{% raw %}
<nav id="tags">
  <h2>tags:</h2>
  <ul>
    {% for tag in page.tags %}
    <li><a href="/blog/tags.html#tag_{{ tag }}">{{ tag }}</a></li>
    {% endfor %}
  </ul>
</nav>
{% endraw %}
```

　`page.tags`にその記事で設定したタグ文字列が配列で入っているので、これを使って`{% raw %}{% for %}{% endraw %}`文を回す（注：`site.tags`はハッシュ、`page.tags`は文字列の配列である）。

## 問題点

　今回のタグ一覧ページは簡易的なものである。ひとつのページに、すべてのタグとタグが付けられた記事を羅列しているだけで、「[JekyllのPagination設定]({% post_url 2013-11-17-jekyll-pagination %})」でやったようなページ分けもない。したがって、記事数が増えるごとにどんどん肥大化していくという問題がある。

　それほど頻繁にブログを更新するわけでもなし、増えてきたら増えてきたでまたそのとき考えるということで、今回はこれまで。
