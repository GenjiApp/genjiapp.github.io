---
layout: post
title: "position: fixedは慎重に"
tags: css
---
　ブログに表示するSNS連携ウィジェット等に`position: fixed;`を指定して固定位置に配置しているものを最近よく見かける。

　しかしながら`position: fixed;`を使う場合は慎重になるべきである。
　マージンを取った余白に配置しているつもりかもしれないが、ウィンドウサイズによってはウィジェットが本文にカブってしまっていることがある。制作者が想定しているウィンドウサイズで皆が閲覧しているわけではないのだ。スクロールさせたりウィンドウ幅を広げたりして、なんとか読めるようになることもあるが、手間であるし非常に読みづらい。酷いときはブラウザをフルスクリーン表示させて横幅1280ピクセルとってもまだ本文にカブってしまうブログも複数見かけた。

　以下をクリックしてウザさを体験。

<ul id="positionFixedDemo">
  <li><a href="#" class="_demo_horizontal">横型デモ</a></li>
  <li><a href="#" class="_demo_vertical">縦型デモ</a></li>
</ul>
<script src="/js/jquery.js"></script>
<script>
$('a', $('#positionFixedDemo')).click(function(ev) {
  ev.preventDefault();
  var type = $(this).attr('class');
  var demoBlock = $('#demoBlock');
  if(!demoBlock.length) demoBlock = $('<div/>');
  if(type == demoBlock.attr('class')) {
    demoBlock.remove();
    return;
  }
  var styles = {backgroundColor: 'red',
                height: (type == '_demo_horizontal') ? '80px' : '300px',
                width: (type == '_demo_horizontal') ? '300px' : '80px',
                opacity: '0.8',
                position: 'fixed',
                bottom: '10px',
                left: $(this).parents('article').offset().left + 'px',
                border: '1px solid black',
                borderRadius: '5px'};
  demoBlock.css(styles);
  demoBlock.attr('class', type);
  demoBlock.attr('id', 'demoBlock');
  demoBlock.click(function() { demoBlock.remove(); });
  $('body').append(demoBlock);
  return;
});
</script>

　また、始めは非表示、あるいは最小化されていたのに、本文末尾付近までスクロールするとにょきっと大きくなるウィジェットも見かける。たいていは本文を読みきる前ににょきにょきと現れて本文を隠す。隠さずとも急に現れることで視線を奪い、本文を見失わせる。

　ウィジェットだけではない。固定配置しているヘッダメニュー等も同様である。そう頻繁に用いるわけでもないメニューがウィンドウ内の場所を占有し、本文のスペースを奪う。

　本文が大事なのであって、ウィジェットやヘッダメニューは添え物にすぎない。あったら便利程度のものが主客転倒し本文を読みづらく、あるいはまったく読めなくする。本文にカブる危険を冒してまで固定位置に配置する価値のあるものかどうかを一度よく考えてみるべきだと思う。

　SNS連携ウィジェットなどはタイトル見出し付近、あるいは本文末尾に通常配置すれば十分に用を足す。ヘッダメニューは、本文が短ければわざわざ固定配置するまでもなく、ちょっとスクロールすれば一番上まで到達できるだろうし、本文が長い場合はメニューでスペースを占有させるより本文領域を広くとった方が読みやすくなると思う。
