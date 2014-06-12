/**
 * URLのパラメタから検索文字列を取り出し、オブジェクトに格納して返す。
 * オブジェクトは'tags'、'keywords'キィを持つ。値は共に配列。
 * パラメタ名'q'を検索パラメタとする。
 * 検索パラメタは空白文字で区切られ、'[]'で囲まれたものはタグ名、
 * それ以外はキィワードと見なして、配列に格納する。
 */
function getQuery()
{
  // 返却するオブジェクトの初期化。
  var query = { 'tags': [], 'keywords': [] };

  // LocationオブジェクトのsearchプロパティはURLのパラメタ部の文字列。
  // searchプロパティは'?'を含むのでString.substring(1)で'?'を取り除き、
  // '&'でパラメタ名毎に分割して配列に入れる。
  var parameters = window.location.search.substring(1).split('&');

  $.each(parameters, function(index, parameterString) {
    var parameter = parameterString.split('=');
    var parameterName = parameter[0];
    var parameterValue = parameter[1];
    // パラメタ名'q'以外は無視。
    if(parameterName != 'q') return true;

    // パラメタ値をデコードし、全角空白は'+'に置換、
    // 連続する'+'はひとつに纏める。
    var decodedParameterValue = decodeURIComponent(parameterValue).replace(/　/g, '+').replace(/\++/g, '+');
    var words = decodedParameterValue.split('+');
    words.forEach(function(word) {
      var tag = word.match(/^\[(.*)\]$/);
      if(tag) query.tags.push(tag[1]);
      else query.keywords.push(word);
    });
  });

  return query;
}

$(function() {
  var query = getQuery();
  var queryString = '';  // input要素に表示する文字列
  query.tags.forEach(function(tagName) {
    queryString += '[' + tagName + '] ';
  });
  queryString += query.keywords.join(' ');
  $('#globalNavigation form input[type="search"]').val(queryString);

  var matchedPosts = [];
  $.getJSON('/search.json', function(posts) {
    posts.forEach(function(postInfo) {
      if(!postInfo.tags) postInfo.tags = [];
      var postTagNames = [];
      postInfo.tags.forEach(function(tag) {
        postTagNames.push(tag['tagName']);
      });

      // タグが複数指定されていた場合は、
      // そのすべてを含んだ記事のみを合致とする。
      var isContainingAllQueriedTags = false;
      $.each(query.tags, function(index, tagName) {
        isContainingAllQueriedTags = (postTagNames.indexOf(tagName) != -1);
        if(!isContainingAllQueriedTags) return false;
      });
      if(isContainingAllQueriedTags && !query.keywords.length) matchedPosts.push(postInfo);
      else if(isContainingAllQueriedTags || !query.tags.length) {
        var regexpString = '';
        if(query.keywords.length == 1) regexpString = query.keywords[0];
        else {
          query.keywords.forEach(function(keyword) {
            regexpString += '(?=.*' + keyword + ')';
          });
        }
        var regExp = new RegExp(regexpString, 'i');
        if(postInfo.title.match(regExp) != null || postInfo.content.match(regExp) != null) {
          matchedPosts.push(postInfo);
        }
      }
    });

    // 検索条件に合致した記事があった場合は、
    // ページ内の'#matchedList'に流し込む。
    if(matchedPosts.length) {
      var dl = $('<dl>');
      matchedPosts.forEach(function(postInfo) {
        if(!postInfo.title.length) postInfo.title = 'untitled';
        dl.append('<dt><a href="' + postInfo.url + '">' + postInfo.title + '</a></dt>');
        if(postInfo.date) {
          dl.append('<dd>' + postInfo.date.year + '年' + postInfo.date.month + '月' + postInfo.date.day + '日' + '</dd>');
        }
        if(postInfo.tags.length) {
          var dd = '<dd>tags: ';
          var tagList = '';
          postInfo.tags.forEach(function(tag, tagIndex, tags) {
            tagList += '<a href="/search.html?q=%5B' + tag['tagName'] + '%5D">' + tag['tagName'] + '<span>[' + tag['count'] + ']</span></a>';
            if(tagIndex < tags.length - 1) tagList += ', ';
          });
          dd += tagList;
          dd += '</dd>';
          dl.append(dd);
        }
      });
      $('#matchedList').append(dl);
    }
    else $('#matchedList').append('<p>no search result.</p>');
  });
});
