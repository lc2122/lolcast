$(window).on('load', function () {
    $('#m3u8-placeholder')[0].value = localStorage.getItem('m3u8-link') || '';
    $('#play-btn').on('click', function () {
        var shortenedUrl = $('#m3u8-placeholder')[0].value; // 단축 URL로 리다이렉트할 링크를 입력받음
        localStorage.setItem('m3u8-link', shortenedUrl);
        // 아래 코드에서 '#'+shortenedUrl 부분을 수정하여 단축 URL로 리다이렉트할 수 있습니다
        window.location.href = './player' + '#' + shortenedUrl;
    });
});