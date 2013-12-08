function getQuery()
{
  var query = { 'tags': [], 'keywords': [] };
  var queryString = window.location.search.substring(1);
  var pair = queryString.split('&')[0].split('=');
  if(pair[0] == 'q') {
    var decodedString = decodeURIComponent(pair[1]).replace(/　/g, '+');
    var words = decodedString.split('+');
    words.forEach(function(word) {
      var tag = word.match(/^\[(.*)\]$/);
      if(tag) query.tags.push(tag[1]);
      else query.keywords.push(word);
    });
  }

  return query;
}

$(function() {
  var query = getQuery();
  var queryString = '';
  query.tags.forEach(function(tagName) {
    queryString += '[' + tagName + '] ';
  });
  queryString += query.keywords.join(' ');
  $('#globalNavi form input[type="search"]').val(queryString);

  var matchedPosts = [];
  $.getJSON('/search.json', function(posts) {
    posts.forEach(function(postInfo) {
      if(!postInfo.tags) postInfo.tags = [];
      var contains = true;
      query.tags.forEach(function(tagName) {
        contains = postInfo.tags.indexOf(tagName) != -1;
        if(!contains) return;
      });
      if(contains && !query.keywords.length) matchedPosts.push(postInfo);
      else if(contains || !query.tags.length) {
        var regexpString = '';
        if(query.keywords.length == 1) regexpString = query.keywords[0];
        else {
          console.log(111);
          query.keywords.forEach(function(keyword) {
            regexpString += '(?=.*' + keyword + ')';
          });
        }
        var regExp = new RegExp(regexpString, 'i');
        if(postInfo.content.match(regExp) != null) {
          matchedPosts.push(postInfo);
        }
      }
    });

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
          postInfo.tags.forEach(function(tagName, tagIndex, tags) {
            tagList += '<a href="/search.html?q=%5B' + tagName + '%5D">' + tagName + '</a>';
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
