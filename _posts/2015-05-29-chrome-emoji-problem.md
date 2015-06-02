---
title: Chromeで絵文字が表示されない問題
layout: post
tags: [development, css]
---

　Google Chromeには、スタイルで`font-weight:600`以上が指定されていると絵文字が表示されなくなる問題があるようだ（[Issue 465066](https://code.google.com/p/chromium/issues/detail?id=465066)）。

```
<p style="font-weight:400;">🙆OK</p>
<p style="font-weight:500;">🙆OK</p>
<p style="font-weight:600;">🙅NG</p>
```

<div style="border: 1px solid silver; background-color: #eee; padding: 10px; border-radius: 5px; margin: 10px 5px;">
<p style="font-weight:400; margin:0;">🙆OK</p>
<p style="font-weight:500; margin:0;">🙆OK</p>
<p style="font-weight:600; margin:0;">🙅NG</p>
</div>

　上記の場合、Chromeでは「NG」の絵文字は表示されない（Chrome 43.0.2357.81、45.0.2415.0 canaryで確認）。下駄や豆腐にもならず、絵文字分の空白と同等になる。

　`font-weight:normal`が`font-weight:400`、`font-weight:bold`が`font-weight:600`と等価のようである。
　したがって、素の`p`要素内等では絵文字は表示されるが、`strong`要素や`h1`等の見出し要素では、大抵ディフォルトスタイルで`font-weight:bold`相当になっていることが多いので、絵文字が表示されない。

　Safari 8.0.6 (10600.6.3)やFirefox 37.0.2では期待通りに動作する。Opera 25.0.1614.68はそもそも絵文字全般が豆腐になり表示できない。