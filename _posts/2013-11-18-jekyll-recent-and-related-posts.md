---
layout: post
title: Jekyllの最新記事と関連記事
tags: jekyll
---
　Jekyllの`site`変数は`posts`と`related_posts`メンバを持つ。`posts`は全ブログ記事が新しい順に入っており、`related_posts`は処理中のブログ記事に関連している記事が最大10件分入っている。

{% raw %}
```
<ul>
  {% for post in site.posts limit:5 %}
  <li><a href="{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>
```
{% endraw %}

のように書くと、最新のブログ記事へのリンクを5件、リストに出力する。ポイントは`for`文の`limit:5`。`site.posts`には全記事分の情報が入っているので、`limit:5`のようにすると5件に制限できる。

　`related_posts`も同じような使い方ができる。しかし、ディフォルトでは`related_posts`には単に最新記事が10件分入っているだけである。ビルド時に`--lsi`オプションを付けると精度が上がるらしいが、どういうアルゴリズムになっているのかはよく解らない。さらにこのウェブサイトはGitHub Pages上でのビルドとホストしているが、その場合は`--lsi`オプションは使えない（ローカルでビルドして、その生成物をアップロードする方法ならば可）。
　ディフォルトでも、せめて同じカテゴリィや同じタグを付けた記事が入っていれば使いようがあるのだが……。
