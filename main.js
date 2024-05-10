$(window).on('load', function () { 
    $('#m3u8-placeholder')[0].value = localStorage.getItem('m3u8-link') || ''; 
    $('#play-btn').on('click', function () {
        var shortenedUrl = $('#m3u8-placeholder')[0].value;
        localStorage.setItem('m3u8-link', shortenedUrl);
        window.location.href = './player?url=' + shortenedUrl;
    });
});
