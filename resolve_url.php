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

    // Handle complex M3U8 URL with query parameters
    if (strpos($actualUrl, '?') !== false) {
        $parts = parse_url($actualUrl);
        parse_str($parts['query'], $query_params);

        // Process the query parameters as needed
        // For example, you can handle the 'Policy' parameter
        if (isset($query_params['Policy'])) {
            $actualUrl = $parts['scheme'] . '://' . $parts['host'] . $parts['path'] . '?' . http_build_query($query_params);
        }
    }

    echo $actualUrl;
}
?>
