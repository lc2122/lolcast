var videoElement = document.getElementById('videoPlayer');
var videoUrl = '{단축url}'; // 단축url을 입력해주세요

if (Hls.isSupported()) {
  var hls = new Hls();
  hls.loadSource(videoUrl);
  hls.attachMedia(videoElement);
  hls.on(Hls.Events.MANIFEST_PARSED, function () {
    videoElement.play();
  });
} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
  videoElement.src = videoUrl;
  videoElement.addEventListener('loadedmetadata', function() {
    videoElement.play();
  });
}