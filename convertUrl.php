<?php
// 단축 URL을 받아서 원래 URL로 변환하는 로직을 구현합니다. 
$shortUrl = $_GET['url']; 

// 새로운 API를 사용하여 단축 URL을 원래 URL로 변환하는 방법 
$apiUrl = "https://api.shrtco.de/v2/shorten?url=" . $shortUrl; 
$response = file_get_contents($apiUrl); 
$result = json_decode($response);

if ($result->ok) { 
  $originalUrl = $result->result->full_short_link; 
  
  echo $originalUrl; } 
else {
  echo "Error occurred: " . $result->error; } ?>
