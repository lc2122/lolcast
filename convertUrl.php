<?php
$shortUrl = $_GET['url']; 

$apiUrl = "https://api.shrtco.de/v2/shorten?url=" . urlencode($shortUrl); 
$response = file_get_contents($apiUrl); 
$result = json_decode($response);

if ($result && $result->ok) { 
  $originalUrl = $result->result->full_short_link; 
  echo $originalUrl; 
} 
else {
  echo "Error occurred: " . ($result ? $result->error : "Unknown error"); 
} 
?>
