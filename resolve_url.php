<?php
if (isset($_GET['url'])) {
    $url = $_GET['url'];

    // Check if the input URL is a shortened URL
    if (preg_match('/^https:\/\/(is\.gd|bit\.ly)\//', $url)) {
        // Resolve the shortened URL to the original URL
        $response = file_get_contents($url, false, stream_context_create([
            'http' => [
                'method' => 'HEAD',
                'follow_location' => true
            ]
        ]));
        $actualUrl = stream_get_meta_data($http_response_header)['wrapper_data']['Location'];
    } else {
        $actualUrl = $url;
    }

    echo $actualUrl;
}
?>
