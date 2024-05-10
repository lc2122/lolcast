const videoPlayer = document.getElementById('videoPlayer');
const inputUrl = document.getElementById('inputUrl');

function playStream() {
    const url = inputUrl.value;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        videoPlayer.src = url;
        videoPlayer.addEventListener('loadedmetadata', function() {
            videoPlayer.play();
        });
    }
}
