<?php
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $m3u8_content = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000\n{$url}";
    $m3u8_filename = uniqid() . '.m3u8';
    file_put_contents($m3u8_filename, $m3u8_content);
    echo $m3u8_filename;
}
?>
