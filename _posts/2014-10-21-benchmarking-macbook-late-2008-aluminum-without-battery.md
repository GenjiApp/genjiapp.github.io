---
title: MacBook Late 2008 アルミニウムにおけるバッテリィに関するCPU速度の抑制について
layout: post
tags: misc
---

- [MacBook および MacBook Pro：AC アダプタ使用時にバッテリーが取り外されるとプロセッサの速度が抑制される](http://support.apple.com/kb/HT2332?viewlocale=ja_JP)

　上記リンク（アップルのサポート記事）はもう見られなくなっているが、そのタイトルで解るように私がメインマシンとして使っているMacBook Late 2008 アルミニウムは、バッテリィが取り外されている時にプロセッサの速度が抑制される。

　では、いったいどのくらいパワーダウンするのか。[Xbench](http://xbench.com)というOS X用のベンチマークアプリケーションで検証してみた。マシンの環境は以下のとおり。

<table>
  <caption>マシン環境</caption>
  <tr>
    <th>機種</th>
    <td>MacBook Late 2008 アルミニウム</td>
  </tr>

  <tr>
    <th>OS</th>
    <td>OS X 10.10 Yosemite</td>
  </tr>

  <tr>
    <th>プロセッサ</th>
    <td>2GHz Intel Core 2 Duo</td>
  </tr>

  <tr>
    <th>メモリィ</th>
    <td>8GB DDR3</td>
  </tr>

  <tr>
    <th>ストーレッジ</th>
    <td>256GB SSD</td>
  </tr>
</table>

　ベンチマークは以下の3つの状況で比べる。

0. ACアダプタ接続 & バッテリィ
0. バッテリィのみでACアダプタ非接続
0. ACアダプタ接続のみでバッテリィ非装着（プロセッサ速度が抑制されると言われる状況）

　Xbenchのテスト項目は「Thread Test」以外すべて（Thread Testをすると止まるので）とした。

　ベンチマーク結果をかいつまんで列挙すると（詳細は結果は末尾に）、

<table>
  <caption>ベンチマーク結果概要</caption>
  <thead>
    <tr>
      <th colspan="2">状況</th>
      <th>総合スコア</th>
      <th>CPU Test</th>
    </tr>
  </thead>

  <tr>
    <th>1</th>
    <th>ACアダプタ接続 & バッテリィ</th>
    <td>80.73</td>
    <td>138.85</td>
  </tr>

  <tr>
    <th>2</th>
    <th>バッテリィのみ</th>
    <td>79.33</td>
    <td>137.94</td>
  </tr>

  <tr>
    <th>3</th>
    <th>ACアダプタ接続のみ</th>
    <td>56.79</td>
    <td>109.89</td>
  </tr>
</table>

　1の状況と2の状況は他のテスト項目でも似通っており、計測誤差の範囲だと思われる。

　問題となる3の状況と1の状況を比べると、CPUテストで約80％、総合では約70％程度までスコアが落ちてしまっている。

　もし「AC接続なしでバッテリィのみで駆動しているとき（2の状況）」にCPU速度が抑制されるのであれば、省電力という観点からうなずける挙動である。しかし実際はその場合であればCPU速度の抑制はなく、安定した電力供給が期待できる「バッテリィなしでAC接続のみ駆動のとき（3の状況）」だけでCPU速度が落ちる。

　不思議だ。

## バッテリィの膨張について

　MacBookのバッテリィは経年使用で膨張してしまう。膨張したバッテリィを使っていると、トラックパッドが下から押さえつけられるかたちになり、押し込む操作がやりにくく、あるいはできなくなるし、バッテリィカヴァをはじめ筐体が変形、破損してしまう可能性がある。

　私はMacBookを持ち歩くことはなくデスクトップとして使用しているので、バッテリィを抜いておけば一応運用はしていけるのだが、この不思議な挙動によってCPU速度が抑制されてしまい、70%の性能になってしまうのはいただけない。そのために追加で新しいバッテリィを買うはめになってしまうのである。

## ベンチマーク結果

### ACアダプタ接続 & バッテリィ

```
Results	80.73	
	System Info		
		Xbench Version		1.3
		System Version		10.10 (14A389)
		Physical RAM		8192 MB
		Model		MacBook5,1
		Drive Type		M4-CT256M4SSD2
	CPU Test	138.85	
		GCD Loop	221.87	11.70 Mops/sec
		Floating Point Basic	111.58	2.65 Gflop/sec
		vecLib FFT	91.05	3.00 Gflop/sec
		Floating Point Library	229.60	39.98 Mops/sec
	Memory Test	191.18	
		System	240.58	
			Allocate	937.33	3.44 Malloc/sec
			Fill	160.45	7801.66 MB/sec
			Copy	193.40	3994.63 MB/sec
		Stream	158.61	
			Copy	151.27	3124.39 MB/sec
			Scale	150.48	3108.91 MB/sec
			Add	168.51	3589.61 MB/sec
			Triad	165.89	3548.73 MB/sec
	Quartz Graphics Test	146.69	
		Line	171.77	11.44 Klines/sec [50% alpha]
		Rectangle	141.45	42.23 Krects/sec [50% alpha]
		Circle	126.94	10.35 Kcircles/sec [50% alpha]
		Bezier	150.75	3.80 Kbeziers/sec [50% alpha]
		Text	149.63	9.36 Kchars/sec
	OpenGL Graphics Test	65.53	
		Spinning Squares	65.53	83.13 frames/sec
	User Interface Test	27.15	
		Elements	27.15	124.60 refresh/sec
	Disk Test	335.50	
		Sequential	211.66	
			Uncached Write	351.27	215.67 MB/sec [4K blocks]
			Uncached Write	258.03	145.99 MB/sec [256K blocks]
			Uncached Read	103.08	30.17 MB/sec [4K blocks]
			Uncached Read	404.17	203.13 MB/sec [256K blocks]
		Random	808.49	
			Uncached Write	962.71	101.91 MB/sec [4K blocks]
			Uncached Write	473.68	151.64 MB/sec [256K blocks]
			Uncached Read	1309.69	9.28 MB/sec [4K blocks]
			Uncached Read	967.02	179.44 MB/sec [256K blocks]
```

### バッテリィのみでACアダプタ非接続

```
Results	79.33	
	System Info		
		Xbench Version		1.3
		System Version		10.10 (14A389)
		Physical RAM		8192 MB
		Model		MacBook5,1
		Drive Type		M4-CT256M4SSD2
	CPU Test	137.94	
		GCD Loop	222.68	11.74 Mops/sec
		Floating Point Basic	108.38	2.58 Gflop/sec
		vecLib FFT	91.56	3.02 Gflop/sec
		Floating Point Library	229.40	39.95 Mops/sec
	Memory Test	189.64	
		System	236.53	
			Allocate	926.16	3.40 Malloc/sec
			Fill	161.64	7859.10 MB/sec
			Copy	184.61	3812.97 MB/sec
		Stream	158.27	
			Copy	150.40	3106.46 MB/sec
			Scale	152.51	3150.87 MB/sec
			Add	166.80	3553.18 MB/sec
			Triad	164.68	3522.96 MB/sec
	Quartz Graphics Test	146.32	
		Line	166.76	11.10 Klines/sec [50% alpha]
		Rectangle	143.29	42.78 Krects/sec [50% alpha]
		Circle	127.88	10.42 Kcircles/sec [50% alpha]
		Bezier	149.52	3.77 Kbeziers/sec [50% alpha]
		Text	149.53	9.35 Kchars/sec
	OpenGL Graphics Test	65.34	
		Spinning Squares	65.34	82.89 frames/sec
	User Interface Test	26.28	
		Elements	26.28	120.61 refresh/sec
	Disk Test	342.37	
		Sequential	215.14	
			Uncached Write	358.19	219.93 MB/sec [4K blocks]
			Uncached Write	264.80	149.82 MB/sec [256K blocks]
			Uncached Read	104.66	30.63 MB/sec [4K blocks]
			Uncached Read	404.89	203.49 MB/sec [256K blocks]
		Random	837.94	
			Uncached Write	946.63	100.21 MB/sec [4K blocks]
			Uncached Write	538.49	172.39 MB/sec [256K blocks]
			Uncached Read	1275.60	9.04 MB/sec [4K blocks]
			Uncached Read	929.15	172.41 MB/sec [256K blocks]
```

### ACアダプタ接続のみでバッテリィ非装着

```
Results	56.79	
	System Info		
		Xbench Version		1.3
		System Version		10.10 (14A389)
		Physical RAM		8192 MB
		Model		MacBook5,1
		Drive Type		M4-CT256M4SSD2
	CPU Test	109.89	
		GCD Loop	180.21	9.50 Mops/sec
		Floating Point Basic	85.45	2.03 Gflop/sec
		vecLib FFT	72.90	2.40 Gflop/sec
		Floating Point Library	184.16	32.07 Mops/sec
	Memory Test	175.41	
		System	205.78	
			Allocate	733.65	2.69 Malloc/sec
			Fill	136.91	6656.87 MB/sec
			Copy	169.15	3493.80 MB/sec
		Stream	152.85	
			Copy	144.39	2982.28 MB/sec
			Scale	144.26	2980.36 MB/sec
			Add	162.90	3470.19 MB/sec
			Triad	161.99	3465.41 MB/sec
	Quartz Graphics Test	117.45	
		Line	141.32	9.41 Klines/sec [50% alpha]
		Rectangle	112.75	33.66 Krects/sec [50% alpha]
		Circle	101.60	8.28 Kcircles/sec [50% alpha]
		Bezier	120.70	3.04 Kbeziers/sec [50% alpha]
		Text	117.68	7.36 Kchars/sec
	OpenGL Graphics Test	52.84	
		Spinning Squares	52.84	67.03 frames/sec
	User Interface Test	16.55	
		Elements	16.55	75.96 refresh/sec
	Disk Test	333.78	
		Sequential	211.56	
			Uncached Write	298.13	183.05 MB/sec [4K blocks]
			Uncached Write	279.23	157.99 MB/sec [256K blocks]
			Uncached Read	105.21	30.79 MB/sec [4K blocks]
			Uncached Read	405.29	203.70 MB/sec [256K blocks]
		Random	790.46	
			Uncached Write	804.91	85.21 MB/sec [4K blocks]
			Uncached Write	512.91	164.20 MB/sec [256K blocks]
			Uncached Read	1262.68	8.95 MB/sec [4K blocks]
			Uncached Read	929.09	172.40 MB/sec [256K blocks]
```
