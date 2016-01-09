---
layout: post
title: "固定配置（position: fixed）を使う前によく考えよう"
tags: css
---
　ブログに表示するSNS連携ウィジェット等に`position: fixed;`を指定して固定位置に配置しているものを最近よく見かける。

　しかしながら`position: fixed;`を使う場合は慎重になるべきである。
　マージンを取った余白に配置しているつもりかもしれないが、ウィンドウサイズによってはウィジェットが本文にカブってしまっていることがよくある。制作者が想定しているウィンドウサイズで皆が閲覧しているわけではないのだ。スクロールさせたりウィンドウ幅を広げたりして、なんとか読めるようになることもあるが、手間であるし非常に読みづらい。酷いときはブラウザをフルスクリーン表示させて横幅1280ピクセルとってもまだ本文にカブってしまうブログも複数見かける。

<ul class="positionFixedDemo">
  <li><a href="#" class="demo_horizontal">横型デモ</a></li>
  <li><a href="#" class="demo_vertical">縦型デモ</a></li>
</ul>

　また、始めは非表示、あるいは最小化されていたのに、本文末尾付近までスクロールするとにょきっとアニメーション付きで大きくなるウィジェットも見かける。たいていは本文を読みきる前ににょきにょきと現れて本文を隠す。隠さずとも急に現れることで視線を奪い、本文を見失わせる。

<ul class="positionFixedDemo">
  <li><a href="#" class="demo_animate">アニメーション型デモ</a></li>
</ul>

　ウィジェットだけではない。固定配置しているヘッダメニューやフッタメニューも同様である。頻繁に用いるわけでもないメニューがウィンドウ内の場所を占有し、本文のスペースを奪う（ツール的なウェブアプリケーションの場合は可）。

<ul class="positionFixedDemo">
  <li><a href="#" class="demo_header">ヘッダ型デモ</a></li>
  <li><a href="#" class="demo_footer">フッタ型デモ</a></li>
</ul>

　本文が大事なのであって、ウィジェットやメニューは添え物にすぎない。あったら便利程度のものが主客転倒し本文を読みづらく、あるいはまったく読めなくする。本文にカブる危険を冒してまで固定位置に配置する価値のあるものかどうかを一度よく考えてみるべきだと思う。

　SNS連携ウィジェットなどはタイトル見出し付近、あるいは本文末尾に通常配置すれば十分に用を足す。ヘッダメニューは、本文が短ければわざわざ固定配置するまでもなく、ちょっとスクロールすれば一番上まで到達できるし、本文が長い場合はメニューでスペースを占有させるより本文領域を広くとった方が読みやすくなる。

　固定配置を使う前に、それが本当に必要なものなのかよく考える必要があるだろう。

<script src="/js/jquery.js"></script>
<script>
$('a', $('.positionFixedDemo')).click(function(ev) {
  ev.preventDefault();
  var type = $(this).attr('class');
  var demoBlock = $('#demoBlock');
  if(!demoBlock.length) demoBlock = $('<div/>');
  if(type == demoBlock.attr('class')) {
    demoBlock.remove();
    return;
  }
  var widthValue, heightValue;
  var topValue = 'auto', leftValue = 'auto', bottomValue = 'auto';
  if(type == 'demo_horizontal') {
    widthValue = '300px';
    heightValue = '80px';
    leftValue = $(this).parents('article').offset().left + 'px';
    bottomValue = '10px';
  }
  else if(type == 'demo_vertical') {
    widthValue = '80px';
    heightValue = '300px';
    topValue = '30%';
    leftValue = $(this).parents('article').offset().left + 'px';
    bottomValue = '10px';
  }
  else if(type == 'demo_animate') {
    widthValue = 0;
    heightValue = 0;
    leftValue = $(this).parents('article').offset().left + $(this).parents('article').width() + 'px';
    bottomValue = '10px';
  }
  else if(type == 'demo_header') {
    widthValue = '100%';
    heightValue = '60px';
    topValue = 0;
  }
  else if(type == 'demo_footer') {
    widthValue = '100%';
    heightValue = '60px';
    bottomValue = 0;
  }
  var styles = {backgroundColor: 'red',
                height: heightValue,
                width: widthValue,
                opacity: '0.8',
                position: 'fixed',
                top: topValue,
                bottom: bottomValue,
                left: leftValue,
                border: '1px solid black'};
  demoBlock.css(styles);
  demoBlock.attr('class', type);
  demoBlock.attr('id', 'demoBlock');
  demoBlock.click(function() { demoBlock.remove(); });
  $('body').append(demoBlock);
  if(type == 'demo_animate') {
    demoBlock.animate({
      width: '300px', height: '300px', left: '-=300'
    });
  }
  return;
});
</script>
