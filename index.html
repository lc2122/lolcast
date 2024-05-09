<!DOCTYPE html>
<html>
<head>
    <title>M3U8 Player</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
    <video id="video"></video>
    <input type="text" id="url-input" placeholder="Enter m3u8 URL here">
    <button onclick="loadVideo()">Load Video</button>

    <script>
        var video = document.getElementById('video');
        var hls = new Hls();

        function loadVideo() {
            var url = document.getElementById('url-input').value;
            if(Hls.isSupported()) {
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    video.play();
                });
            }
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', function() {
                    video.play();
                });
            }
        }
    </script>
</body>
</html>
