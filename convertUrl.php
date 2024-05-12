<?php
// 단축 URL을 받아서 원래 URL로 변환하는 로직을 구현합니다.
$shortUrl = $_GET['url'];

// 예시로 is.gd의 API를 사용한 변환 방법
$apiUrl = "https://is.gd/forward.php?format=simple&shorturl=" . $shortUrl;
$originalUrl = file_get_contents($apiUrl);

echo $originalUrl;
?>
