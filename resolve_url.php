<?php
if (isset($_GET['url'])) {
    $url = $_GET['url'];

    // Check if the input URL is a shortened URL
    if (preg_match('/^https:\/\/(is\.gd|bit\.ly)\//', $url)) {
        // Resolve the shortened URL to the original URL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        $actualUrl = curl_exec($ch);
        curl_close($ch);
    } else {
        $actualUrl = $url;
    }

    echo $actualUrl;
}
?>
