$(window).on('load', function() {
    $('#slideShow ul li:not(:first-child)').hide();
    var $img = $('#slideShow ul li:first-child img');

    var numberOfChildren = $('#slideShow ul li').length;
    var $ol = $('#slideShow').append('<ol/>').children('ol');
    for(var ii = 0; ii < numberOfChildren; ii++) {
        $ol.append('<li/>');
    }
    $('#slideShow ol li:nth-child(1)').addClass('active');

    $('#slideShow ol li').click(function() {
        var index = $(this).parent('ol').children().index(this) + 1;
        var $li = $('#slideShow ul li:nth-child(' + index + ')');
        // $('#slideShow ul').css({
        //     'width': $li.width() + 'px',
        //     'height': $li.height() + 'px'
        // });
        $('#slideShow ol li.active').removeClass('active');
        $(this).addClass('active');
        $('#slideShow ul li').hide();
        $li.fadeIn();
    });
});
