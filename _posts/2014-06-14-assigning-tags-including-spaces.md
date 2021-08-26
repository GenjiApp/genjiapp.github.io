---
title: Jekyllでスペースを含むタグを付ける
layout: post
tags: jekyll dev
---
　Jekyllでは、YAML Front-matterで`tags`変数にタグを割り当てることで、ブログ記事にタグを付けることができる。たとえばこの記事のFront-matterは以下のようになっている。

```
---
title: Jekyllで空白を含むタグを付ける
layout: post
tags: jekyll development
---
```

　タグはスペース区切りで割り当てる。この場合は`jekyll`、`development`というふたつのタグが付けられることになる。

　タグ名にスペースが含まれない場合は上記の記法で良い。タグ名にスペースを入れたい場合は、YAMLのリスト形式を用いる。
　たとえば「[Mailto Interceptorをリリースしました]({% post_url 2014-06-06-releasing-mailto-interceptor %})」という記事には`mailto interceptor`や`os x`というスペース含みのタグが付けられている。この記事のFront-matterは以下のようになっている。

```
---
title: Mailto Interceptorをリリースしました
layout: post
tags: [os x, release, mailto interceptor]
---
```

　`[]`でくくった中に`,`区切りでタグ名を指定する。このようにすれば、空白含みのタグを付けられるようになる。
