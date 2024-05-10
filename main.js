$(window).on('load', function () {
    $('#m3u8-placeholder')[0].value = localStorage.getItem('m3u8-link') || '';
    $('#play-btn').on('click', function () {
        let inputUrl = $('#m3u8-placeholder')[0].value;
        let m3u8Url = inputUrl.includes('http') ? inputUrl : 'https://example.com/redirect/' + inputUrl; // 단축url이면서 m3u8 링크일 경우 대비
        localStorage.setItem('m3u8-link', m3u8Url);
        window.location.href = './player' + '#' + m3u8Url;
    });
});